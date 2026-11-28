import { requireAdmin } from "@/lib/admin-auth";
import { createGroup } from "@/app/admin/actions";
import { CreateGroupForm } from "@/components/CreateGroupForm";

export const metadata = { title: "Admin · novo grupo" };

export default async function NewGroupPage() {
  await requireAdmin();
  return <CreateGroupForm create={createGroup} headerRight="Admin" backHref="/admin" />;
}
