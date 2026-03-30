"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Link from "next/link";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoadingUsers(false);
  }

  async function toggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-14 flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{
              border: "2px solid var(--t-spinner-track)",
              borderTopColor: "var(--t-accent)",
            }}
          />
        </main>
      </>
    );
  }

  if (!user || !isAdmin) {
    return (
      <>
        <Header />
        <main className="flex-1 pt-14 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Access Denied</p>
            <p className="text-sm mb-4" style={{ color: "var(--t-text-dim)" }}>
              Admin privileges required.
            </p>
            <Link
              href="/"
              className="text-sm underline"
              style={{ color: "var(--t-accent)" }}
            >
              Go home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-14">
        <div className="px-4 pt-6 pb-12 max-w-4xl mx-auto">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Admin Panel
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--t-text-dim)" }}>
            Manage users and roles
          </p>

          {/* Users table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: "var(--t-surface)",
              border: "1px solid var(--t-border)",
            }}
          >
            <div
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b"
              style={{
                color: "var(--t-text-dim)",
                borderColor: "var(--t-border)",
              }}
            >
              Users ({users.length})
            </div>

            {loadingUsers ? (
              <div className="p-8 text-center">
                <div
                  className="w-6 h-6 rounded-full animate-spin mx-auto"
                  style={{
                    border: "2px solid var(--t-spinner-track)",
                    borderTopColor: "var(--t-accent)",
                  }}
                />
              </div>
            ) : users.length === 0 ? (
              <div
                className="p-8 text-center text-sm"
                style={{ color: "var(--t-text-dim)" }}
              >
                No users yet.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--t-border)" }}>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {u.display_name || "Unnamed"}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--t-text-dim)" }}
                      >
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            u.role === "admin"
                              ? "var(--t-accent)"
                              : "var(--t-surface-light)",
                          color:
                            u.role === "admin"
                              ? "var(--t-bg)"
                              : "var(--t-text-dim)",
                        }}
                      >
                        {u.role}
                      </span>
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          className="text-xs underline"
                          style={{ color: "var(--t-accent)" }}
                        >
                          {u.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
