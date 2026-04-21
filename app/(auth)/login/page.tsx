"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/forms/TextField";
import type { ApiSuccessResponse, SessionUser } from "@/types";

type FormState = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/login",
        form
      );

      toast.success(response.data.message);
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to sign in at the moment.";
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors as Record<string, string>);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <Card className="hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
              School Finance
            </p>
            <h1 className="mt-4 text-4xl font-bold text-white">
              Production-ready SFMS starter
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Built for academic-year-aware enrollments, general fee structure,
              secure session auth, and maintainable route handlers.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-400" />
                <p className="font-semibold text-white">Cookie session auth</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Login uses an HttpOnly signed cookie and protected API routes.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-brand-400" />
                <p className="font-semibold text-white">Role-aware access</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Admin and bursar roles are supported from the start.
              </p>
            </div>
          </div>
        </Card>

        <Card className="mx-auto w-full max-w-xl p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
              Welcome back
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter your credentials to access the School Fees Management
              System.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <TextField
              id="username"
              name="username"
              label="Username"
              placeholder="Enter username"
              autoComplete="username"
              value={form.username}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, username: value }))
              }
              error={errors.username}
            />

            <TextField
              id="password"
              name="password"
              label="Password"
              placeholder="Enter password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, password: value }))
              }
              error={errors.password}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
