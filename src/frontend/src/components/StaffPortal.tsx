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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import {
  type AttendanceLog,
  useClockIn,
  useClockOut,
  useGetStaffAttendance,
  useIsStaffClockedIn,
} from "@/hooks/useQueries";
import {
  ArrowLeft,
  Clock,
  ClockIcon,
  KeyRound,
  Loader2,
  MessageCircle,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.pending]: "bg-gray-100 text-gray-700",
  [ApplicationStatus.shortlisted]: "bg-blue-100 text-blue-700",
  [ApplicationStatus.interviewed]: "bg-yellow-100 text-yellow-700",
  [ApplicationStatus.rejected]: "bg-red-100 text-red-700",
};

const LIGHT_BLUE = "#5BB8D4";

type StaffSession = { userId: string; name: string; password: string };

function getStoredSession(): StaffSession | null {
  try {
    const raw = localStorage.getItem("staffSession");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StaffSession>;
    // Require password to be stored — sessions without password can't fetch data
    if (!parsed.userId || !parsed.name || !parsed.password) return null;
    return parsed as StaffSession;
  } catch {
    return null;
  }
}

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

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// WhatsApp link helper — strips non-digits and builds wa.me URL
function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

// ─── Attendance Tab ──────────────────────────────────────────────────────────
function AttendanceTab({ session }: { session: StaffSession }) {
  const { data: isClockedIn = false, isLoading: checkingStatus } =
    useIsStaffClockedIn(session.userId);
  const { data: logs = [], isLoading: loadingLogs } = useGetStaffAttendance(
    session.userId,
  );
  const clockIn = useClockIn();
  const clockOut = useClockOut();

  const todayStr = getTodayDate();
  const todayLog = logs.find((l) => l.date === todayStr);

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync({
        staffId: session.userId,
        staffName: session.name,
        date: todayStr,
      });
      toast.success("Clocked in successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Clock-in failed: ${msg}`);
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut.mutateAsync(session.userId);
      toast.success("Clocked out successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Clock-out failed: ${msg}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div
        className="rounded-2xl border p-8 flex flex-col items-center gap-6"
        style={{
          background: "oklch(0.99 0.003 260)",
          borderColor: "oklch(0.88 0.003 260)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: isClockedIn ? "#fef2f2" : "#f0fdf4" }}
        >
          <ClockIcon
            size={40}
            style={{ color: isClockedIn ? "#ef4444" : "#22c55e" }}
          />
        </div>

        {checkingStatus ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2
              size={16}
              className="animate-spin"
              style={{ color: LIGHT_BLUE }}
            />
            Checking status...
          </div>
        ) : (
          <div className="text-center">
            {isClockedIn ? (
              <>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  Currently Clocked In
                </div>
                {todayLog && (
                  <div className="text-sm text-gray-500">
                    Since {formatNanoTs(todayLog.clockIn)}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  Not Clocked In Today
                </div>
                <div className="text-sm text-gray-500">
                  Click below to start your shift
                </div>
              </>
            )}
          </div>
        )}

        {isClockedIn ? (
          <Button
            onClick={handleClockOut}
            disabled={clockOut.isPending}
            className="w-48 h-12 text-base font-bold text-white rounded-xl"
            style={{ background: "#ef4444" }}
          >
            {clockOut.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" /> Clocking
                Out...
              </>
            ) : (
              <>
                <Clock size={18} className="mr-2" /> Clock Out
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleClockIn}
            disabled={clockIn.isPending}
            className="w-48 h-12 text-base font-bold text-white rounded-xl"
            style={{ background: "#22c55e" }}
          >
            {clockIn.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" /> Clocking
                In...
              </>
            ) : (
              <>
                <Clock size={18} className="mr-2" /> Clock In
              </>
            )}
          </Button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          My Attendance History
        </h2>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "oklch(0.88 0.003 260)" }}
        >
          {loadingLogs ? (
            <div className="p-8 text-center">
              <Loader2
                className="animate-spin mx-auto mb-2"
                size={20}
                style={{ color: LIGHT_BLUE }}
              />
              <p className="text-sm text-muted-foreground">
                Loading attendance...
              </p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No attendance records yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ background: "oklch(0.97 0.003 260)" }}>
                  <TableHead className="text-black">#</TableHead>
                  <TableHead className="text-black">Date</TableHead>
                  <TableHead className="text-black">Clock In</TableHead>
                  <TableHead className="text-black">Clock Out</TableHead>
                  <TableHead className="text-black">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...logs]
                  .sort((a, b) => (a.clockIn < b.clockIn ? 1 : -1))
                  .map((log: AttendanceLog, idx: number) => (
                    <TableRow
                      key={log.logId.toString()}
                      style={{ background: "oklch(0.99 0.003 260)" }}
                    >
                      <TableCell className="text-black">{idx + 1}</TableCell>
                      <TableCell className="text-black font-medium">
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
          )}
        </div>
      </div>
    </div>
  );
}

export default function StaffPortal() {
  const { actor } = useActor();

  const [session, setSession] = useState<StaffSession | null>(getStoredSession);
  const [activeTab, setActiveTab] = useState("applications");
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotUserId, setForgotUserId] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [apps, setApps] = useState<Array<[bigint, DirectApplication]>>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Fetch applications using stored credentials — works for ANY staff account
  const fetchApps = useCallback(
    async (sess: StaffSession) => {
      if (!actor) return;
      setLoadingApps(true);
      try {
        const result = await actor.listDirectApplicationsWithCredentials(
          sess.userId,
          sess.password,
        );
        if (result !== null) {
          setApps(result);
        } else {
          toast.error("Session expired. Please log in again.");
        }
      } catch {
        toast.error("Failed to load applications.");
      } finally {
        setLoadingApps(false);
      }
    },
    [actor],
  );

  // Auto-fetch whenever session or actor becomes available
  useEffect(() => {
    if (session && actor) {
      void fetchApps(session);
    }
  }, [session, actor, fetchApps]);

  const handleLogin = async () => {
    if (!loginUserId.trim() || !loginPassword.trim()) {
      setLoginError("Please enter your UserID and password.");
      return;
    }
    if (!actor) {
      setLoginError("Not connected to backend. Please wait and try again.");
      return;
    }
    setLoggingIn(true);
    setLoginError("");
    try {
      // verifyStaffLogin checks credentials AND isActive flag in the backend
      const result = await actor.verifyStaffLogin(
        loginUserId.trim(),
        loginPassword,
      );
      if (result) {
        const sess: StaffSession = {
          userId: result.userId,
          name: result.name,
          password: loginPassword,
        };
        localStorage.setItem("staffSession", JSON.stringify(sess));
        setSession(sess);
        toast.success(`Welcome, ${result.name}!`);
      } else {
        setLoginError("Invalid UserID or password, or account is deactivated.");
      }
    } catch {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("staffSession");
    setSession(null);
    setApps([]);
    setLoginUserId("");
    setLoginPassword("");
    setLoginError("");
    setActiveTab("applications");
  };

  const handleStatusChange = async (id: bigint, status: string) => {
    if (!session || !actor) return;
    try {
      const ok = await actor.updateDirectApplicationStatusWithCredentials(
        session.userId,
        session.password,
        id,
        status as ApplicationStatus,
      );
      if (!ok) {
        toast.error("Failed to update status — session may have expired.");
        return;
      }
      // Refresh list after update
      await fetchApps(session);
      toast.success("Application status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ─── Forgot Password Screen ──────────────────────────────────────────────
  if (forgotPasswordMode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl border shadow-lg p-8"
          style={{
            background: "oklch(0.99 0.003 260)",
            borderColor: "oklch(0.88 0.003 260)",
          }}
        >
          <div className="text-center mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: LIGHT_BLUE }}
            >
              <KeyRound size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {forgotStep === 1 ? "Reset Password" : "Enter OTP & New Password"}
            </h1>
          </div>

          {forgotStep === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500 text-center">
                Enter your Staff UserID to request an OTP from Admin.
              </p>
              <div>
                <label
                  htmlFor="forgot-userid"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  UserID
                </label>
                <Input
                  id="forgot-userid"
                  type="text"
                  value={forgotUserId}
                  onChange={(e) => {
                    setForgotUserId(e.target.value);
                    setForgotError("");
                  }}
                  placeholder="Enter your UserID"
                  className="text-black"
                />
              </div>
              {forgotError && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium text-center"
                  style={{
                    background: "#fff3f3",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                  }}
                >
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium text-center"
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #86efac",
                    color: "#15803d",
                  }}
                >
                  {forgotSuccess}
                </div>
              )}
              <Button
                onClick={async () => {
                  if (!forgotUserId.trim()) {
                    setForgotError("Please enter your UserID.");
                    return;
                  }
                  if (!actor) {
                    setForgotError("Connection not ready. Please try again.");
                    return;
                  }
                  setForgotLoading(true);
                  setForgotError("");
                  setForgotSuccess("");
                  try {
                    const ok = await actor.requestPasswordResetOTP(
                      forgotUserId.trim(),
                    );
                    if (ok) {
                      setForgotSuccess(
                        "OTP request sent. Ask your Admin for the 6-digit OTP code.",
                      );
                      setForgotStep(2);
                    } else {
                      setForgotError(
                        "UserID not found. Please check and try again.",
                      );
                    }
                  } catch {
                    setForgotError(
                      "Failed to send OTP request. Please try again.",
                    );
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                disabled={forgotLoading}
                className="w-full text-white font-semibold mt-2"
                style={{ background: LIGHT_BLUE }}
              >
                {forgotLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />{" "}
                    Sending...
                  </>
                ) : (
                  "Request OTP"
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </div>
            </div>
          )}

          {forgotStep === 2 && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-lg px-4 py-3 text-sm"
                style={{ background: `${LIGHT_BLUE}22`, color: "#1e4a5c" }}
              >
                Your Admin has been notified. Ask them for the 6-digit OTP, then
                enter it below.
              </div>
              <div>
                <label
                  htmlFor="forgot-otp"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  OTP Code
                </label>
                <Input
                  id="forgot-otp"
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => {
                    setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setForgotError("");
                  }}
                  placeholder="6-digit OTP"
                  className="text-black font-mono tracking-widest"
                  maxLength={6}
                />
              </div>
              <div>
                <label
                  htmlFor="forgot-newpw"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <Input
                  id="forgot-newpw"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => {
                    setForgotNewPassword(e.target.value);
                    setForgotError("");
                  }}
                  placeholder="Enter new password"
                  className="text-black"
                />
              </div>
              <div>
                <label
                  htmlFor="forgot-confirmpw"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <Input
                  id="forgot-confirmpw"
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(e) => {
                    setForgotConfirmPassword(e.target.value);
                    setForgotError("");
                  }}
                  placeholder="Confirm new password"
                  className="text-black"
                />
              </div>
              {forgotError && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-medium text-center"
                  style={{
                    background: "#fff3f3",
                    border: "1px solid #fca5a5",
                    color: "#b91c1c",
                  }}
                >
                  {forgotError}
                </div>
              )}
              <Button
                onClick={async () => {
                  if (forgotOtp.length !== 6) {
                    setForgotError("OTP must be 6 digits.");
                    return;
                  }
                  if (!forgotNewPassword) {
                    setForgotError("Please enter a new password.");
                    return;
                  }
                  if (forgotNewPassword !== forgotConfirmPassword) {
                    setForgotError("Passwords do not match.");
                    return;
                  }
                  if (!actor) {
                    setForgotError("Connection not ready. Please try again.");
                    return;
                  }
                  setForgotLoading(true);
                  setForgotError("");
                  try {
                    const ok = await actor.verifyOTPAndResetPassword(
                      forgotUserId.trim(),
                      forgotOtp,
                      forgotNewPassword,
                    );
                    if (ok) {
                      toast.success(
                        "Password reset successfully. Please log in.",
                      );
                      setForgotPasswordMode(false);
                      setForgotStep(1);
                      setForgotUserId("");
                      setForgotOtp("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotError("");
                      setForgotSuccess("");
                    } else {
                      setForgotError(
                        "Invalid or expired OTP. Please try again.",
                      );
                    }
                  } catch {
                    setForgotError(
                      "Failed to reset password. Please try again.",
                    );
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                disabled={forgotLoading}
                className="w-full text-white font-semibold mt-2"
                style={{ background: LIGHT_BLUE }}
              >
                {forgotLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />{" "}
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  // ─── Login Screen ────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl border shadow-lg p-8"
          style={{
            background: "oklch(0.99 0.003 260)",
            borderColor: "oklch(0.88 0.003 260)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: LIGHT_BLUE }}
            >
              <Users size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Nira Rebel HR Agency
            </h1>
            <p className="text-sm text-gray-500 mt-1">Staff Portal Login</p>
          </div>

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
                onChange={(e) => {
                  setLoginUserId(e.target.value);
                  setLoginError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                placeholder="Enter your UserID"
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
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                  placeholder="Enter your password"
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

            {loginError && (
              <div
                className="rounded-lg px-4 py-3 text-sm font-medium text-center"
                style={{
                  background: "#fff3f3",
                  border: "1px solid #fca5a5",
                  color: "#b91c1c",
                }}
              >
                {loginError}
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={loggingIn}
              className="w-full text-white font-semibold mt-2"
              style={{ background: LIGHT_BLUE }}
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

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setForgotPasswordMode(true);
                setForgotStep(1);
                setForgotError("");
                setForgotSuccess("");
                setForgotUserId("");
                setForgotOtp("");
                setForgotNewPassword("");
                setForgotConfirmPassword("");
              }}
              className="text-sm underline hover:opacity-80"
              style={{ color: LIGHT_BLUE }}
            >
              Forgot Password?
            </button>
          </div>
          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Portal (logged in) ─────────────────────────────────────────────
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
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Back to Site
            </a>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-white"
                style={{ background: LIGHT_BLUE }}
              >
                <Users size={14} />
              </div>
              <h1 className="font-bold text-base text-gray-900">
                Staff Portal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              Welcome, <strong>{session.name}</strong>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              className="text-sm h-8"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="mb-8 h-11 gap-2 p-1"
            style={{ background: "#e0f2fe", border: "1px solid #7dd3fc" }}
          >
            <TabsTrigger
              value="applications"
              className="px-6 text-sm font-bold text-black data-[state=active]:text-black data-[state=active]:shadow-sm"
              style={
                {
                  background: LIGHT_BLUE,
                  color: "#000",
                  fontWeight: 700,
                } as React.CSSProperties
              }
            >
              Applications
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="px-6 text-sm font-bold text-black data-[state=active]:text-black data-[state=active]:shadow-sm"
              style={
                {
                  background: LIGHT_BLUE,
                  color: "#000",
                  fontWeight: 700,
                } as React.CSSProperties
              }
            >
              <Clock size={14} className="mr-1.5" />
              Attendance
            </TabsTrigger>
          </TabsList>

          {/* ─── Applications Tab ─── */}
          <TabsContent value="applications">
            <div className="flex justify-end gap-2 mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchApps(session)}
                disabled={loadingApps}
                className="text-black font-semibold border-gray-300"
              >
                {loadingApps ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="text-black font-semibold border-gray-300"
              >
                Print Report
              </Button>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total", value: apps.length, color: "text-gray-700" },
                {
                  label: "Pending",
                  value: apps.filter(
                    ([, a]) => a.status === ApplicationStatus.pending,
                  ).length,
                  color: "text-gray-600",
                },
                {
                  label: "Shortlisted",
                  value: apps.filter(
                    ([, a]) => a.status === ApplicationStatus.shortlisted,
                  ).length,
                  color: "text-blue-600",
                },
                {
                  label: "Interviewed",
                  value: apps.filter(
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
                <div className="p-8 text-center">
                  <Loader2
                    className="animate-spin mx-auto mb-2"
                    size={20}
                    style={{ color: LIGHT_BLUE }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Loading applications...
                  </p>
                </div>
              ) : apps.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No applications yet.
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
                    {apps.map(
                      ([id, app]: [bigint, DirectApplication], idx: number) => (
                        <TableRow
                          key={id.toString()}
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
                            <div className="flex items-center gap-2">
                              <span>{app.phone || "—"}</span>
                              {app.phone && (
                                <a
                                  href={buildWhatsAppLink(app.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`WhatsApp ${app.phone}`}
                                  className="flex items-center justify-center w-7 h-7 rounded-full hover:opacity-80 transition-opacity"
                                  style={{ background: "#25D366" }}
                                >
                                  <MessageCircle
                                    size={14}
                                    className="text-white"
                                    fill="white"
                                  />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-black">
                            {app.email || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 ${STATUS_COLORS[app.status as ApplicationStatus]}`}
                            >
                              {app.status as string}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={app.status as string}
                              onValueChange={(val) =>
                                handleStatusChange(id, val)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs w-36">
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
                      ),
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* ─── Attendance Tab ─── */}
          <TabsContent value="attendance">
            <AttendanceTab session={session} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
