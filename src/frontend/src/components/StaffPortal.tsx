import { ApplicationStatus, type DirectApplication } from "@/backend";
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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useIsCallerStaffOrAdmin,
  useListAllDirectApplications,
  useUpdateDirectApplicationStatus,
} from "@/hooks/useQueries";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]: "bg-gray-100 text-gray-700",
  [ApplicationStatus.shortlisted]: "bg-blue-100 text-blue-700",
  [ApplicationStatus.interviewed]: "bg-yellow-100 text-yellow-700",
  [ApplicationStatus.rejected]: "bg-red-100 text-red-700",
};

export default function StaffPortal() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: isStaffOrAdmin, isLoading: checkingAccess } =
    useIsCallerStaffOrAdmin();
  const { data: directApplications = [], isLoading: loadingApps } =
    useListAllDirectApplications();
  const updateStatus = useUpdateDirectApplicationStatus();

  const handleStatusChange = async (id: bigint, status: string) => {
    try {
      await updateStatus.mutateAsync({
        id,
        status: status as ApplicationStatus,
      });
      toast.success("Application status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (checkingAccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div
          data-ocid="staff.loading_state"
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

  if (!isAuthenticated || !isStaffOrAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div data-ocid="staff.error_state" className="text-center p-8">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Staff Access Required
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            You need to be a staff member or admin to access this portal. Please
            log in or contact your administrator to grant you staff access.
          </p>
          <a
            href="/"
            data-ocid="staff.link"
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
              data-ocid="staff.link"
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
                <Users size={14} />
              </div>
              <h1 className="font-bold text-base text-gray-900">
                Staff Portal — Applications
              </h1>
            </div>
          </div>
          <a
            href="/admin"
            data-ocid="staff.link"
            className="text-sm font-medium"
            style={{ color: "oklch(0.62 0.18 40)" }}
          >
            Admin Dashboard →
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Total",
              value: directApplications.length,
              color: "text-gray-700",
            },
            {
              label: "Pending",
              value: directApplications.filter(
                ([, a]) => a.status === ApplicationStatus.pending,
              ).length,
              color: "text-gray-600",
            },
            {
              label: "Shortlisted",
              value: directApplications.filter(
                ([, a]) => a.status === ApplicationStatus.shortlisted,
              ).length,
              color: "text-blue-600",
            },
            {
              label: "Interviewed",
              value: directApplications.filter(
                ([, a]) => a.status === ApplicationStatus.interviewed,
              ).length,
              color: "text-yellow-600",
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
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "oklch(0.88 0.003 260)" }}
        >
          {loadingApps ? (
            <div data-ocid="staff.loading_state" className="p-8 text-center">
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
              data-ocid="staff.empty_state"
              className="p-8 text-center text-sm text-muted-foreground"
            >
              No applications yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                  <TableHead className="text-black">#</TableHead>
                  <TableHead className="text-black">Candidate Name</TableHead>
                  <TableHead className="text-black">Job Applied For</TableHead>
                  <TableHead className="text-black">Phone</TableHead>
                  <TableHead className="text-black">Email</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                  <TableHead className="text-black">Update Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directApplications.map(
                  ([id, app]: [bigint, DirectApplication], idx: number) => (
                    <TableRow
                      key={id.toString()}
                      data-ocid={`staff.row.${idx + 1}`}
                      style={{ background: "oklch(0.99 0.003 260)" }}
                    >
                      <TableCell className="text-black">{idx + 1}</TableCell>
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
                          onValueChange={(val) => handleStatusChange(id, val)}
                        >
                          <SelectTrigger
                            data-ocid={`staff.select.${idx + 1}`}
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
                  ),
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
