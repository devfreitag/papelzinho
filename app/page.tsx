import { redirect } from "next/navigation";

// Não há página pública: quem participa entra pelo próprio link (/p/...).
export default function Home() {
  redirect("/admin");
}
