"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Card from "@/components/ui/Card";
import SkeletonBlock from "@/components/ui/SkeletonBlock";

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

function ProfileFieldSkeleton() {
  return (
    <div>
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-3 h-6 w-32" />
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<MeResponse["data"]["user"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    api
      .get<MeResponse>("/auth/me")
      .then((response) => {
        if (mounted) {
          setUser(response.data.data.user);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Unable to load profile.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await api.post("/auth/logout");

      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Logout failed");
      setLogoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        {loading ? (
          <>
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-3 h-9 w-40" />
            <SkeletonBlock className="mt-3 h-4 w-[28rem] max-w-full" />
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-[0.2em] text-brand-400">
              Account
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Profile</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Your authenticated administrator profile and role details.
            </p>
          </>
        )}
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? (
            <>
              <ProfileFieldSkeleton />
              <ProfileFieldSkeleton />
              <ProfileFieldSkeleton />
              <ProfileFieldSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={handleLogout}
            disabled={logoutLoading || loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {logoutLoading ? (
              <>
                <Spinner />
                <span>Logging out</span>
              </>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}