import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import { wishItems } from "@/lib/format";
import { Header, SectionTag } from "@/components/ui";
import { WishlistForm } from "@/components/WishlistForm";
import { btnText, lead, screen, title } from "@/components/styles";

export const metadata = { title: "Minha lista de desejos" };

export default async function WishlistPage({ params }: PageProps<"/p/[token]/lista">) {
  const { token } = await params;

  const { data: me, error } = await db()
    .from("participants")
    .select("wishlist, dislikes, groups!participants_group_id_fkey(name)")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!me) notFound();
  const group = Array.isArray(me.groups) ? me.groups[0] : me.groups;

  return (
    <>
      <Header right={group?.name} />
      <main className={screen}>
        <Link href={`/p/${token}`} className={btnText}>← Voltar</Link>
        <div>
          <SectionTag>Só quem tirou você e quem organiza leem</SectionTag>
          <h1 className={title}>Minha lista de desejos</h1>
          <p className={`${lead} mt-4`}>Você não vê quem tirou você. Pode editar quando quiser.</p>
        </div>
        <WishlistForm token={token} items={wishItems(me.wishlist)} dislikes={me.dislikes} />
      </main>
    </>
  );
}
