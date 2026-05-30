import { redirect } from "next/navigation"

import { AdminHeader } from "@/components/admin/admin-header"
import { getAdminUser } from "@/lib/admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authoritative gate: only admins (role or bootstrap email) get in. Bootstrap
  // admins are promoted to the `admin` role here on first visit.
  const admin = await getAdminUser()
  if (!admin) redirect("/")

  return (
    <>
      <AdminHeader />
      <main className="container py-8">{children}</main>
    </>
  )
}
