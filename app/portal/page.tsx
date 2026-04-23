"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextField from "@/components/forms/TextField";
import type { ApiSuccessResponse, SessionUser } from "@/types";

type AuthTab = "student-login" | "parent-login" | "parent-register";

export default function PortalAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("student-login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginForm, setLoginForm] = useState({ regNo: "" });
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    regNo: ""
  });

  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/login",
        {
          regNo: loginForm.regNo,
          accountType: "student"
        }
      );

      toast.success(response.data.message);
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to sign in.";
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors as Record<string, string>);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleParentLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/login",
        {
          regNo: loginForm.regNo,
          accountType: "parent"
        }
      );

      toast.success(response.data.message);
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to sign in.";
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors as Record<string, string>);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleParentRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/register",
        registerForm
      );

      toast.success(response.data.message);
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to register.";
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
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <Card className="hidden lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
              Student & Parent Portal
            </p>
            <h1 className="mt-4 text-4xl font-bold text-white">
              Access fee information with your RegNo
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Students sign in directly with their school registration number.
              Parents register once using full name and a valid student RegNo,
              then sign in using that same RegNo.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-brand-400" />
                <p className="font-semibold text-white">Student access</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                View current balance and school bank account details.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <UsersRound className="h-5 w-5 text-brand-400" />
                <p className="font-semibold text-white">Parent access</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Register with full name and a valid student RegNo supplied by
                the school.
              </p>
            </div>
          </div>
        </Card>

        <Card className="mx-auto w-full max-w-xl p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-400">
              Portal Access
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Student & Parent Login
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Choose the correct access option below.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
            {[
              { key: "student-login", label: "Student" },
              { key: "parent-login", label: "Parent" },
              { key: "parent-register", label: "Register" }
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(item.key as AuthTab);
                  setErrors({});
                }}
                className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  tab === item.key
                    ? "bg-brand-500 text-white"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "student-login" && (
            <form className="mt-8 space-y-5" onSubmit={handleStudentLogin}>
              <TextField
                id="student-regNo"
                name="regNo"
                label="Student RegNo"
                placeholder="Enter student RegNo"
                value={loginForm.regNo}
                onChange={(value) =>
                  setLoginForm((prev) => ({ ...prev, regNo: value }))
                }
                error={errors.regNo}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Login as Student"}
              </Button>
            </form>
          )}

          {tab === "parent-login" && (
            <form className="mt-8 space-y-5" onSubmit={handleParentLogin}>
              <TextField
                id="parent-regNo"
                name="regNo"
                label="Student RegNo"
                placeholder="Enter linked student RegNo"
                value={loginForm.regNo}
                onChange={(value) =>
                  setLoginForm((prev) => ({ ...prev, regNo: value }))
                }
                error={errors.regNo}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Login as Parent"}
              </Button>
            </form>
          )}

          {tab === "parent-register" && (
            <form className="mt-8 space-y-5" onSubmit={handleParentRegister}>
              <TextField
                id="full_name"
                name="full_name"
                label="Full Name"
                placeholder="Enter full name"
                value={registerForm.full_name}
                onChange={(value) =>
                  setRegisterForm((prev) => ({ ...prev, full_name: value }))
                }
                error={errors.full_name}
              />

              <TextField
                id="register-regNo"
                name="regNo"
                label="Student RegNo"
                placeholder="Enter student RegNo"
                value={registerForm.regNo}
                onChange={(value) =>
                  setRegisterForm((prev) => ({ ...prev, regNo: value }))
                }
                error={errors.regNo}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Register as Parent"}
              </Button>
            </form>
          )}

          <div className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/10 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-300" />
              <p className="text-sm font-semibold text-white">
                School-issued access
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Parent registration only works when the supplied RegNo already
              exists in the student records.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}