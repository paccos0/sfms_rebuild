"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";

type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      admin_id: number;
      username: string;
      first_name: string;
      last_name: string;
      role: string;
    };
  };
};

export default function ProfilePage() {
  const [user, setUser] = useState<MeResponse["data"]["user"] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .get<MeResponse>("/auth/me")
      .then((response) => setUser(response.data.data.user))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Unable to load profile.")
      );
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);

      await api.post("/auth/logout");

      toast.success("Logged out successfully");

      // redirect to login
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand-400">
          Account
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">Profile</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Your authenticated administrator profile and role details.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              First name
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {user?.first_name ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Last name
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {user?.last_name ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Username
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {user?.username ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Role
            </p>
            <p className="mt-2 text-lg font-semibold uppercase text-white">
              {user?.role ?? "-"}
            </p>
          </div>
        </div>

        {/* 🔴 Logout Button */}
        <div className="mt-6 border-t border-white/10 pt-4 flex justify-end">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </Card>
    </div>
  );
}