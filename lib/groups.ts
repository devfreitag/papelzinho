import "server-only";
import { db } from "./supabase";
import { clean } from "./format";
import { newToken } from "./tokens";

export const MAX_PARTICIPANTS = 100;

type Created = { group: { id: string; admin_token: string }; error?: undefined };
type Failed = { error: string; group?: undefined };

/** Valida o formulário de criação e grava o grupo com os participantes. Usado pelo admin e pela página inicial. */
export async function insertGroup(
  formData: FormData,
  extra: { creator_ip_hash?: string } = {},
): Promise<Created | Failed> {
  const name = clean(formData.get("name"), 80);
  if (!name) return { error: "Dê um nome para o grupo." };

  const names = [
    ...new Set(formData.getAll("names").map((n) => clean(n, 60)).filter(Boolean)),
  ];
  if (names.length < 3) return { error: "Precisa de pelo menos 3 participantes (nomes diferentes)." };
  if (names.length > MAX_PARTICIPANTS) return { error: `Máximo de ${MAX_PARTICIPANTS} participantes.` };

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
      ...extra,
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

  return { group: { id: group.id, admin_token } };
}
