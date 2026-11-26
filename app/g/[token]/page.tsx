import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase";
import { listIsComplete, shortDate } from "@/lib/format";
import { addParticipant, removeParticipant, runDraw } from "@/app/actions";
import { ParticipantRow } from "@/components/ParticipantRow";
import { ShareButtons } from "@/components/ShareButtons";
import { SubmitButton } from "@/components/SubmitButton";
import { Header, ProgressBar, SectionTag, XIcon } from "@/components/ui";
import { box, boxDark, btnAdd, btnIcon, btnText, field, heading, label, lead, meta, screenWide, title } from "@/components/styles";

export const metadata = { title: "Painel do organizador" };

export default async function AdminPage({ params }: PageProps<"/g/[token]">) {
  const { token } = await params;
  const supabase = db();

  const { data: group, error } = await supabase
    .from("groups")
    .select("id, name, exchange_date, drawn_at")
    .eq("admin_token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!group) notFound();

  const { data: people, error: pErr } = await supabase
    .from("participants")
    .select("id, name, token, opened_at, wishlist, dislikes")
    .eq("group_id", group.id)
    .order("created_at");
  if (pErr) throw new Error(pErr.message);
  const participants = people ?? [];

  // Só quem está logado como admin tem para onde voltar; o link do painel sozinho não dá acesso ao /admin.
  const backToGroup = (await isAdmin()) ? (
    <Link href={`/admin/${group.id}`} className={btnText}>← Voltar ao grupo</Link>
  ) : null;

  const drawn = !!group.drawn_at;
  const openedCount = participants.filter((p) => p.opened_at).length;
  const missing = participants.length - openedCount;
  const listCount = participants.filter(listIsComplete).length;
  const when = group.exchange_date ? `Troca em ${shortDate(group.exchange_date)}` : null;

  const keepLink = (
    <div className={`${box} p-5`}>
      <h2 className={heading}>Guarde este endereço</h2>
      <p className="mt-2 text-body">
        Este é o seu painel: salve o link para voltar. Evite abrir os links dos outros, porque você veria quem eles
        tiraram.
      </p>
    </div>
  );

  if (!drawn) {
    return (
      <>
        <Header right="Painel" />
        <main className={screenWide}>
          {backToGroup}
          <div>
            <SectionTag>{group.name}</SectionTag>
            <h1 className={title}>Quem participa?</h1>
            {when && <p className={`${lead} mt-4`}>{when}</p>}
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            <div className="flex min-w-0 flex-col gap-6">
              <form action={addParticipant.bind(null, token)} className="flex gap-3">
                <label htmlFor="novo" className="sr-only">Nome do participante</label>
                <input id="novo" name="name" required maxLength={60} placeholder="Adicionar nome" className={field} />
                <button className={btnAdd}>Incluir</button>
              </form>

              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div className={label}>{participants.length} pessoas</div>
                  <div className={meta}>mínimo de 3</div>
                </div>
                <ul className={box}>
                  {participants.map((p) => (
                    <ParticipantRow
                      key={p.id}
                      person={p}
                      action={
                        participants.length > 3 && (
                          <form action={removeParticipant.bind(null, token, p.id)} className="py-2 pr-2">
                            <button aria-label={`Remover ${p.name}`} className={btnIcon}>
                              <XIcon />
                            </button>
                          </form>
                        )
                      }
                    />
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6">
              {keepLink}
              <form action={runDraw.bind(null, token)}>
                <SubmitButton>Sortear agora →</SubmitButton>
              </form>
              <p className="text-body">Depois de sortear, cada pessoa recebe um link só dela.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header right="Painel" />
      <main className={screenWide}>
        {backToGroup}
        <div>
          <SectionTag>{group.name}</SectionTag>
          <h1 className={title}>Sorteio feito</h1>
          {when && <p className={`${lead} mt-4`}>{when}</p>}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6">
            <div className={`${boxDark} flex flex-col gap-4 p-5`}>
              <div>
                <div className="text-[clamp(40px,6vw,72px)] font-bold leading-none tracking-[-0.03em] text-yellow">
                  {openedCount}/{participants.length}
                </div>
                <div className={`${label} mt-2`}>
                  abriram o link · {missing === 0 ? "todos abriram" : `${missing} ${missing === 1 ? "falta" : "faltam"}`}
                </div>
              </div>
              <ProgressBar value={openedCount} max={participants.length} label="Pessoas que abriram o link" />
              <p>
                <strong>Nem você sabe quem tirou quem.</strong> Cada resultado só aparece no link da própria pessoa.
              </p>
            </div>

            {keepLink}

            {openedCount === 0 && (
              <form action={runDraw.bind(null, token)}>
                <SubmitButton>Refazer sorteio</SubmitButton>
              </form>
            )}
            <p className="text-sm text-body">Refazer o sorteio fica bloqueado depois que alguém abre o link.</p>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <h2 className={label}>{listCount}/{participants.length} preencheram a lista</h2>
            <ul className={box}>
              {participants.map((p) => (
                <ParticipantRow key={p.id} person={p} showOpened>
                  <ShareButtons name={p.name} token={p.token} groupName={group.name} />
                </ParticipantRow>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
