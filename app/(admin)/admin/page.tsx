import { desc } from "drizzle-orm"

import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { getAdminUser } from "@/lib/admin"
import { UsersTable, type AdminUser } from "@/components/admin/users-table"

export const metadata = { title: "Admin · Users" }

export default async function AdminUsersPage() {
  // Layout already gated this route; getAdminUser is cheap (session is cached)
  // and gives us the current admin's id to flag their own row in the table.
  const admin = await getAdminUser()

  const rows = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      image: userTable.image,
      role: userTable.role,
      banned: userTable.banned,
      banReason: userTable.banReason,
      banExpires: userTable.banExpires,
      emailVerified: userTable.emailVerified,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))

  const users: AdminUser[] = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role === "admin" ? "admin" : "user",
    banned: u.banned,
    banReason: u.banReason,
    banExpires: u.banExpires ? u.banExpires.toISOString() : null,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
  }))

  const adminCount = users.filter((u) => u.role === "admin").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "user" : "users"} · {adminCount}{" "}
          admin{adminCount === 1 ? "" : "s"}
        </p>
      </div>
      <UsersTable users={users} currentUserId={admin!.id} />
    </div>
  )
}
