import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { listIsComplete, shortDate, wishItems } from "@/lib/format";
import { revealMine } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Header, SectionTag } from "@/components/ui";
import { WishItems } from "@/components/WishItems";
import { WishlistForm } from "@/components/WishlistForm";
import { box, boxDark, btnPrimary, btnText, heading, label, screen, title } from "@/components/styles";

export const metadata = { title: "Seu amigo secreto" };

/** Nome grande, mas que não estoura a largura do cartão. */
function nameSize(name: string) {
  if (name.length <= 8) return "text-[clamp(48px,12vw,96px)]";
  if (name.length <= 12) return "text-[clamp(36px,9vw,72px)]";
  return "text-[clamp(28px,6vw,48px)]";
}

export default async function ParticipantPage({ params }: PageProps<"/p/[token]">) {
  const { token } = await params;
  const supabase = db();

  const { data: me, error } = await supabase
    .from("participants")
    .select(
      "id, group_id, name, wishlist, dislikes, opened_at, groups!participants_group_id_fkey(name, budget, exchange_date, message, drawn_at)",
    )
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!me) notFound();
  const group = Array.isArray(me.groups) ? me.groups[0] : me.groups;
  if (!group) notFound();

  const when = group.exchange_date ? `Troca em ${shortDate(group.exchange_date)}` : null;
  const budget = group.budget ? `${when ? "valor" : "Valor"} sugerido ${group.budget}` : null;

  const drawn = !!group.drawn_at;
  const ready = listIsComplete(me);

  // Só dá para revelar quando todo mundo do grupo terminou a lista.
  let pendingLists = 0;
  if (drawn && ready && !me.opened_at) {
    const { data: everyone, error: eErr } = await supabase
      .from("participants")
      .select("wishlist, dislikes")
      .eq("group_id", me.group_id);
    if (eErr) throw new Error(eErr.message);
    pendingLists = (everyone ?? []).filter((p) => !listIsComplete(p)).length;
  }
  const waitingOthers = pendingLists > 0;

  let friend: { name: string; wishlist: string; dislikes: string } | null = null;
  if (drawn && me.opened_at) {
    const { data: draw, error: dErr } = await supabase
      .from("draws")
      .select("receiver:participants!draws_receiver_id_fkey(name, wishlist, dislikes)")
      .eq("giver_id", me.id)
      .maybeSingle();
    if (dErr) throw new Error(dErr.message);
    const r = draw?.receiver;
    friend = (Array.isArray(r) ? r[0] : r) ?? null;
  }

  const listLink = (
    <Link href={`/p/${token}/lista`} className={btnPrimary}>
      {ready ? "Editar minha lista de desejos →" : "Escrever minha lista de desejos →"}
    </Link>
  );

  // Revelado: "Quem eu tirei"
  if (friend) {
    const items = wishItems(friend.wishlist);
    return (
      <>
        <Header right={group.name} />
        <main className={screen}>
          <div className={`${boxDark} p-5 md:p-8`}>
            <h1>
              <span className={`${label} block`}>Você tirou</span>
              <span
                className={`mt-2 block font-bold uppercase leading-[0.95] tracking-[-0.03em] text-yellow [overflow-wrap:anywhere] ${nameSize(friend.name)}`}
              >
                {friend.name}
              </span>
            </h1>
            {(when || budget) && <p className="mt-4">{[when, budget].filter(Boolean).join(" · ")}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className={heading}>O que {friend.name} gostaria de ganhar</h2>
            <div className={box}>
              {items.length === 0 && <div className="p-4 text-body">{friend.name} ainda não preencheu a lista.</div>}
              <WishItems items={items} />
              {friend.dislikes && (
                <div className={`p-4 [overflow-wrap:anywhere] ${items.length === 0 ? "border-t-[3px] border-ink" : ""}`}>
                  <strong>✕ Prefere não ganhar:</strong> {friend.dislikes}
                </div>
              )}
            </div>
          </div>

          {listLink}
        </main>
      </>
    );
  }

  // Antes de revelar (ou antes do sorteio)
  const intro = [when, budget].filter(Boolean).join(", ");
  return (
    <>
      <Header />
      <main className={screen}>
        <div>
          <SectionTag>{group.name}</SectionTag>
          <h1 className={title}>Oi, {me.name}.</h1>
          <p className="mt-4 text-body">
            {intro ? `${intro}. ` : ""}
            {drawn
              ? ready
                ? waitingOthers
                  ? `Sua lista está pronta. O nome só aparece quando todo mundo terminar a lista: ${pendingLists === 1 ? "falta 1 pessoa" : `faltam ${pendingLists} pessoas`}. Volte neste link mais tarde.`
                  : "Sua lista está pronta. Agora é só revelar."
                : "Seu amigo secreto já foi sorteado. Antes de revelar, conte o que você quer e o que não quer ganhar."
              : "O sorteio ainda não foi feito. Volte neste link mais tarde."}
          </p>
        </div>

        {group.message && (
          <div className={`${box} p-4 text-body [overflow-wrap:anywhere]`}>
            <strong className="text-ink">Recado do grupo:</strong> {group.message}
          </div>
        )}

        {drawn && !ready ? (
          <section className={`${box} flex flex-col gap-6 p-5`}>
            <div>
              <SectionTag>Só quem tirou você e quem organiza leem</SectionTag>
              <h2 className={heading}>Minha lista de desejos</h2>
            </div>
            <WishlistForm
              token={token}
              items={wishItems(me.wishlist)}
              dislikes={me.dislikes}
              submitLabel="Salvar e continuar →"
            />
          </section>
        ) : drawn ? (
          <>
            <div className="flex flex-col items-center gap-4 rounded-[4px] border-[3px] border-ink bg-green p-8 text-center shadow-hard">
              <div className={label}>Você tirou</div>
              <div className="text-6xl font-bold leading-none tracking-[0.12em]" role="img" aria-label="nome escondido">
                ?????
              </div>
              <p className="font-medium">
                {waitingOthers
                  ? "Aguardando todo mundo terminar a lista de desejos."
                  : "Só você vê. Depois de revelar, o nome fica salvo neste link."}
              </p>
            </div>
            {!waitingOthers && (
              <form action={revealMine.bind(null, token)}>
                <SubmitButton>Toque para revelar →</SubmitButton>
              </form>
            )}
            <Link href={`/p/${token}/lista`} className={btnText}>Editar minha lista</Link>
          </>
        ) : (
          listLink
        )}
      </main>
    </>
  );
}
