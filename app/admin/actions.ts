"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { clean } from "@/lib/format";
import { drawPairs } from "@/lib/draw";
import { newToken } from "@/lib/tokens";
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

  const name = clean(formData.get("name"), 80);
  if (!name) return { error: "Dê um nome para o grupo." };

  const names = [
    ...new Set(formData.getAll("names").map((n) => clean(n, 60)).filter(Boolean)),
  ];
  if (names.length < 3) return { error: "Precisa de pelo menos 3 participantes (nomes diferentes)." };
  if (names.length > 100) return { error: "Máximo de 100 participantes." };

  const date = clean(formData.get("exchange_date"), 10);
  const admin_token = newToken();

  const supabase = db();
  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name,
      budget: clean(formData.get("budget"), 40) || null,
      exchange_date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      message: clean(formData.get("message"), 500) || null,
      admin_token,
    })
    .select("id")
    .single();
  if (error || !group) return { error: "Não consegui criar o grupo. Tente de novo." };

  const { error: pErr } = await supabase
    .from("participants")
    .insert(names.map((n) => ({ group_id: group.id, name: n, token: newToken() })));
  if (pErr) {
    await supabase.from("groups").delete().eq("id", group.id);
    return { error: "Não consegui salvar os participantes. Tente de novo." };
  }

  revalidatePath("/admin");
  redirect(`/admin/${group.id}`);
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
export async function redrawGroup(id: string): Promise<void> {
  await requireAdmin();
  if (!UUID.test(id)) return;
  const supabase = db();

  const { data: group } = await supabase.from("groups").select("admin_token, drawn_at").eq("id", id).maybeSingle();
  if (!group?.drawn_at) return; // só refaz um sorteio que já existe

  const { data: people } = await supabase.from("participants").select("id").eq("group_id", id);
  if (!people || people.length < 3) return;

  const pairs = drawPairs(people.map((p) => p.id));
  await supabase.from("draws").delete().eq("group_id", id);
  const { error } = await supabase
    .from("draws")
    .insert(pairs.map(([giver_id, receiver_id]) => ({ group_id: id, giver_id, receiver_id })));
  if (error) throw new Error("Falha ao gravar o sorteio");
  const { error: oErr } = await supabase.from("participants").update({ opened_at: null }).eq("group_id", id);
  if (oErr) throw new Error("Falha ao limpar quem já abriu");

  revalidatePath(`/admin/${id}`);
  revalidatePath(`/g/${group.admin_token}`);
}
