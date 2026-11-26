"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { drawPairs } from "@/lib/draw";
import { clean, itemWithBadLink, listIsComplete, wishItems, wishText } from "@/lib/format";
import { newToken } from "@/lib/tokens";

export type FormState = { error?: string; ok?: boolean } | undefined;

async function groupByAdminToken(adminToken: string) {
  const { data } = await db()
    .from("groups")
    .select("id, drawn_at")
    .eq("admin_token", adminToken)
    .maybeSingle();
  return data;
}

export async function addParticipant(adminToken: string, formData: FormData) {
  const name = clean(formData.get("name"), 60);
  const group = await groupByAdminToken(adminToken);
  if (!group || group.drawn_at || !name) return;
  await db()
    .from("participants")
    .insert({ group_id: group.id, name, token: newToken() });
  revalidatePath(`/g/${adminToken}`);
}

export async function removeParticipant(adminToken: string, participantId: string) {
  const supabase = db();
  const group = await groupByAdminToken(adminToken);
  if (!group || group.drawn_at) return;
  const { count } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("group_id", group.id);
  if ((count ?? 0) <= 3) return; // mantém o mínimo de 3
  await supabase.from("participants").delete().eq("id", participantId).eq("group_id", group.id);
  revalidatePath(`/g/${adminToken}`);
}

/** Sorteia (ou refaz, se ninguém abriu o link ainda). O resultado nunca volta para o navegador. */
export async function runDraw(adminToken: string): Promise<void> {
  const supabase = db();
  const group = await groupByAdminToken(adminToken);
  if (!group) return;

  const { data: people } = await supabase
    .from("participants")
    .select("id, opened_at")
    .eq("group_id", group.id);
  if (!people || people.length < 3) return;
  if (people.some((p) => p.opened_at)) return; // alguém já viu: travado

  const pairs = drawPairs(people.map((p) => p.id));
  await supabase.from("draws").delete().eq("group_id", group.id);
  const { error } = await supabase
    .from("draws")
    .insert(pairs.map(([giver_id, receiver_id]) => ({ group_id: group.id, giver_id, receiver_id })));
  if (error) throw new Error("Falha ao gravar o sorteio");
  await supabase.from("groups").update({ drawn_at: new Date().toISOString() }).eq("id", group.id);
  revalidatePath(`/g/${adminToken}`);
}

/** Marca o link como aberto, se já pode revelar. Devolve o id da pessoa, ou null se ainda não pode. */
async function openMine(token: string): Promise<string | null> {
  const supabase = db();
  const { data: me, error } = await supabase
    .from("participants")
    .select("id, group_id, wishlist, dislikes, groups!participants_group_id_fkey(drawn_at)")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const group = Array.isArray(me?.groups) ? me.groups[0] : me?.groups;
  if (!me || !group?.drawn_at) return null; // só revela depois do sorteio
  if (!listIsComplete(me)) return null; // e depois de preencher a própria lista
  const { data: everyone, error: eErr } = await supabase
    .from("participants")
    .select("wishlist, dislikes")
    .eq("group_id", me.group_id);
  if (eErr) throw new Error(eErr.message);
  if (!everyone?.every(listIsComplete)) return null; // e só quando todo o grupo tiver terminado a lista
  await supabase
    .from("participants")
    .update({ opened_at: new Date().toISOString() })
    .eq("id", me.id)
    .is("opened_at", null);
  return me.id;
}

/**
 * Para a raspadinha: abre o link e devolve só o nome de quem a pessoa tirou.
 * Não revalida a página, senão ela trocaria de tela no meio da raspagem; o cliente atualiza no fim.
 */
export async function scratchReveal(token: string): Promise<{ name: string } | null> {
  const id = await openMine(token);
  if (!id) return null;
  const { data: draw, error } = await db()
    .from("draws")
    .select("receiver:participants!draws_receiver_id_fkey(name)")
    .eq("giver_id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const r = draw?.receiver;
  const receiver = Array.isArray(r) ? r[0] : r;
  return receiver ? { name: receiver.name } : null;
}

export async function saveWishlist(token: string, _: FormState, formData: FormData): Promise<FormState> {
  // Recusa em vez de cortar: cortar no meio estragaria um link.
  const typed = String(formData.get("wishlist") ?? "");
  if (typed.length > 60_000) return { error: "A lista ficou grande demais. Tire alguns itens." };
  const items = wishItems(typed);
  const dislikes = clean(formData.get("dislikes"), 1000);
  if (items.length === 0) return { error: "Inclua pelo menos um item que você quer ganhar." };
  if (items.length > 30) return { error: "Deixe no máximo 30 itens na lista." };
  const long = items.find((it) => it.name.length > 120);
  if (long) return { error: `O item "${long.name.slice(0, 30)}…" está longo demais (até 120 letras).` };
  const bad = itemWithBadLink(typed);
  if (bad) return { error: `O link de "${bad}" não parece válido. Confira ou apague.` };
  if (!dislikes) return { error: "Diga o que prefere não ganhar, ou marque que não tem nada a evitar." };

  const { error } = await db()
    .from("participants")
    .update({ wishlist: wishText(items), dislikes })
    .eq("token", token);
  if (error) return { error: "Não consegui salvar." };
  revalidatePath(`/p/${token}`);
  redirect(`/p/${token}`);
}
