import {
  ApplicationStatus,
  type DirectApplication,
  UserRole,
  Variant_staff_employer_candidate,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAddPreApprovedStaffEmail,
  useAssignStaffRole,
  useAssignUserRole,
  useIsAdmin,
  useListAllApplications,
  useListAllDirectApplications,
  useListAllUsers,
  useListJobs,
  useListPreApprovedStaffEmails,
  useRemovePreApprovedStaffEmail,
  useRemoveStaffRole,
  useUpdateApplicationStatus,
  useUpdateDirectApplicationStatus,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  LogIn,
  Mail,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]: "bg-gray-100 text-gray-700",
  [ApplicationStatus.shortlisted]: "bg-blue-100 text-blue-700",
  [ApplicationStatus.interviewed]: "bg-yellow-100 text-yellow-700",
  [ApplicationStatus.rejected]: "bg-red-100 text-red-700",
};

function shortPrincipal(p: string) {
  return p.length > 12 ? `${p.slice(0, 8)}...` : p;
}

const ADMIN_SEED_EMAIL = "ns244128@gmail.com";

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  // Must be a real (non-anonymous) authenticated identity
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const callerPrincipal = isAuthenticated
    ? identity.getPrincipal().toString()
    : null;

  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: users = [], isLoading: loadingUsers } = useListAllUsers();
  const { data: applications = [], isLoading: loadingApps } =
    useListAllApplications();
  const { data: jobs = [] } = useListJobs();
  const { data: directApplications = [], isLoading: loadingDirectApps } =
    useListAllDirectApplications();
  const updateDirectStatus = useUpdateDirectApplicationStatus();

  // Pre-approved staff email hooks
  const { data: preApprovedEmails = [], isLoading: loadingEmails } =
    useListPreApprovedStaffEmails();
  const addPreApprovedStaffEmail = useAddPreApprovedStaffEmail();
  const removePreApprovedStaffEmail = useRemovePreApprovedStaffEmail();

  const assignStaff = useAssignStaffRole();
  const removeStaff = useRemoveStaffRole();
  const assignUserRole = useAssignUserRole();
  const updateStatus = useUpdateApplicationStatus();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [seedEmail, setSeedEmail] = useState(ADMIN_SEED_EMAIL);
  const [seeding, setSeeding] = useState(false);
  const [autoAttempted, setAutoAttempted] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const jobMap = new Map(jobs.map(([id, job]) => [id.toString(), job.title]));

  // Auto-attempt seed ONLY when user is authenticated with a real (non-anonymous) identity
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
      actor
        .claimAdminSeed(ADMIN_SEED_EMAIL)
        .then((granted: boolean) => {
          if (granted) {
            toast.success("Admin access granted! Refreshing...", {
              duration: 2000,
            });
            queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            // Seed returned false -- user is authenticated but not the seed email
            setSeeding(false);
          }
        })
        .catch(() => {
          // ignore errors silently
        })
        .finally(() => setSeeding(false));
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

  const handleAssignStaff = async (principalStr: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await assignStaff.mutateAsync(Principal.fromText(principalStr));
      toast.success("Staff role assigned");
    } catch {
      toast.error("Failed to assign staff role");
    }
  };

  const handleRemoveStaff = async (principalStr: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await removeStaff.mutateAsync(Principal.fromText(principalStr));
      toast.success("Staff role removed");
    } catch {
      toast.error("Failed to remove staff role");
    }
  };

  const handleMakeAdmin = async (principalStr: string) => {
    try {
      const { Principal } = await import("@icp-sdk/core/principal");
      await assignUserRole.mutateAsync({
        user: Principal.fromText(principalStr),
        role: UserRole.admin,
      });
      toast.success("Admin role assigned");
    } catch {
      toast.error("Failed to assign admin role");
    }
  };

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id,
        status: status as ApplicationStatus,
      });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAddInviteEmail = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      await addPreApprovedStaffEmail.mutateAsync(email);
      setInviteEmail("");
      toast.success("Staff email added");
    } catch {
      toast.error("Failed to add staff email");
    }
  };

  const handleRemoveInviteEmail = async (email: string) => {
    try {
      await removePreApprovedStaffEmail.mutateAsync(email);
      toast.success("Email removed");
    } catch {
      toast.error("Failed to remove email");
    }
  };

  if (checkingAdmin) {
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
            style={{ color: "oklch(0.62 0.18 40)" }}
          />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in at all -- show login prompt
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div
          data-ocid="admin.error_state"
          className="text-center p-8 max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            You must be logged in with your Internet Identity before accessing
            the Admin Dashboard.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Step 1: Click the Login button in the top-right navbar.
            <br />
            Step 2: Authenticate with Internet Identity.
            <br />
            Step 3: Come back to /admin — access will be granted automatically.
          </p>
          <a
            href="/"
            data-ocid="admin.link"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: "oklch(0.62 0.18 40)" }}
          >
            <ArrowLeft size={14} /> Go to Home & Login
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div
          data-ocid="admin.error_state"
          className="text-center p-8 max-w-sm w-full"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You are logged in, but your account does not have admin privileges.
          </p>

          {seeding ? (
            <div
              data-ocid="admin.loading_state"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <Loader2
                className="animate-spin"
                size={16}
                style={{ color: "oklch(0.62 0.18 40)" }}
              />
              Activating admin access...
            </div>
          ) : (
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
                style={{ background: "oklch(0.62 0.18 40)" }}
              >
                {seeding ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Activating...
                  </>
                ) : (
                  "Activate Admin Access"
                )}
              </Button>
            </div>
          )}

          <a
            href="/"
            data-ocid="admin.link"
            className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: "oklch(0.62 0.18 40)" }}
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
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-white"
                style={{ background: "oklch(0.62 0.18 40)" }}
              >
                <ShieldCheck size={14} />
              </div>
              <h1 className="font-bold text-base text-gray-900">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <a
            href="/staff"
            data-ocid="admin.link"
            className="text-sm font-medium"
            style={{ color: "oklch(0.62 0.18 40)" }}
          >
            Staff Portal →
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <Tabs defaultValue="overview">
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
              className="px-6 text-sm font-medium data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="staff-management"
              data-ocid="admin.tab"
              className="px-6 text-sm font-medium data-[state=active]:text-white"
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
                { label: "Total Users", value: users.length, icon: "👤" },
                {
                  label: "Applications",
                  value: directApplications.length,
                  icon: "📋",
                },
                {
                  label: "Shortlisted",
                  value: applications.filter(
                    ([, a]) => a.status === ApplicationStatus.shortlisted,
                  ).length,
                  icon: "⭐",
                },
                {
                  label: "Interviewed",
                  value: applications.filter(
                    ([, a]) => a.status === ApplicationStatus.interviewed,
                  ).length,
                  icon: "🎯",
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

            {/* Direct Applications Section */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📝</span>
                <h2 className="text-lg font-bold text-gray-900">
                  Direct Applications
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "oklch(0.62 0.18 40 / 0.12)",
                    color: "oklch(0.62 0.18 40)",
                  }}
                >
                  {directApplications.length}
                </span>
              </div>
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "oklch(0.88 0.003 260)" }}
              >
                {loadingDirectApps ? (
                  <div
                    data-ocid="admin.loading_state"
                    className="p-8 text-center"
                  >
                    <Loader2
                      className="animate-spin mx-auto mb-2"
                      size={20}
                      style={{ color: "oklch(0.62 0.18 40)" }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Loading applications...
                    </p>
                  </div>
                ) : directApplications.length === 0 ? (
                  <div
                    data-ocid="admin.empty_state"
                    className="p-8 text-center text-sm text-muted-foreground"
                  >
                    No direct applications yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                        <TableHead className="text-black">#</TableHead>
                        <TableHead className="text-black">
                          Candidate Name
                        </TableHead>
                        <TableHead className="text-black">
                          Job Applied For
                        </TableHead>
                        <TableHead className="text-black">Phone</TableHead>
                        <TableHead className="text-black">Email</TableHead>
                        <TableHead className="text-black">Status</TableHead>
                        <TableHead className="text-black">
                          Update Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {directApplications.map(
                        (
                          [id, app]: [bigint, DirectApplication],
                          idx: number,
                        ) => (
                          <TableRow
                            key={id.toString()}
                            data-ocid={`admin.row.${idx + 1}`}
                            style={{ background: "oklch(0.99 0.003 260)" }}
                          >
                            <TableCell className="text-black">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="font-medium text-black">
                              {app.candidateName}
                            </TableCell>
                            <TableCell className="text-black">
                              {app.jobTitle}
                            </TableCell>
                            <TableCell className="text-black">
                              {app.phone || "—"}
                            </TableCell>
                            <TableCell className="text-black">
                              {app.email || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`border-0 ${
                                  STATUS_COLORS[app.status as ApplicationStatus]
                                }`}
                              >
                                {app.status as string}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={app.status as string}
                                onValueChange={(val) => {
                                  updateDirectStatus
                                    .mutateAsync({
                                      id,
                                      status: val as ApplicationStatus,
                                    })
                                    .then(() => toast.success("Status updated"))
                                    .catch(() =>
                                      toast.error("Failed to update status"),
                                    );
                                }}
                              >
                                <SelectTrigger
                                  data-ocid={`admin.select.${idx + 1}`}
                                  className="h-8 text-xs w-36"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={ApplicationStatus.pending}>
                                    Pending
                                  </SelectItem>
                                  <SelectItem
                                    value={ApplicationStatus.shortlisted}
                                  >
                                    Shortlisted
                                  </SelectItem>
                                  <SelectItem
                                    value={ApplicationStatus.interviewed}
                                  >
                                    Interviewed
                                  </SelectItem>
                                  <SelectItem
                                    value={ApplicationStatus.rejected}
                                  >
                                    Rejected
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </section>

            {/* Applications Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📋</span>
                <h2 className="text-lg font-bold text-gray-900">
                  Job Applications
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "oklch(0.62 0.18 40 / 0.12)",
                    color: "oklch(0.62 0.18 40)",
                  }}
                >
                  {applications.length}
                </span>
              </div>
              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "oklch(0.88 0.003 260)" }}
              >
                {loadingApps ? (
                  <div
                    data-ocid="admin.loading_state"
                    className="p-8 text-center"
                  >
                    <Loader2
                      className="animate-spin mx-auto mb-2"
                      size={20}
                      style={{ color: "oklch(0.62 0.18 40)" }}
                    />
                    <p className="text-sm text-muted-foreground">
                      Loading applications...
                    </p>
                  </div>
                ) : applications.length === 0 ? (
                  <div
                    data-ocid="admin.empty_state"
                    className="p-8 text-center text-sm text-muted-foreground"
                  >
                    No applications yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Cover Letter</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Update Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map(([id, app], idx) => (
                        <TableRow
                          key={id.toString()}
                          data-ocid={`admin.row.${idx + 1}`}
                          style={{ background: "oklch(0.99 0.003 260)" }}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {shortPrincipal(app.applicant.toString())}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {jobMap.get(app.jobId.toString()) ||
                              `Job #${app.jobId}`}
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-xs text-muted-foreground truncate">
                              {app.coverLetter || "—"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 ${STATUS_COLORS[app.status]}`}
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={app.status}
                              onValueChange={(val) =>
                                handleStatusChange(id, val)
                              }
                            >
                              <SelectTrigger
                                data-ocid={`admin.select.${idx + 1}`}
                                className="h-8 text-xs w-36"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={ApplicationStatus.pending}>
                                  Pending
                                </SelectItem>
                                <SelectItem
                                  value={ApplicationStatus.shortlisted}
                                >
                                  Shortlisted
                                </SelectItem>
                                <SelectItem
                                  value={ApplicationStatus.interviewed}
                                >
                                  Interviewed
                                </SelectItem>
                                <SelectItem value={ApplicationStatus.rejected}>
                                  Rejected
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ─── STAFF MANAGEMENT TAB ─── */}
          <TabsContent value="staff-management">
            {/* ── Invite Staff by Email ── */}
            <section className="mb-8">
              <div
                className="rounded-xl border p-6"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  borderColor: "oklch(0.88 0.003 260)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={18} style={{ color: "oklch(0.62 0.18 40)" }} />
                  <h2 className="text-lg font-bold text-gray-900">
                    Invite Staff by Email
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                  Enter a staff member&apos;s email below. When they register
                  with this email, they will automatically get Staff access.
                </p>

                {/* Input row */}
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
                    style={{ background: "oklch(0.62 0.18 40)" }}
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

                {/* Pre-approved email list */}
                {loadingEmails ? (
                  <div
                    data-ocid="admin.loading_state"
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                      style={{ color: "oklch(0.62 0.18 40)" }}
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

            {/* ── Registered Users ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} style={{ color: "oklch(0.62 0.18 40)" }} />
                <h2 className="text-lg font-bold text-gray-900">
                  Registered Users
                </h2>
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "oklch(0.62 0.18 40 / 0.12)",
                    color: "oklch(0.62 0.18 40)",
                  }}
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
                      style={{ color: "oklch(0.62 0.18 40)" }}
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
                            <TableCell className="text-sm text-muted-foreground">
                              {profile.email || "—"}
                            </TableCell>
                            <TableCell>
                              <span className="capitalize text-sm">
                                {profile.profileType}
                              </span>
                            </TableCell>
                            <TableCell>
                              {isStaff ? (
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  Staff
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-600 border-0">
                                  User
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 flex-wrap">
                                {isStaff ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-ocid={`admin.delete_button.${idx + 1}`}
                                    onClick={() => handleRemoveStaff(pStr)}
                                    disabled={removeStaff.isPending}
                                    className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs"
                                  >
                                    Remove Staff
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    data-ocid={`admin.primary_button.${idx + 1}`}
                                    onClick={() => handleAssignStaff(pStr)}
                                    disabled={assignStaff.isPending}
                                    className="h-7 text-xs text-white"
                                    style={{
                                      background: "oklch(0.62 0.18 40)",
                                    }}
                                  >
                                    Add Staff
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-ocid={`admin.secondary_button.${idx + 1}`}
                                  onClick={() => handleMakeAdmin(pStr)}
                                  disabled={assignUserRole.isPending}
                                  className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                >
                                  <ShieldCheck size={12} className="mr-1" />
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
