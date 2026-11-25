"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { clean } from "@/lib/format";
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
