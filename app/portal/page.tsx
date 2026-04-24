"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  HelpCircle,
  Languages,
  LogIn,
  UserPlus2,
  UserRound,
  UsersRound
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TextField from "@/components/forms/TextField";

type PortalMode = "student" | "parent";
type PortalAction = "login" | "register";
type Language = "en" | "rw" | "fr";

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

const portalText = {
  en: {
    title: "Student & Parent Portal",
    subtitle: "Check school fees, balances, and payment details.",
    help: "Need help? Contact the school administration.",
    welcome: "Welcome back",
    choose: "Choose your access type, then log in or register.",
    student: "Student",
    parent: "Parent",
    studentDesc: "Access your own record",
    parentDesc: "Access linked student record",
    login: "Login",
    register: "Register"
  },
  rw: {
    title: "Urubuga rw’Abanyeshuri n’Ababyeyi",
    subtitle: "Reba amafaranga y’ishuri, asigaye, n’amakuru yo kwishyura.",
    help: "Ukeneye ubufasha? Vugana n’ubuyobozi bw’ishuri.",
    welcome: "Murakaza neza",
    choose: "Hitamo uko winjira, hanyuma winjire cyangwa wiyandikishe.",
    student: "Umunyeshuri",
    parent: "Umubyeyi",
    studentDesc: "Reba amakuru yawe",
    parentDesc: "Reba amakuru y’umunyeshuri",
    login: "Kwinjira",
    register: "Kwiyandikisha"
  },
  fr: {
    title: "Portail Élèves & Parents",
    subtitle:
      "Consultez les frais scolaires, les soldes et les informations de paiement.",
    help: "Besoin d’aide ? Contactez l’administration de l’école.",
    welcome: "Bienvenue",
    choose: "Choisissez votre accès, puis connectez-vous ou inscrivez-vous.",
    student: "Élève",
    parent: "Parent",
    studentDesc: "Accéder à votre dossier",
    parentDesc: "Accéder au dossier lié",
    login: "Connexion",
    register: "Inscription"
  }
};

export default function PortalAuthPage() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<PortalMode>("student");
  const [action, setAction] = useState<PortalAction>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const text = portalText[language];

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col gap-4 sm:min-h-[calc(100vh-3rem)]">
        <header className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/icon.png"
                  alt="Oroshya Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300">
                  OROSHYA APP
                </p>
                <p className="text-xs text-slate-400">
                  {text.help}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <Languages className="h-4 w-4 text-brand-300" />
                <div className="flex gap-1">
                  {[
                    { key: "en", label: "EN" },
                    { key: "rw", label: "RW" },
                    { key: "fr", label: "FR" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setLanguage(item.key as Language)}
                      className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                        language === item.key
                          ? "bg-brand-500 text-white"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-300 md:flex">
                <HelpCircle className="h-4 w-4 text-brand-300" />
                <span>{text.help}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:gap-6">
          <Card className="order-2 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:order-1">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 lg:h-44 lg:w-44">
                <Image
                  src="/icon.png"
                  alt="Oroshya Logo"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                />
              </div>

              <h1 className="mt-6 max-w-xl text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {text.title}
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
                {text.subtitle}
              </p>

              <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left">
                  <p className="text-sm font-semibold text-white">
                    {text.student}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {text.studentDesc}
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-left">
                  <p className="text-sm font-semibold text-white">
                    {text.parent}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {text.parentDesc}
                  </p>
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
                  {text.welcome}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {text.choose}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => switchMode("student")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    mode === "student"
                      ? "border-brand-400/40 bg-brand-500/15"
                      : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl p-2.5 ${
                        mode === "student" ? "bg-brand-500/20" : "bg-white/10"
                      }`}
                    >
                      <UserRound className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {text.student}
                      </p>
                      <p className="text-xs text-slate-400">
                        {text.studentDesc}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode("parent")}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    mode === "parent"
                      ? "border-brand-400/40 bg-brand-500/15"
                      : "border-white/10 bg-black/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-2xl p-2.5 ${
                        mode === "parent" ? "bg-brand-500/20" : "bg-white/10"
                      }`}
                    >
                      <UsersRound className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {text.parent}
                      </p>
                      <p className="text-xs text-slate-400">
                        {text.parentDesc}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => switchAction("login")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    action === "login"
                      ? "border-brand-400/40 bg-brand-500/15 text-white"
                      : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {text.login}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => switchAction("register")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    action === "register"
                      ? "border-brand-400/40 bg-brand-500/15 text-white"
                      : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <UserPlus2 className="h-4 w-4" />
                    {text.register}
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
    </div>
  );
}