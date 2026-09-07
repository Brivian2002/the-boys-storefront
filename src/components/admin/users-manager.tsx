"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, ShieldCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UsersManagerProps {
  users: AdminUser[];
  currentEmail: string;
}

export function UsersManager({ users: initial, currentEmail }: UsersManagerProps) {
  const [users, setUsers] = React.useState(initial);
  const [busy, setBusy] = React.useState<string | null>(null);

  // New admin form
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("ADMIN");
  const [adding, setAdding] = React.useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Name, email and password are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Create failed");
      setUsers((prev) => [...prev, data]);
      setName("");
      setEmail("");
      setPassword("");
      setRole("ADMIN");
      toast.success("Admin created", { description: data.email });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Create failed";
      toast.error("Could not create admin", { description: msg });
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? "Update failed");
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive } : u))
      );
      toast.success(isActive ? "Admin activated" : "Admin deactivated");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error("Could not update admin", { description: msg });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? "Delete failed");
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Admin deleted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error("Could not delete admin", { description: msg });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add an admin</CardTitle>
          <CardDescription>
            New admins can sign in immediately with their email and password.
            OWNER is the highest role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={adding}>
                {adding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All admins</CardTitle>
          <CardDescription>
            {users.length} admin{users.length === 1 ? "" : "s"} with dashboard access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => {
            const isSelf = u.email.toLowerCase() === currentEmail.toLowerCase();
            const isLastOwner = u.role === "OWNER" && users.filter((x) => x.role === "OWNER").length <= 1;
            return (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{u.name}</p>
                    {isSelf && (
                      <Badge variant="secondary" className="text-[0.6rem]">
                        You
                      </Badge>
                    )}
                    <Badge
                      variant={u.role === "OWNER" ? "default" : "outline"}
                      className="text-[0.6rem]"
                    >
                      {u.role}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                    {u.lastLoginAt &&
                      ` · Last login ${new Date(u.lastLoginAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(u.id, !u.isActive)}
                    disabled={busy === u.id || (isSelf && u.isActive)}
                  >
                    {u.isActive ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        Inactive
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(u.id)}
                    disabled={busy === u.id || isLastOwner}
                    aria-label="Delete admin"
                  >
                    {busy === u.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
