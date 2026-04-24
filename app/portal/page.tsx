"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserRound,
  UsersRound,
  UserPlus2,
  LogIn,
  CreditCard,
  Landmark,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextField from "@/components/forms/TextField";
import Image from "next/image";

type PortalMode = "student" | "parent";
type PortalAction = "login" | "register";

type SessionUser = {
  role: "student" | "parent";
  display_name: string;
  parent_id?: number;
  student_id?: number;
  linked_student_id?: number;
  registration_number?: string;
  first_name?: string;
  last_name?: string;
  parent_name?: string | null;
  parent_phone?: string | null;
};

type ApiSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function PortalAuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<PortalMode>("student");
  const [action, setAction] = useState<PortalAction>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [studentLoginForm, setStudentLoginForm] = useState({
    regNo: "",
    password: ""
  });

  const [studentRegisterForm, setStudentRegisterForm] = useState({
    regNo: "",
    password: ""
  });

  const [parentLoginForm, setParentLoginForm] = useState({
    regNo: "",
    password: ""
  });

  const [parentRegisterForm, setParentRegisterForm] = useState({
    full_name: "",
    phone: "",
    regNo: "",
    password: ""
  });

  const pageMeta = useMemo(() => {
    if (mode === "student" && action === "login") {
      return {
        title: "Student Login",
        subtitle:
          "Sign in with your student registration number and password or PIN.",
        buttonLabel: loading ? "Signing in..." : "Login as Student",
        icon: LogIn
      };
    }

    if (mode === "student" && action === "register") {
      return {
        title: "Student Registration",
        subtitle:
          "Create your student portal access using your valid school RegNo.",
        buttonLabel: loading ? "Registering..." : "Register as Student",
        icon: UserPlus2
      };
    }

    if (mode === "parent" && action === "login") {
      return {
        title: "Parent Login",
        subtitle:
          "Sign in using the linked student RegNo and your password or PIN.",
        buttonLabel: loading ? "Signing in..." : "Login as Parent",
        icon: LogIn
      };
    }

    return {
      title: "Parent Registration",
      subtitle:
        "Register with your full name, phone number, student RegNo, and password.",
      buttonLabel: loading ? "Registering..." : "Register as Parent",
      icon: UserPlus2
    };
  }, [mode, action, loading]);

  function resetErrors() {
    setErrors({});
  }

  function switchMode(nextMode: PortalMode) {
    setMode(nextMode);
    setAction("login");
    resetErrors();
  }

  function switchAction(nextAction: PortalAction) {
    setAction(nextAction);
    resetErrors();
  }

  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    resetErrors();

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/login",
        {
          regNo: studentLoginForm.regNo,
          password: studentLoginForm.password,
          accountType: "student"
        }
      );

      toast.success(response.data.message || "Student login successful.");
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to sign in as student.";
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors as Record<string, string>);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStudentRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    resetErrors();

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/student-register",
        {
          regNo: studentRegisterForm.regNo,
          password: studentRegisterForm.password
        }
      );

      toast.success(response.data.message || "Student registration successful.");
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to register as student.";
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
    resetErrors();

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/login",
        {
          regNo: parentLoginForm.regNo,
          password: parentLoginForm.password,
          accountType: "parent"
        }
      );

      toast.success(response.data.message || "Parent login successful.");
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to sign in as parent.";
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
    resetErrors();

    try {
      const response = await api.post<ApiSuccessResponse<{ user: SessionUser }>>(
        "/auth/portal/register",
        {
          full_name: parentRegisterForm.full_name,
          phone: parentRegisterForm.phone,
          regNo: parentRegisterForm.regNo,
          password: parentRegisterForm.password
        }
      );

      toast.success(response.data.message || "Parent registration successful.");
      router.push("/portal/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Unable to register as parent.";
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        setErrors(apiErrors as Record<string, string>);
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function renderForm() {
    if (mode === "student" && action === "login") {
      return (
        <form className="space-y-4 sm:space-y-5" onSubmit={handleStudentLogin}>
          <TextField
            id="student-login-regNo"
            name="regNo"
            label="Student RegNo"
            placeholder="Enter your student RegNo"
            value={studentLoginForm.regNo}
            onChange={(value) =>
              setStudentLoginForm((prev) => ({ ...prev, regNo: value }))
            }
            error={errors.regNo}
          />

          <TextField
            id="student-login-password"
            name="password"
            type="password"
            label="Password / PIN"
            placeholder="Enter your password or PIN"
            value={studentLoginForm.password}
            onChange={(value) =>
              setStudentLoginForm((prev) => ({ ...prev, password: value }))
            }
            error={errors.password}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {pageMeta.buttonLabel}
          </Button>
        </form>
      );
    }

    if (mode === "student" && action === "register") {
      return (
        <form
          className="space-y-4 sm:space-y-5"
          onSubmit={handleStudentRegister}
        >
          <TextField
            id="student-register-regNo"
            name="regNo"
            label="Student RegNo"
            placeholder="Enter your student RegNo"
            value={studentRegisterForm.regNo}
            onChange={(value) =>
              setStudentRegisterForm((prev) => ({ ...prev, regNo: value }))
            }
            error={errors.regNo}
          />

          <TextField
            id="student-register-password"
            name="password"
            type="password"
            label="Create Password / PIN"
            placeholder="Choose password or PIN"
            value={studentRegisterForm.password}
            onChange={(value) =>
              setStudentRegisterForm((prev) => ({
                ...prev,
                password: value
              }))
            }
            error={errors.password}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {pageMeta.buttonLabel}
          </Button>
        </form>
      );
    }

    if (mode === "parent" && action === "login") {
      return (
        <form className="space-y-4 sm:space-y-5" onSubmit={handleParentLogin}>
          <TextField
            id="parent-login-regNo"
            name="regNo"
            label="Student RegNo"
            placeholder="Enter linked student RegNo"
            value={parentLoginForm.regNo}
            onChange={(value) =>
              setParentLoginForm((prev) => ({ ...prev, regNo: value }))
            }
            error={errors.regNo}
          />

          <TextField
            id="parent-login-password"
            name="password"
            type="password"
            label="Password / PIN"
            placeholder="Enter password or PIN"
            value={parentLoginForm.password}
            onChange={(value) =>
              setParentLoginForm((prev) => ({ ...prev, password: value }))
            }
            error={errors.password}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {pageMeta.buttonLabel}
          </Button>
        </form>
      );
    }

    return (
      <form className="space-y-4 sm:space-y-5" onSubmit={handleParentRegister}>
        <TextField
          id="parent-register-full-name"
          name="full_name"
          label="Full Name"
          placeholder="Enter full name"
          value={parentRegisterForm.full_name}
          onChange={(value) =>
            setParentRegisterForm((prev) => ({
              ...prev,
              full_name: value
            }))
          }
          error={errors.full_name}
        />

        <TextField
          id="parent-register-phone"
          name="phone"
          label="Phone Number"
          placeholder="Enter phone number"
          value={parentRegisterForm.phone}
          onChange={(value) =>
            setParentRegisterForm((prev) => ({
              ...prev,
              phone: value
            }))
          }
          error={errors.phone}
        />

        <TextField
          id="parent-register-regNo"
          name="regNo"
          label="Student RegNo"
          placeholder="Enter student RegNo"
          value={parentRegisterForm.regNo}
          onChange={(value) =>
            setParentRegisterForm((prev) => ({ ...prev, regNo: value }))
          }
          error={errors.regNo}
        />

        <TextField
          id="parent-register-password"
          name="password"
          type="password"
          label="Create Password / PIN"
          placeholder="Create password or PIN"
          value={parentRegisterForm.password}
          onChange={(value) =>
            setParentRegisterForm((prev) => ({
              ...prev,
              password: value
            }))
          }
          error={errors.password}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {pageMeta.buttonLabel}
        </Button>
      </form>
    );
  }

  const HeaderIcon = pageMeta.icon;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-10">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        <Card className="order-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6 lg:order-1 lg:min-h-[760px] lg:p-8">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="flex flex-col items-center text-center">
              {/* Logo */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36">
                <Image
                  src="/icon.png"
                  alt="Oroshya Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Title */}
              <h1 className="mt-5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Student & Parent Portal
              </h1>

              {/* Subtitle */}
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                Check school fees, balances, and payment details.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5">
                    <CreditCard className="h-5 w-5 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Outstanding Balance
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      View tuition balance and fee-related obligations in a clear
                      card-style dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5">
                    <Landmark className="h-5 w-5 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Bank Accounts
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      See official school bank account numbers for payment at any
                      time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5">
                    <UserRound className="h-5 w-5 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Student Access
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Students can log in or create portal access using their
                      valid school RegNo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5">
                    <UsersRound className="h-5 w-5 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Parent Access
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Parents register once, then continue using the linked
                      student RegNo and password.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-brand-500/20 bg-brand-500/10 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-300" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    School-controlled access
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Registration only works when the student RegNo already exists
                    in the school records. Parent details are linked to the
                    student profile according to your system rules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="order-1 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6 lg:order-2 lg:p-8">
          <div className="space-y-5 sm:space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-300">
                Portal Access
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Choose your access type, then log in or register.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => switchMode("student")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${mode === "student"
                    ? "border-brand-400/40 bg-brand-500/15"
                    : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-2xl p-2.5 ${mode === "student" ? "bg-brand-500/20" : "bg-white/10"
                      }`}
                  >
                    <UserRound className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Student</p>
                    <p className="text-xs text-slate-400">
                      Access your own record
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchMode("parent")}
                className={`rounded-2xl border px-4 py-4 text-left transition ${mode === "parent"
                    ? "border-brand-400/40 bg-brand-500/15"
                    : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-2xl p-2.5 ${mode === "parent" ? "bg-brand-500/20" : "bg-white/10"
                      }`}
                  >
                    <UsersRound className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Parent</p>
                    <p className="text-xs text-slate-400">
                      Access linked student record
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => switchAction("login")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${action === "login"
                    ? "border-brand-400/40 bg-brand-500/15 text-white"
                    : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchAction("register")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${action === "register"
                    ? "border-brand-400/40 bg-brand-500/15 text-white"
                    : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                  }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus2 className="h-4 w-4" />
                  Register
                </span>
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-brand-500/15 p-2.5">
                  <HeaderIcon className="h-5 w-5 text-brand-300" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white sm:text-xl">
                    {pageMeta.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    {pageMeta.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-5">{renderForm()}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <ChevronRight className="mt-0.5 h-4 w-4 text-brand-300" />
                <p className="text-sm leading-6 text-slate-300">
                  {mode === "student"
                    ? action === "login"
                      ? "Already registered as a student? Sign in with your RegNo and password."
                      : "New student access is created using a valid school registration number."
                    : action === "login"
                      ? "Parent login requires the linked student RegNo and the password you created during registration."
                      : "Parent registration links your details to the student if the provided information passes validation."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}