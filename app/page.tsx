import { createPublicGroup } from "@/app/actions";
import { CreateGroupForm } from "@/components/CreateGroupForm";

// Qualquer pessoa cria um grupo aqui, sem cadastro. Quem participa entra pelo próprio link (/p/...).
export default function Home() {
  return (
    <CreateGroupForm
      create={createPublicGroup}
      intro="Monte o amigo secreto em 2 passos, sem cadastro. O nome aparece no link de cada participante."
    />
  );
}
