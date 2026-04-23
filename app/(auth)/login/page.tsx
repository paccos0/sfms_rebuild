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
        <Card className="hidden lg:flex lg:flex-col lg:justify-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
              Administration
            </p>

            <h1 className="mt-4 text-4xl font-bold text-white">
              OROSHYA APP
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
              Secure access for authorized school staff.
            </p>
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
