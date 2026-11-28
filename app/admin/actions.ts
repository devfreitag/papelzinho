"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { clean } from "@/lib/format";
import { drawPairs } from "@/lib/draw";
import { insertGroup } from "@/lib/groups";
import { adminPassword, endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { passwordMatches } from "@/lib/admin-token";
import type { FormState } from "@/app/actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function adminLogin(_: FormState, formData: FormData): Promise<FormState> {
  const pw = adminPassword();
  if (!pw) return { error: "O admin está desligado: defina ADMIN_PASSWORD no servidor." };
  if (!passwordMatches(String(formData.get("password") ?? ""), pw)) {
    await new Promise((r) => setTimeout(r, 700)); // esfria tentativa em sequência
    return { error: "Senha incorreta." };
  }
  await startSession();
  redirect("/admin");
}

export async function adminLogout() {
  await endSession();
  redirect("/admin");
}

export async function createGroup(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const res = await insertGroup(formData);
  if (!res.group) return { error: res.error };

  revalidatePath("/admin");
  redirect(`/admin/${res.group.id}`);
}

export async function updateGroup(id: string, _: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!UUID.test(id)) return { error: "Grupo inválido." };

  const name = clean(formData.get("name"), 80);
  if (!name) return { error: "O grupo precisa de um nome." };
  const date = clean(formData.get("exchange_date"), 10);

  const { error } = await db()
    .from("groups")
    .update({
      name,
      budget: clean(formData.get("budget"), 40) || null,
      exchange_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      message: clean(formData.get("message"), 500) || null,
    })
    .eq("id", id);
  if (error) return { error: "Não consegui salvar. Tente de novo." };

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  return { ok: true };
}

/** Apaga o grupo; participantes e sorteio vão junto (on delete cascade). */
export async function deleteGroup(id: string): Promise<void> {
  await requireAdmin();
  if (!UUID.test(id)) return;
  const { error } = await db().from("groups").delete().eq("id", id);
  if (error) throw new Error("Falha ao excluir o grupo");
  revalidatePath("/admin");
  redirect("/admin");
}

/**
 * Refaz o sorteio mesmo depois de alguém ter aberto o link, e marca todos como "não abriu".
 * Não mexe nas listas de desejos nem nos links dos participantes.
 */
export async function redrawGroup(id: string): Promise<FormState> {
  await requireAdmin();
  if (!UUID.test(id)) return { error: "Grupo inválido." };
  const supabase = db();

  const { data: group } = await supabase.from("groups").select("admin_token, drawn_at").eq("id", id).maybeSingle();
  if (!group?.drawn_at) return { error: "Este grupo ainda não foi sorteado." };

  const { data: people } = await supabase.from("participants").select("id").eq("group_id", id);
  if (!people || people.length < 3) return { error: "O grupo precisa ter pelo menos 3 pessoas." };

  const pairs = drawPairs(people.map((p) => p.id));
  await supabase.from("draws").delete().eq("group_id", id);
  const { error } = await supabase
    .from("draws")
    .insert(pairs.map(([giver_id, receiver_id]) => ({ group_id: id, giver_id, receiver_id })));
  if (error) return { error: "Não consegui gravar o novo sorteio. Tente de novo." };
  const { error: oErr } = await supabase.from("participants").update({ opened_at: null }).eq("group_id", id);
  if (oErr) return { error: "O sorteio foi refeito, mas não consegui limpar quem já abriu. Tente de novo." };

  revalidatePath(`/admin/${id}`);
  revalidatePath(`/g/${group.admin_token}`);
  return { ok: true };
}
