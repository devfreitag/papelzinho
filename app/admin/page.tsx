import Link from "next/link";
import { db } from "@/lib/supabase";
import { adminLogout } from "@/app/admin/actions";
import { adminPassword, isAdmin } from "@/lib/admin-auth";
import { shortDate } from "@/lib/format";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { DrawnChip, Header, SectionTag } from "@/components/ui";
import { boxLink, btnPrimary, btnText, chip, heading, lead, screen, screenWide, title } from "@/components/styles";

// Ciclo de 4: em 1, 2 ou 3 colunas, vizinhos nunca têm a mesma cor.
const tones = ["bg-yellow text-ink", "bg-white text-ink", "bg-green text-ink", "bg-red text-white"];

export const metadata = { title: "Admin" };
// Depende de env e cookie em runtime: nunca pré-renderizar no build.
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  if (!adminPassword()) {
    return (
      <>
        <Header right="Admin" />
        <main className={screen}>
          <h1 className={title}>Admin desligado</h1>
          <p className={lead}>
            Defina a variável <strong>ADMIN_PASSWORD</strong> no servidor (no <strong>.env.local</strong> e na Vercel) e
            recarregue esta página.
          </p>
        </main>
      </>
    );
  }

  if (!(await isAdmin())) {
    return (
      <>
        <Header right="Admin" />
        <main className={screen}>
          <div>
            <SectionTag>Acesso restrito</SectionTag>
            <h1 className={title}>Área do admin</h1>
            <p className={`${lead} mt-4`}>Só para quem cuida do papelzinho.</p>
          </div>
          <AdminLoginForm />
        </main>
      </>
    );
  }

  const { data, error } = await db()
    .from("groups")
    .select(
      "id, name, budget, exchange_date, drawn_at, created_at, participants!participants_group_id_fkey(id, opened_at)",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const groups = data ?? [];
  const drawnCount = groups.filter((g) => g.drawn_at).length;

  return (
    <>
      <Header
        right={
          <form action={adminLogout}>
            <button className={btnText}>Sair</button>
          </form>
        }
      />
      <main className={screenWide}>
        <div>
          <SectionTag>Admin</SectionTag>
          <h1 className={title}>Grupos</h1>
          <p className={`${lead} mt-4`}>
            {groups.length} {groups.length === 1 ? "grupo" : "grupos"} · {drawnCount} já sorteado{drawnCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="sm:max-w-72">
          <Link href="/admin/novo" className={btnPrimary}>Criar grupo →</Link>
        </div>

        {groups.length === 0 && <p className={lead}>Nenhum grupo criado ainda.</p>}

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g, i) => {
            const people = g.participants ?? [];
            const opened = people.filter((p) => p.opened_at).length;
            return (
              <li key={g.id} className="min-w-0">
                <Link href={`/admin/${g.id}`} className={`${boxLink} ${tones[i % tones.length]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`${heading} min-w-0`}>{g.name}</div>
                    <span aria-hidden="true" className="text-2xl font-bold leading-none">→</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">
                    Criado em {new Date(g.created_at).toLocaleDateString("pt-BR")}
                    {g.exchange_date && ` · troca em ${shortDate(g.exchange_date)}`}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <DrawnChip drawn={!!g.drawn_at} />
                    <span className={`${chip} bg-white text-ink`}>
                      {people.length} {people.length === 1 ? "pessoa" : "pessoas"}
                    </span>
                    {g.drawn_at && <span className={`${chip} bg-white text-ink`}>{opened}/{people.length} abriram</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
