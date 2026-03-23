import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Variant_staff_employer_candidate } from "../backend";

const ADMIN_SEED_EMAIL = "ns244128@gmail.com";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "register";
}

export default function LoginRegisterModal({
  open,
  onOpenChange,
  defaultTab = "login",
}: Props) {
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  const { actor } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regRole, setRegRole] = useState<"candidate" | "employer">("candidate");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  // When already authenticated and modal opens, skip straight to success
  useEffect(() => {
    if (open && isAuthenticated) {
      setLoginSuccess(true);
    }
  }, [open, isAuthenticated]);

  const resetState = () => {
    setRegName("");
    setRegEmail("");
    setRegRole("candidate");
    setRegLoading(false);
    setRegError("");
    setRegSuccess(false);
    setLoginError("");
    setLoginSuccess(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) resetState();
    onOpenChange(val);
  };

  const trySeedAdmin = async () => {
    if (!actor) return;
    try {
      const granted = await actor.claimAdminSeed(ADMIN_SEED_EMAIL);
      if (granted) {
        toast.success("Admin access granted!", { duration: 3000 });
        queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      }
    } catch {
      // ignore seed errors
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      await login();
      // Directly try to claim admin seed for the known admin email
      await trySeedAdmin();
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      setLoginSuccess(true);
      setTimeout(() => handleClose(false), 1200);
    } catch (_err: any) {
      if (_err?.message === "User is already authenticated") {
        await trySeedAdmin();
        queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
        setLoginSuccess(true);
        setTimeout(() => handleClose(false), 1200);
      } else {
        setLoginError("Login failed. Please try again.");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setRegError("Please fill in all fields.");
      return;
    }
    setRegError("");
    setRegLoading(true);

    try {
      // First authenticate if not already
      if (!isAuthenticated) {
        await login();
      }
      // Save profile
      if (actor) {
        await actor.saveCallerUserProfile({
          name: regName.trim(),
          email: regEmail.trim(),
          details: "",
          profileType:
            regRole === "employer"
              ? Variant_staff_employer_candidate.employer
              : Variant_staff_employer_candidate.candidate,
        });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
        // Try to claim admin seed using the registered email
        try {
          const granted = await actor.claimAdminSeed(regEmail.trim());
          if (granted) {
            toast.success("Admin access granted!", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
          }
        } catch {
          // ignore seed errors
        }
        // Also always try with hardcoded seed email
        await trySeedAdmin();
      }
      setRegSuccess(true);
      setTimeout(() => handleClose(false), 1200);
    } catch {
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const inputStyle = {
    background: "oklch(0.96 0.003 260)",
    borderColor: "oklch(0.82 0.003 260)",
    color: "white",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "oklch(0.99 0.003 260)",
          border: "1px solid oklch(0.85 0.003 260)",
        }}
        data-ocid="auth.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-gray-900 text-xl text-center">
            Welcome to Nira Rebel
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList
            className="w-full mb-6"
            style={{
              background: "oklch(0.97 0.003 260)",
              border: "1px solid oklch(0.85 0.003 260)",
            }}
          >
            <TabsTrigger
              value="login"
              className="flex-1 text-sm data-[state=active]:text-gray-900"
              data-ocid="auth.tab"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 text-sm data-[state=active]:text-gray-900"
              data-ocid="auth.tab"
            >
              Register
            </TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login" className="mt-0">
            {loginSuccess ? (
              <div className="py-8 text-center" data-ocid="auth.success_state">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "oklch(0.62 0.18 40 / 0.15)" }}
                >
                  ✅
                </div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">
                  You're logged in!
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  Welcome back to Nira Rebel HR Agency.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div
                  className="rounded-lg p-4 text-center"
                  style={{
                    background: "oklch(0.97 0.003 260)",
                    border: "1px solid oklch(0.85 0.003 260)",
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  >
                    Click the button below to securely log in using Internet
                    Identity — a fast, password-free authentication system.
                  </p>
                </div>

                {loginError && (
                  <p
                    className="text-xs text-center"
                    style={{ color: "oklch(0.65 0.18 20)" }}
                    data-ocid="auth.error_state"
                  >
                    {loginError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn || isInitializing}
                  data-ocid="auth.submit_button"
                  className="w-full py-3 text-sm font-bold text-white rounded flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Login with Internet Identity
                    </>
                  )}
                </button>

                <p
                  className="text-xs text-center"
                  style={{ color: "oklch(0.50 0.006 260)" }}
                >
                  No account needed — your identity is secured on-chain.
                </p>
              </div>
            )}
          </TabsContent>

          {/* REGISTER TAB */}
          <TabsContent value="register" className="mt-0">
            {regSuccess ? (
              <div className="py-8 text-center" data-ocid="auth.success_state">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
                  style={{ background: "oklch(0.62 0.18 40 / 0.15)" }}
                >
                  🎉
                </div>
                <h3 className="font-serif text-lg text-gray-900 mb-1">
                  Account Created!
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  Your profile has been saved successfully.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: "oklch(0.97 0.003 260)",
                    border: "1px solid oklch(0.85 0.003 260)",
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  >
                    Create your profile to track your applications and get
                    personalised job recommendations.
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="reg-name"
                    className="text-xs mb-1.5 block"
                    style={{ color: "oklch(0.30 0.008 260)" }}
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="reg-name"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Your full name"
                    data-ocid="auth.input"
                    className="text-sm"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="reg-email"
                    className="text-xs mb-1.5 block"
                    style={{ color: "oklch(0.30 0.008 260)" }}
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-ocid="auth.input"
                    className="text-sm"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <Label
                    className="text-xs mb-2 block"
                    style={{ color: "oklch(0.30 0.008 260)" }}
                  >
                    I am a…
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["candidate", "employer"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRegRole(role)}
                        data-ocid="auth.toggle"
                        className="py-2.5 text-sm font-medium rounded capitalize transition-all"
                        style={
                          regRole === role
                            ? {
                                background: "oklch(0.62 0.18 40)",
                                color: "white",
                                border: "1px solid oklch(0.62 0.18 40)",
                              }
                            : {
                                background: "oklch(0.96 0.003 260)",
                                color: "oklch(0.45 0.008 260)",
                                border: "1px solid oklch(0.30 0.006 260)",
                              }
                        }
                      >
                        {role === "candidate" ? "Job Seeker" : "Employer"}
                      </button>
                    ))}
                  </div>
                </div>

                {regError && (
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.18 20)" }}
                    data-ocid="auth.error_state"
                  >
                    {regError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  data-ocid="auth.submit_button"
                  className="w-full py-3 text-sm font-bold text-white rounded flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  {regLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create Account
                    </>
                  )}
                </button>

                <p
                  className="text-xs text-center"
                  style={{ color: "oklch(0.50 0.006 260)" }}
                >
                  You'll be prompted to authenticate securely via Internet
                  Identity.
                </p>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
