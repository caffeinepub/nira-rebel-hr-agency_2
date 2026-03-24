import { ApplicationStatus, type DirectApplication } from "@/backend";
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
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useIsCallerStaffOrAdmin,
  useListAllDirectApplications,
  useUpdateDirectApplicationStatus,
} from "@/hooks/useQueries";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]: "bg-gray-100 text-gray-700",
  [ApplicationStatus.shortlisted]: "bg-blue-100 text-blue-700",
  [ApplicationStatus.interviewed]: "bg-yellow-100 text-yellow-700",
  [ApplicationStatus.rejected]: "bg-red-100 text-red-700",
};

type StaffSession = { userId: string; name: string };

function getStoredSession(): StaffSession | null {
  try {
    const raw = localStorage.getItem("staffSession");
    if (!raw) return null;
    return JSON.parse(raw) as StaffSession;
  } catch {
    return null;
  }
}

export default function StaffPortal() {
  const { identity } = useInternetIdentity();
  const isAdminViaII = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: isStaffOrAdmin, isLoading: checkingAccess } =
    useIsCallerStaffOrAdmin();

  const updateStatus = useUpdateDirectApplicationStatus();

  const { actor } = useActor();

  const [session, setSession] = useState<StaffSession | null>(getStoredSession);
  const { data: directApplications = [], isLoading: loadingApps } =
    useListAllDirectApplications({ enabled: isAdminViaII || !!session });
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleManualLogin = async () => {
    if (!loginUserId.trim() || !loginPassword.trim()) {
      toast.error("Please enter your UserID and password");
      return;
    }
    if (!actor) {
      toast.error("Not connected to backend");
      return;
    }
    setLoggingIn(true);
    try {
      const result = (await (actor as any).verifyStaffLogin(
        loginUserId.trim(),
        loginPassword,
      )) as { userId: string; name: string } | null;
      if (result) {
        const sess: StaffSession = { userId: result.userId, name: result.name };
        localStorage.setItem("staffSession", JSON.stringify(sess));
        setSession(sess);
        toast.success(`Welcome, ${result.name}!`);
      } else {
        toast.error("Invalid UserID or password");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleManualLogout = () => {
    localStorage.removeItem("staffSession");
    setSession(null);
    setLoginUserId("");
    setLoginPassword("");
  };

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

  // Determine if user has access
  const hasAccess = !!session || (isAdminViaII && !!isStaffOrAdmin);

  // Show login page if not authenticated
  if (!hasAccess) {
    // Show loading while checking II access
    if (checkingAccess && isAdminViaII) {
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
              style={{ color: "oklch(0.62 0.18 220)" }}
            />
            <p className="text-sm text-muted-foreground">Verifying access...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div
          data-ocid="staff.dialog"
          className="w-full max-w-md rounded-2xl border shadow-lg p-8"
          style={{
            background: "oklch(0.99 0.003 260)",
            borderColor: "oklch(0.88 0.003 260)",
          }}
        >
          {/* Logo area */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "oklch(0.62 0.18 220)" }}
            >
              <Users size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Nira Rebel HR Agency
            </h1>
            <p className="text-sm text-gray-500 mt-1">Staff Portal Login</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="staff-userid"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UserID
              </label>
              <Input
                id="staff-userid"
                type="text"
                value={loginUserId}
                onChange={(e) => setLoginUserId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualLogin();
                }}
                placeholder="Enter your UserID"
                data-ocid="staff.input"
                className="text-black"
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="staff-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleManualLogin();
                  }}
                  placeholder="Enter your password"
                  data-ocid="staff.input"
                  className="text-black pr-16"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <Button
              onClick={handleManualLogin}
              disabled={loggingIn}
              data-ocid="staff.submit_button"
              className="w-full text-white font-semibold mt-2"
              style={{ background: "oklch(0.62 0.18 220)" }}
            >
              {loggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Signing
                  in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/"
              data-ocid="staff.link"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Portal content (logged in)
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
                style={{ background: "oklch(0.62 0.18 220)" }}
              >
                <Users size={14} />
              </div>
              <h1 className="font-bold text-base text-gray-900">
                Staff Portal — Applications
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session && (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, <strong>{session.name}</strong>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleManualLogout}
                  data-ocid="staff.secondary_button"
                  className="text-sm h-8"
                >
                  Logout
                </Button>
              </>
            )}
            {isAdminViaII && (
              <a
                href="/admin"
                data-ocid="staff.link"
                className="text-sm font-medium"
                style={{ color: "oklch(0.62 0.18 220)" }}
              >
                Admin Dashboard
              </a>
            )}
          </div>
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
                style={{ color: "oklch(0.62 0.18 220)" }}
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
