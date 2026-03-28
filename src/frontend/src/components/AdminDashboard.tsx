import {
  ApplicationStatus,
  UserRole,
  Variant_staff_employer_candidate,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  type AttendanceLog,
  useAddPreApprovedStaffEmail,
  useAssignStaffRole,
  useAssignUserRole,
  useIsAdmin,
  useListAllAttendanceLogs,
  useListAllUsers,
  useListPreApprovedStaffEmails,
  useRemovePreApprovedStaffEmail,
  useRemoveStaffRole,
} from "@/hooks/useQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  KeyRound,
  Loader2,
  Mail,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const LIGHT_BLUE = "#5BB8D4";

function shortPrincipal(p: string) {
  return p.length > 12 ? `${p.slice(0, 8)}...` : p;
}

const ADMIN_SEED_EMAILS = ["ns244128@gmail.com", "Rebelhrjobs1451@gmail.com"];

function formatNanoTs(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcDuration(clockIn: bigint, clockOut: [] | [bigint]): string {
  if (clockOut.length === 0) return "Still Working";
  const diffMs = Number((clockOut[0] - clockIn) / 1_000_000n);
  const hrs = Math.floor(diffMs / 3_600_000);
  const mins = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hrs}h ${mins}m`;
}

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const callerPrincipal = isAuthenticated
    ? identity.getPrincipal().toString()
    : null;

  const [activeTab, setActiveTab] = useState("overview");

  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: users = [], isLoading: loadingUsers } = useListAllUsers({
    enabled: isAdmin === true,
  });

  // Pre-approved staff email hooks
  const { data: preApprovedEmails = [], isLoading: loadingEmails } =
    useListPreApprovedStaffEmails();
  const addPreApprovedStaffEmail = useAddPreApprovedStaffEmail();
  const removePreApprovedStaffEmail = useRemovePreApprovedStaffEmail();

  const assignStaff = useAssignStaffRole();
  const removeStaff = useRemoveStaffRole();
  const assignUserRole = useAssignUserRole();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAdmin === true) {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["allAttendanceLogs"] });
    }
  }, [isAdmin, queryClient]);

  const { data: staffAccounts = [] } = useQuery({
    queryKey: ["staffAccounts"],
    queryFn: () => actor!.listStaffAccounts(),
    enabled: !!actor && !!isAdmin,
  });

  const { data: pendingOTPs = [], refetch: refetchOTPs } = useQuery<
    Array<{ userId: string; otp: string }>
  >({
    queryKey: ["pendingOTPs"],
    queryFn: () => actor!.listPendingOTPs(),
    enabled: isAdmin === true && !!actor,
    refetchInterval: 15000,
  });

  // Attendance logs — admin only
  const { data: attendanceLogs = [], isLoading: loadingAttendance } =
    useListAllAttendanceLogs({ enabled: isAdmin === true });

  const createStaffAccountMutation = useMutation({
    mutationFn: async ({
      userId,
      password,
      name,
    }: { userId: string; password: string; name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createStaffAccount(userId, password, name);
    },
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Staff account created");
        setStaffUserId("");
        setStaffPassword("");
        setStaffName("");
        queryClient.invalidateQueries({ queryKey: ["staffAccounts"] });
      } else {
        toast.error("UserID already exists");
      }
    },
    onError: () => toast.error("Failed to create account"),
  });

  const deleteStaffAccountMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteStaffAccount(userId);
    },
    onSuccess: () => {
      toast.success("Staff account deleted");
      queryClient.invalidateQueries({ queryKey: ["staffAccounts"] });
    },
    onError: () => toast.error("Failed to delete account"),
  });

  const deactivateStaffAccountMutation = useMutation({
    mutationFn: async ({
      userId,
      deactivate,
    }: { userId: string; deactivate: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deactivateStaffAccount(userId, deactivate);
    },
    onSuccess: (_, { deactivate, userId }) => {
      toast.success(
        `Account "${userId}" ${deactivate ? "deactivated" : "reactivated"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["staffAccounts"] });
    },
    onError: () => toast.error("Failed to update account status"),
  });

  const [seedEmail, setSeedEmail] = useState(ADMIN_SEED_EMAILS[0]);
  const [seeding, setSeeding] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [staffUserId, setStaffUserId] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffName, setStaffName] = useState("");
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Auto-attempt seed ONLY when user is authenticated with a real identity
  useEffect(() => {
    if (
      !isAdmin &&
      !checkingAdmin &&
      autoAttempted !== callerPrincipal &&
      actor &&
      isAuthenticated &&
      callerPrincipal
    ) {
      setAutoAttempted(callerPrincipal);
      setSeeding(true);
      (async () => {
        let anyGranted = false;
        for (const email of ADMIN_SEED_EMAILS) {
          try {
            const granted: boolean = await actor.claimAdminSeed(email);
            if (granted) {
              anyGranted = true;
              toast.success("Admin access granted! Refreshing...", {
                duration: 2000,
              });
              queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
              setTimeout(() => window.location.reload(), 1500);
              break;
            }
          } catch {
            // ignore
          }
        }
        if (!anyGranted) setSeeding(false);
      })();
    }
  }, [
    isAdmin,
    checkingAdmin,
    autoAttempted,
    actor,
    isAuthenticated,
    callerPrincipal,
    queryClient,
  ]);

  const handleClaimSeed = async () => {
    if (!actor || !seedEmail.trim()) return;
    setSeeding(true);
    try {
      const granted = await actor.claimAdminSeed(seedEmail.trim());
      if (granted) {
        toast.success("Admin access granted! Refreshing...", {
          duration: 2000,
        });
        queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("This email is not authorized as admin seed.");
      }
    } catch {
      toast.error("Failed to activate admin access.");
    } finally {
      setSeeding(false);
    }
  };

  const handleAssignStaff = async (principal: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await assignStaff.mutateAsync(Principal.fromText(principal));
      toast.success("Staff role assigned");
    } catch {
      toast.error("Failed to assign staff role");
    }
  };

  const handleRemoveStaff = async (principal: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await removeStaff.mutateAsync(Principal.fromText(principal));
      toast.success("Staff role removed");
    } catch {
      toast.error("Failed to remove staff role");
    }
  };

  const handleMakeAdmin = async (principal: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await assignUserRole.mutateAsync({
        user: Principal.fromText(principal),
        role: UserRole.admin,
      });
      toast.success("Admin role granted");
    } catch {
      toast.error("Failed to grant admin role");
    }
  };

  const handleAddInviteEmail = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    await addPreApprovedStaffEmail.mutateAsync(inviteEmail.trim());
    setInviteEmail("");
    toast.success(`${inviteEmail} added to staff invite list`);
  };

  const handleRemoveInviteEmail = async (email: string) => {
    await removePreApprovedStaffEmail.mutateAsync(email);
    toast.success("Email removed");
  };

  // ── Not authenticated ──
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div
          data-ocid="admin.dialog"
          className="w-full max-w-md rounded-2xl border shadow-lg p-8 text-center"
          style={{
            background: "oklch(0.99 0.003 260)",
            borderColor: "oklch(0.88 0.003 260)",
          }}
        >
          <img
            src="/assets/uploads/nira_rebel_photo-019d1f7f-8eb3-7143-b4a4-abb72c418f74-1.jpeg"
            alt="Nira Rebel"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Admin Login Required
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please log in with Internet Identity to access the Admin Dashboard.
          </p>
          <a
            href="/"
            data-ocid="admin.link"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: LIGHT_BLUE }}
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </div>
    );
  }

  // ── Checking admin ──
  if (checkingAdmin || seeding) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div
          data-ocid="admin.loading_state"
          className="flex flex-col items-center gap-3"
        >
          <Loader2
            className="animate-spin"
            size={28}
            style={{ color: LIGHT_BLUE }}
          />
          <p className="text-sm text-muted-foreground">
            {seeding
              ? "Activating admin access..."
              : "Verifying admin access..."}
          </p>
        </div>
      </div>
    );
  }

  // ── Not admin ──
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div
          data-ocid="admin.dialog"
          className="w-full max-w-md rounded-2xl border shadow-lg p-8 text-center"
          style={{
            background: "oklch(0.99 0.003 260)",
            borderColor: "oklch(0.88 0.003 260)",
          }}
        >
          <img
            src="/assets/uploads/nira_rebel_photo-019d1f7f-8eb3-7143-b4a4-abb72c418f74-1.jpeg"
            alt="Nira Rebel"
            className="h-16 w-auto object-contain mx-auto mb-6"
          />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You are logged in, but your account does not have admin privileges.
          </p>

          <div className="flex flex-col gap-3 mb-6">
            <p className="text-xs text-muted-foreground text-left font-medium">
              Activate Admin Access
            </p>
            <Input
              type="email"
              value={seedEmail}
              onChange={(e) => setSeedEmail(e.target.value)}
              placeholder="Enter your admin email"
              data-ocid="admin.input"
              className="text-sm text-black"
            />
            <Button
              onClick={handleClaimSeed}
              disabled={seeding || !seedEmail.trim()}
              data-ocid="admin.primary_button"
              className="w-full text-white"
              style={{ background: LIGHT_BLUE }}
            >
              Activate Admin Access
            </Button>
          </div>

          <a
            href="/"
            data-ocid="admin.link"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: LIGHT_BLUE }}
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.98 0.003 260)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "oklch(0.99 0.003 260)",
          borderColor: "oklch(0.88 0.003 260)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              data-ocid="admin.link"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Back to Site
            </a>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <img
                src="/assets/uploads/nira_rebel_photo-019d1f7f-8eb3-7143-b4a4-abb72c418f74-1.jpeg"
                alt="Nira Rebel logo"
                style={{ height: "32px", width: "auto", objectFit: "contain" }}
              />
              <h1 className="font-bold text-base text-gray-900">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <a
            href="/staff"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="admin.link"
            className="text-sm font-medium"
            style={{ color: LIGHT_BLUE }}
          >
            Staff Portal
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="mb-8 h-11"
            style={{
              background: "oklch(0.96 0.003 260)",
              border: "1px solid oklch(0.88 0.003 260)",
            }}
          >
            <TabsTrigger
              value="overview"
              data-ocid="admin.tab"
              className="px-6 text-sm font-semibold text-gray-800 data-[state=active]:bg-[#5BB8D4] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="attendance-logs"
              data-ocid="admin.tab"
              className="px-6 text-sm font-semibold text-gray-800 data-[state=active]:bg-[#5BB8D4] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <CalendarClock size={15} className="mr-1.5" />
              Attendance Logs
            </TabsTrigger>
            <TabsTrigger
              value="staff-management"
              data-ocid="admin.tab"
              className="px-6 text-sm font-semibold text-gray-800 data-[state=active]:bg-[#5BB8D4] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Users size={15} className="mr-1.5" />
              Staff Management
            </TabsTrigger>
          </TabsList>

          {/* ─── OVERVIEW TAB ─── */}
          <TabsContent value="overview">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                {
                  label: "Total Staff",
                  value: staffAccounts.length,
                  icon: "👥",
                },
                {
                  label: "Active Staff",
                  value: staffAccounts.filter((a) => a.isActive).length,
                  icon: "✅",
                },
                {
                  label: "Registered Users",
                  value: users.length,
                  icon: "👤",
                },
                {
                  label: "Attendance Logs",
                  value: attendanceLogs.length,
                  icon: "🕐",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 rounded-xl border"
                  style={{
                    background: "oklch(0.99 0.003 260)",
                    borderColor: "oklch(0.88 0.003 260)",
                  }}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Pending OTP Requests */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={18} style={{ color: LIGHT_BLUE }} />
                <h2 className="text-lg font-bold text-gray-900">
                  Pending OTP Requests
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${LIGHT_BLUE}22`, color: LIGHT_BLUE }}
                >
                  {pendingOTPs.length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchOTPs()}
                  className="ml-auto text-xs text-gray-700 border-gray-300"
                >
                  Refresh
                </Button>
              </div>
              <div
                className="rounded-xl border p-4"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  borderColor: "oklch(0.88 0.003 260)",
                }}
              >
                {pendingOTPs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No pending OTP requests.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {pendingOTPs.map((item) => (
                      <div
                        key={item.userId}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border"
                        style={{
                          borderColor: `${LIGHT_BLUE}44`,
                          background: `${LIGHT_BLUE}0a`,
                        }}
                      >
                        <span className="font-bold text-gray-900">
                          {item.userId}
                        </span>
                        <span
                          className="font-mono text-lg font-bold px-3 py-1 rounded-full"
                          style={{
                            background: `${LIGHT_BLUE}33`,
                            color: "#1e4a5c",
                          }}
                        >
                          {item.otp}
                        </span>
                        <span className="text-xs text-gray-500 sm:ml-auto">
                          Share this OTP with the staff member to reset their
                          password.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Active Staff List */}
            <section className="mb-10">
              <style>
                {"@media print { .no-print { display: none !important; } }"}
              </style>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} style={{ color: LIGHT_BLUE }} />
                <h2 className="text-lg font-bold text-gray-900">
                  Staff Accounts
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${LIGHT_BLUE}22`, color: LIGHT_BLUE }}
                >
                  {staffAccounts.length}
                </span>
                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-black font-semibold border-gray-300"
                    data-ocid="admin.primary_button"
                  >
                    Print Report
                  </Button>
                </div>
              </div>
              {staffAccounts.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="p-8 text-center text-sm text-muted-foreground rounded-xl border"
                  style={{ borderColor: "oklch(0.88 0.003 260)" }}
                >
                  No staff accounts yet.
                </div>
              ) : (
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "oklch(0.88 0.003 260)" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                        <TableHead className="text-black">#</TableHead>
                        <TableHead className="text-black">UserID</TableHead>
                        <TableHead className="text-black">Full Name</TableHead>
                        <TableHead className="text-black">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffAccounts.map((acct, idx) => (
                        <TableRow
                          key={acct.userId}
                          data-ocid={`admin.row.${idx + 1}`}
                          style={{ background: "oklch(0.99 0.003 260)" }}
                        >
                          <TableCell className="text-black">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-black">
                            {acct.userId}
                          </TableCell>
                          <TableCell className="text-black">
                            {acct.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 ${
                                acct.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {acct.isActive ? "Active" : "Deactivated"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>

            {/* Recent Attendance */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CalendarClock size={18} style={{ color: LIGHT_BLUE }} />
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Attendance
                </h2>
              </div>
              {attendanceLogs.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="p-8 text-center text-sm text-muted-foreground rounded-xl border"
                  style={{ borderColor: "oklch(0.88 0.003 260)" }}
                >
                  No attendance records yet.
                </div>
              ) : (
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "oklch(0.88 0.003 260)" }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                        <TableHead className="text-black">Staff Name</TableHead>
                        <TableHead className="text-black">Date</TableHead>
                        <TableHead className="text-black">Clock In</TableHead>
                        <TableHead className="text-black">Clock Out</TableHead>
                        <TableHead className="text-black">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...attendanceLogs]
                        .sort((a, b) => (a.clockIn < b.clockIn ? 1 : -1))
                        .slice(0, 10)
                        .map((log: AttendanceLog, idx: number) => (
                          <TableRow
                            key={log.logId.toString()}
                            data-ocid={`admin.row.${idx + 1}`}
                            style={{ background: "oklch(0.99 0.003 260)" }}
                          >
                            <TableCell className="font-medium text-black">
                              {log.staffName}
                            </TableCell>
                            <TableCell className="text-black">
                              {log.date}
                            </TableCell>
                            <TableCell className="text-black">
                              {formatNanoTs(log.clockIn)}
                            </TableCell>
                            <TableCell className="text-black">
                              {log.clockOut.length === 0 ? (
                                <span className="text-green-600 font-medium">
                                  Active
                                </span>
                              ) : (
                                formatNanoTs(log.clockOut[0])
                              )}
                            </TableCell>
                            <TableCell className="text-black">
                              {calcDuration(log.clockIn, log.clockOut)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </TabsContent>

          {/* ─── ATTENDANCE LOGS TAB ─── */}
          <TabsContent value="attendance-logs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarClock size={22} style={{ color: LIGHT_BLUE }} />
                <h2 className="text-xl font-bold text-gray-900">
                  All Attendance Logs
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${LIGHT_BLUE}22`, color: LIGHT_BLUE }}
                >
                  {attendanceLogs.length}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="text-black font-semibold border-gray-300"
                data-ocid="admin.secondary_button"
              >
                Print Report
              </Button>
            </div>

            <div
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: "oklch(0.88 0.003 260)" }}
            >
              {loadingAttendance ? (
                <div
                  data-ocid="admin.loading_state"
                  className="p-8 text-center"
                >
                  <Loader2
                    className="animate-spin mx-auto mb-2"
                    size={20}
                    style={{ color: LIGHT_BLUE }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Loading attendance logs...
                  </p>
                </div>
              ) : attendanceLogs.length === 0 ? (
                <div
                  data-ocid="admin.empty_state"
                  className="p-8 text-center text-sm text-muted-foreground"
                >
                  No attendance records yet. Staff members need to Clock In from
                  the Staff Portal.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                      <TableHead className="text-black">#</TableHead>
                      <TableHead className="text-black">Staff Name</TableHead>
                      <TableHead className="text-black">Staff ID</TableHead>
                      <TableHead className="text-black">Date</TableHead>
                      <TableHead className="text-black">Clock In</TableHead>
                      <TableHead className="text-black">Clock Out</TableHead>
                      <TableHead className="text-black">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...attendanceLogs]
                      .sort((a, b) => (a.clockIn < b.clockIn ? 1 : -1))
                      .map((log: AttendanceLog, idx: number) => (
                        <TableRow
                          key={log.logId.toString()}
                          data-ocid={`admin.row.${idx + 1}`}
                          style={{ background: "oklch(0.99 0.003 260)" }}
                        >
                          <TableCell className="text-black">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-medium text-black">
                            {log.staffName}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-gray-500">
                            {log.staffId}
                          </TableCell>
                          <TableCell className="text-black">
                            {log.date}
                          </TableCell>
                          <TableCell className="text-black">
                            {formatNanoTs(log.clockIn)}
                          </TableCell>
                          <TableCell className="text-black">
                            {log.clockOut.length === 0 ? (
                              <Badge className="border-0 bg-green-100 text-green-700">
                                Active
                              </Badge>
                            ) : (
                              formatNanoTs(log.clockOut[0])
                            )}
                          </TableCell>
                          <TableCell className="text-black">
                            {calcDuration(log.clockIn, log.clockOut)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ─── STAFF MANAGEMENT TAB ─── */}
          <TabsContent value="staff-management">
            {/* Create Staff Account */}
            <section className="mb-8">
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  borderColor: "oklch(0.88 0.003 260)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound size={18} style={{ color: LIGHT_BLUE }} />
                  <h2 className="text-lg font-bold text-gray-900">
                    Create Staff Account
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Create a manual login credential for a staff member. They will
                  use their UserID and password to access the Staff Portal.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Input
                    type="text"
                    value={staffUserId}
                    onChange={(e) => setStaffUserId(e.target.value)}
                    placeholder="UserID (e.g. john_doe)"
                    data-ocid="admin.input"
                    className="flex-1 text-black text-sm"
                  />
                  <div className="relative flex-1">
                    <Input
                      type={showStaffPassword ? "text" : "password"}
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Password"
                      data-ocid="admin.input"
                      className="w-full text-black text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
                      tabIndex={-1}
                    >
                      {showStaffPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Full Name"
                    data-ocid="admin.input"
                    className="flex-1 text-black text-sm"
                  />
                  <Button
                    onClick={() => {
                      if (
                        !staffUserId.trim() ||
                        !staffPassword.trim() ||
                        !staffName.trim()
                      ) {
                        toast.error("All fields are required");
                        return;
                      }
                      createStaffAccountMutation.mutate({
                        userId: staffUserId.trim(),
                        password: staffPassword,
                        name: staffName.trim(),
                      });
                    }}
                    disabled={createStaffAccountMutation.isPending}
                    data-ocid="admin.submit_button"
                    className="shrink-0 text-white"
                    style={{ background: LIGHT_BLUE }}
                  >
                    {createStaffAccountMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>

                {staffAccounts.length === 0 ? (
                  <div
                    data-ocid="admin.empty_state"
                    className="text-sm text-gray-400 italic mt-4"
                  >
                    No manual staff accounts created yet.
                  </div>
                ) : (
                  <ul
                    data-ocid="admin.list"
                    className="flex flex-col gap-2 mt-4"
                  >
                    {staffAccounts.map((acct, idx) => {
                      const isDeactivated = !acct.isActive;
                      return (
                        <li
                          key={acct.userId}
                          data-ocid={`admin.item.${idx + 1}`}
                          className="flex items-center justify-between px-4 py-2.5 rounded-lg border"
                          style={{
                            background: isDeactivated
                              ? "oklch(0.96 0.003 260)"
                              : "oklch(0.97 0.003 260)",
                            borderColor: isDeactivated
                              ? "oklch(0.88 0.003 260)"
                              : "oklch(0.90 0.003 260)",
                          }}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium text-sm ${
                                isDeactivated
                                  ? "text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {acct.userId}
                            </span>
                            <span
                              className={`text-sm ${
                                isDeactivated
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              {acct.name}
                            </span>
                            <Badge
                              className={`border-0 text-xs ${
                                isDeactivated
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isDeactivated ? "Deactivated" : "Active"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`admin.toggle.${idx + 1}`}
                              onClick={() =>
                                deactivateStaffAccountMutation.mutate({
                                  userId: acct.userId,
                                  deactivate: acct.isActive,
                                })
                              }
                              disabled={
                                deactivateStaffAccountMutation.isPending
                              }
                              className={`h-7 text-xs ${
                                isDeactivated
                                  ? "text-green-700 border-green-200 hover:bg-green-50"
                                  : "text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                              }`}
                            >
                              {isDeactivated ? "Activate" : "Deactivate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              data-ocid={`admin.delete_button.${idx + 1}`}
                              onClick={() =>
                                deleteStaffAccountMutation.mutate(acct.userId)
                              }
                              disabled={deleteStaffAccountMutation.isPending}
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs"
                            >
                              <Trash2 size={12} className="mr-1" /> Delete
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {/* Invite Staff by Email */}
            <section className="mb-8">
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  borderColor: "oklch(0.88 0.003 260)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={18} style={{ color: LIGHT_BLUE }} />
                  <h2 className="text-lg font-bold text-gray-900">
                    Invite Staff by Email
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Enter a staff member&apos;s email below. When they register
                  with this email, they will automatically get Staff access.
                </p>

                <div className="flex gap-3 mb-6">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddInviteEmail();
                    }}
                    placeholder="staff@example.com"
                    data-ocid="admin.input"
                    className="flex-1 text-black text-sm"
                  />
                  <Button
                    onClick={handleAddInviteEmail}
                    disabled={
                      addPreApprovedStaffEmail.isPending || !inviteEmail.trim()
                    }
                    data-ocid="admin.primary_button"
                    className="shrink-0 text-white"
                    style={{ background: LIGHT_BLUE }}
                  >
                    {addPreApprovedStaffEmail.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Staff Email"
                    )}
                  </Button>
                </div>

                {loadingEmails ? (
                  <div
                    data-ocid="admin.loading_state"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{ color: LIGHT_BLUE }}
                    />
                    Loading invited emails...
                  </div>
                ) : preApprovedEmails.length === 0 ? (
                  <div
                    data-ocid="admin.empty_state"
                    className="text-sm text-gray-400 italic"
                  >
                    No staff emails added yet.
                  </div>
                ) : (
                  <ul data-ocid="admin.list" className="flex flex-col gap-2">
                    {preApprovedEmails.map((email, idx) => (
                      <li
                        key={email}
                        data-ocid={`admin.item.${idx + 1}`}
                        className="flex items-center justify-between px-4 py-2.5 rounded-lg border"
                        style={{
                          background: "oklch(0.97 0.003 260)",
                          borderColor: "oklch(0.90 0.003 260)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400 shrink-0" />
                          <span className="text-sm text-black font-medium">
                            {email}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          data-ocid={`admin.delete_button.${idx + 1}`}
                          onClick={() => handleRemoveInviteEmail(email)}
                          disabled={removePreApprovedStaffEmail.isPending}
                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 size={12} className="mr-1" />
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Registered Users */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} style={{ color: LIGHT_BLUE }} />
                <h2 className="text-lg font-bold text-gray-900">
                  Registered Users
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${LIGHT_BLUE}22`, color: LIGHT_BLUE }}
                >
                  {users.length}
                </span>
              </div>
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "oklch(0.88 0.003 260)" }}
              >
                {loadingUsers ? (
                  <div
                    data-ocid="admin.loading_state"
                    className="p-8 text-center"
                  >
                    <Loader2
                      className="animate-spin mx-auto mb-2"
                      size={20}
                      style={{ color: LIGHT_BLUE }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Loading users...
                    </p>
                  </div>
                ) : users.length === 0 ? (
                  <div
                    data-ocid="admin.empty_state"
                    className="p-8 text-center text-sm text-muted-foreground"
                  >
                    No users registered yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Profile Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(([principal, profile], idx) => {
                        const pStr = principal.toString();
                        const isStaff =
                          profile.profileType ===
                          Variant_staff_employer_candidate.staff;
                        return (
                          <TableRow
                            key={pStr}
                            data-ocid={`admin.row.${idx + 1}`}
                            style={{ background: "oklch(0.99 0.003 260)" }}
                          >
                            <TableCell className="font-medium text-gray-900">
                              {profile.name || shortPrincipal(pStr)}
                            </TableCell>
                            <TableCell className="text-gray-600 text-sm">
                              {profile.email || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`border-0 ${
                                  isStaff
                                    ? "bg-blue-100 text-blue-700"
                                    : profile.profileType ===
                                        Variant_staff_employer_candidate.employer
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {profile.profileType as string}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className="border-0 bg-green-100 text-green-700">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {isStaff ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-ocid={`admin.secondary_button.${idx + 1}`}
                                    onClick={() => handleRemoveStaff(pStr)}
                                    disabled={removeStaff.isPending}
                                    className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    Remove Staff
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-ocid={`admin.secondary_button.${idx + 1}`}
                                    onClick={() => handleAssignStaff(pStr)}
                                    disabled={assignStaff.isPending}
                                    className="h-7 text-xs"
                                    style={{
                                      color: LIGHT_BLUE,
                                      borderColor: LIGHT_BLUE,
                                    }}
                                  >
                                    Make Staff
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-ocid={`admin.primary_button.${idx + 1}`}
                                  onClick={() => handleMakeAdmin(pStr)}
                                  disabled={assignUserRole.isPending}
                                  className="h-7 text-xs text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                                >
                                  Make Admin
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
