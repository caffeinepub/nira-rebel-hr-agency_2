import {
  ApplicationStatus,
  UserRole,
  Variant_staff_employer_candidate,
} from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  useAssignStaffRole,
  useIsAdmin,
  useListAllApplications,
  useListAllUsers,
  useListJobs,
  useRemoveStaffRole,
  useUpdateApplicationStatus,
} from "@/hooks/useQueries";
import { ArrowLeft, Loader2, ShieldCheck, Users } from "lucide-react";
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

export default function AdminDashboard() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: users = [], isLoading: loadingUsers } = useListAllUsers();
  const { data: applications = [], isLoading: loadingApps } =
    useListAllApplications();
  const { data: jobs = [] } = useListJobs();

  const assignStaff = useAssignStaffRole();
  const removeStaff = useRemoveStaffRole();
  const updateStatus = useUpdateApplicationStatus();

  const jobMap = new Map(jobs.map(([id, job]) => [id.toString(), job.title]));

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

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div data-ocid="admin.error_state" className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need admin privileges to access this dashboard.
          </p>
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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Users", value: users.length, icon: "👤" },
            { label: "Applications", value: applications.length, icon: "📋" },
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

        {/* Users Section */}
        <section className="mb-10">
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
              <div data-ocid="admin.loading_state" className="p-8 text-center">
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
                    <TableHead>Staff Status</TableHead>
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
                          <div className="flex gap-2">
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
                                style={{ background: "oklch(0.62 0.18 40)" }}
                              >
                                Assign Staff
                              </Button>
                            )}
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
              <div data-ocid="admin.loading_state" className="p-8 text-center">
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
                          onValueChange={(val) => handleStatusChange(id, val)}
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
                            <SelectItem value={ApplicationStatus.shortlisted}>
                              Shortlisted
                            </SelectItem>
                            <SelectItem value={ApplicationStatus.interviewed}>
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
      </main>
    </div>
  );
}
