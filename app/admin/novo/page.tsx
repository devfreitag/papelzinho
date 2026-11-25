import { requireAdmin } from "@/lib/admin-auth";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export const metadata = { title: "Admin · novo grupo" };

export default async function NewGroupPage() {
  await requireAdmin();
  return <CreateGroupForm />;
}
