import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { CopyButton } from "@/components/CopyButton";
import { DeleteGroup } from "@/components/DeleteGroup";
import { EditGroupForm } from "@/components/EditGroupForm";
import { DrawnChip, Header, SectionTag } from "@/components/ui";
import { box, btnDark, btnText, chip, heading, screenWide, title } from "@/components/styles";

export const metadata = { title: "Admin · grupo" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminGroupPage({ params }: PageProps<"/admin/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = db();
  const { data: group, error } = await supabase
    .from("groups")
    .select("id, name, budget, exchange_date, message, admin_token, drawn_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!group) notFound();

  const { data: people, error: pErr } = await supabase
    .from("participants")
    .select("opened_at")
    .eq("group_id", id);
  if (pErr) throw new Error(pErr.message);
  const participants = people ?? [];
  const opened = participants.filter((p) => p.opened_at).length;

  return (
    <>
      <Header right="Admin" />
      <main className={screenWide}>
        <Link href="/admin" className={btnText}>← Todos os grupos</Link>

        <div>
          <SectionTag>Grupo</SectionTag>
          <h1 className={title}>{group.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <DrawnChip drawn={!!group.drawn_at} />
            <span className={`${chip} bg-white`}>
              {group.drawn_at ? `${opened}/${participants.length} abriram` : `${participants.length} pessoas`}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="min-w-0">
            <EditGroupForm
              id={group.id}
              name={group.name}
              budget={group.budget}
              exchangeDate={group.exchange_date}
              message={group.message}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className={`${box} flex flex-col gap-4 p-5`}>
              <h2 className={heading}>Painel do organizador</h2>
              <p className="text-body">
                Participantes, listas de desejos e links. Não mostra quem tirou quem, mas se abrir o link de alguém, você
                vê o resultado daquela pessoa.
              </p>
              <Link href={`/g/${group.admin_token}`} className={btnDark}>Abrir painel →</Link>
              <CopyButton path={`/g/${group.admin_token}`}>Copiar link do painel</CopyButton>
            </div>

            <DeleteGroup id={group.id} name={group.name} />
          </div>
        </div>
      </main>
    </>
  );
}
