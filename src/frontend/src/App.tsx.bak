import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallerRole, useIsAdmin } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Star,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import LoginRegisterModal from "./components/LoginRegisterModal";
import StaffPortal from "./components/StaffPortal";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Candidates", href: "#candidates" },
  { label: "Employers", href: "#employers" },
  { label: "Job Search", href: "#jobs", active: true },
  { label: "Locations", href: "#locations" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "#blog" },
];

const CLIENT_LOGOS = [
  { name: "SBI", color: "#1a3a6b", bg: "#ffffff" },
  { name: "PNB", color: "#1a5276", bg: "#ffffff" },
  { name: "AXIS BANK", color: "#97144d", bg: "#ffffff" },
  { name: "HITACHI", color: "#d32f2f", bg: "#ffffff" },
  { name: "METRO", color: "#1565c0", bg: "#ffffff" },
  { name: "BLINKIT", color: "#f9a825", bg: "#ffffff" },
];

const FEATURED_JOBS = [
  { title: "ATM Operator", company: "SBI Bank", location: "New Delhi" },
  { title: "Floor Coordinator", company: "Metro Rail", location: "Delhi" },
  {
    title: "Credit Card Executive",
    company: "Axis Bank",
    location: "Gurugram",
  },
  { title: "Cash Management Officer", company: "Hitachi", location: "Delhi" },
  {
    title: "Quick Commerce Executive",
    company: "Blinkit",
    location: "Delhi NCR",
  },
  { title: "Bank Sales Executive", company: "PNB Bank", location: "Delhi" },
  { title: "E-commerce Executive", company: "Flipkart", location: "Delhi" },
  { title: "Delivery Executive", company: "Swiggy", location: "Gurugram" },
  { title: "Account Manager", company: "Amazon", location: "Delhi" },
  { title: "Warehouse Associate", company: "Blinkit", location: "Faridabad" },
];

const EXPERTISE = [
  {
    icon: "🔍",
    title: "Executive Search",
    desc: "Specialized placement for senior & leadership roles in banking and finance.",
  },
  {
    icon: "🏦",
    title: "Banking Recruitment",
    desc: "Connecting skilled professionals with top banks: SBI, PNB, Axis Bank and more.",
  },
  {
    icon: "🛒",
    title: "E-commerce Staffing",
    desc: "Placing candidates across Blinkit, Swiggy, Flipkart, Amazon & delivery networks.",
  },
  {
    icon: "⚙️",
    title: "Testing & Operations",
    desc: "ATM testing, cash management operations, and floor coordination staffing.",
  },
];

const TESTIMONIALS = [
  {
    text: "I got placed at SBI Bank through Nira Rebel HR Agency. The process was smooth and the team was very supportive. Highly recommended!",
    name: "Rahul Sharma",
    role: "SBI Bank Employee",
    initials: "RS",
  },
  {
    text: "They helped me find a great job at Blinkit. Very professional team that understands what candidates need.",
    name: "Priya Singh",
    role: "Blinkit Executive",
    initials: "PS",
  },
  {
    text: "Got placed at Metro Rail within 2 weeks. Amazing service and very genuine people. Thank you Nira Rebel!",
    name: "Amit Kumar",
    role: "Metro Rail Staff",
    initials: "AK",
  },
];

const BLOG_POSTS = [
  {
    image: "/assets/generated/blog-bank-interview.dim_600x400.jpg",
    title: "How to Crack Bank Job Interviews in 2026",
    excerpt:
      "Top tips and strategies for clearing SBI, PNB, and Axis Bank job interviews.",
  },
  {
    image: "/assets/generated/blog-delhi-jobs.dim_600x400.jpg",
    title: "Top In-Demand Jobs in Delhi NCR",
    excerpt:
      "From quick commerce to banking, discover the most sought-after roles in Delhi NCR this year.",
  },
  {
    image: "/assets/generated/blog-resume-tips.dim_600x400.jpg",
    title: "Resume Tips for Freshers in Banking",
    excerpt:
      "Build a standout resume that gets noticed by top HR agencies and banks in India.",
  },
];

const QUICK_LINKS = [
  "Home",
  "About Us",
  "Job Search",
  "Apply Now",
  "Privacy Policy",
];

interface ApplyFormData {
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  qualification: string;
  experience: string;
  position: string;
  location: string;
  message: string;
}

const initialForm: ApplyFormData = {
  name: "",
  phone: "",
  email: "",
  age: "",
  gender: "",
  qualification: "",
  experience: "",
  position: "",
  location: "",
  message: "",
};

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ApplyFormData>(initialForm);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const [currentPage, setCurrentPage] = useState<string>(
    window.location.pathname,
  );
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const { data: callerRole } = useCallerRole();
  const isStaffOrAdmin = callerRole === "admin" || callerRole === "user";
  const principalStr = identity?.getPrincipal().toString() ?? "";
  // Show short form of principal as display name
  const shortId = principalStr
    ? `${principalStr.slice(0, 5)}…${principalStr.slice(-3)}`
    : "";

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
  };

  const handleFormChange = (key: keyof ApplyFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setApplyOpen(false);
    setSubmitted(false);
    setForm(initialForm);
  };

  // Simple routing
  if (currentPage === "/admin")
    return (
      <>
        <AdminDashboard />
        <Toaster />
      </>
    );
  if (currentPage === "/staff")
    return (
      <>
        <StaffPortal />
        <Toaster />
      </>
    );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background: "oklch(0.99 0.003 260)",
          borderBottom: "1px solid oklch(0.88 0.003 260)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="#top"
              className="flex items-center gap-2 flex-shrink-0"
              data-ocid="nav.link"
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg"
                style={{ background: "oklch(0.62 0.18 40)" }}
              >
                N
              </div>
              <div className="leading-tight">
                <span
                  className="font-bold text-sm tracking-wider"
                  style={{ color: "oklch(0.62 0.18 40)" }}
                >
                  NIRA REBEL
                </span>
                <span className="block text-xs text-muted-foreground tracking-widest">
                  HR AGENCY
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  data-ocid="nav.link"
                  className={`px-3 py-2 text-sm font-medium transition-colors rounded ${
                    link.active
                      ? "text-brand-orange"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            {/* Dashboard Links */}
            <div className="hidden lg:flex items-center gap-1">
              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("/staff");
                    window.history.pushState({}, "", "/staff");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded"
                >
                  Staff Portal
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage("/admin");
                    window.history.pushState({}, "", "/admin");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-medium rounded font-semibold"
                  style={{ color: "oklch(0.62 0.18 40)" }}
                >
                  Admin Dashboard
                </button>
              )}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm"
                    style={{ color: "oklch(0.20 0.008 260)" }}
                  >
                    <User size={14} style={{ color: "oklch(0.62 0.18 40)" }} />
                    <span className="text-xs font-medium">{shortId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    data-ocid="nav.secondary_button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded transition-colors hover:text-gray-900"
                    style={{
                      borderColor: "oklch(0.78 0.003 260)",
                      color: "oklch(0.40 0.008 260)",
                    }}
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  data-ocid="nav.secondary_button"
                  className="px-4 py-2 text-sm font-medium border rounded transition-colors hover:text-gray-700"
                  style={{
                    borderColor: "oklch(0.75 0.003 260)",
                    color: "oklch(0.18 0.008 260)",
                  }}
                >
                  Login / Register
                </button>
              )}
              <a
                href="https://forms.gle/YXfmAMLYsiAQPnU2A"
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="nav.primary_button"
                className="px-4 py-2 text-sm font-bold rounded text-white transition-opacity hover:opacity-90 inline-block"
                style={{ background: "oklch(0.62 0.18 40)" }}
              >
                APPLY NOW
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-ocid="nav.toggle"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t"
            style={{
              background: "oklch(0.99 0.003 260)",
              borderColor: "oklch(0.82 0.003 260)",
            }}
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded ${
                    link.active ? "text-brand-orange" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-sm"
                      style={{ color: "oklch(0.30 0.008 260)" }}
                    >
                      <User
                        size={14}
                        style={{ color: "oklch(0.62 0.18 40)" }}
                      />
                      <span className="text-xs">{shortId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      data-ocid="nav.secondary_button"
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm border rounded"
                      style={{
                        borderColor: "oklch(0.78 0.003 260)",
                        color: "oklch(0.40 0.008 260)",
                      }}
                    >
                      <LogOut size={13} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openLogin();
                      setMobileMenuOpen(false);
                    }}
                    data-ocid="nav.secondary_button"
                    className="px-4 py-2 text-sm border rounded"
                    style={{
                      borderColor: "oklch(0.75 0.003 260)",
                      color: "oklch(0.18 0.008 260)",
                    }}
                  >
                    Login / Register
                  </button>
                )}
                <a
                  href="https://forms.gle/YXfmAMLYsiAQPnU2A"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm font-bold rounded text-white inline-block text-center"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                  data-ocid="nav.primary_button"
                >
                  APPLY NOW
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-[600px] flex items-center"
        style={{
          backgroundImage: `url('/assets/generated/hero-skyline.dim_1920x800.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 100%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 w-full">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Connecting Talent with Opportunity in Delhi NCR
            </h1>
            <p
              className="text-base md:text-lg mb-8"
              style={{ color: "oklch(0.92 0.005 260)" }}
            >
              Your trusted recruitment partner for jobs at SBI Bank, PNB Bank,
              Axis Bank, Hitachi, Metro, Blinkit and more.
            </p>
            <button
              type="button"
              onClick={() => setApplyOpen(true)}
              data-ocid="hero.primary_button"
              className="inline-block px-8 py-3 text-white font-bold text-sm tracking-wider rounded transition-opacity hover:opacity-90"
              style={{ background: "oklch(0.62 0.18 40)" }}
            >
              EXPLORE JOBS NOW
            </button>

            {/* Search Form */}
            <div
              className="mt-10 p-5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid oklch(0.88 0.003 260)",
              }}
            >
              <p
                className="text-sm font-semibold mb-4"
                style={{ color: "oklch(0.62 0.18 40)" }}
              >
                Find Your Next Career Move…
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <select
                    data-ocid="hero.select"
                    className="w-full px-3 py-2.5 text-sm rounded appearance-none pr-8"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: "oklch(0.40 0.008 260)",
                    }}
                  >
                    <option value="">Job Role</option>
                    <option>ATM Operator</option>
                    <option>Bank Sales Executive</option>
                    <option>Delivery Executive</option>
                    <option>Account Manager</option>
                    <option>Floor Coordinator</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  />
                </div>
                <div className="flex-1 relative">
                  <select
                    data-ocid="hero.select"
                    className="w-full px-3 py-2.5 text-sm rounded appearance-none pr-8"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: "oklch(0.40 0.008 260)",
                    }}
                  >
                    <option value="">Industry</option>
                    <option>Banking</option>
                    <option>E-commerce</option>
                    <option>Logistics</option>
                    <option>Metro / Transport</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  />
                </div>
                <div className="flex-1 relative">
                  <select
                    data-ocid="hero.select"
                    className="w-full px-3 py-2.5 text-sm rounded appearance-none pr-8"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: "oklch(0.40 0.008 260)",
                    }}
                  >
                    <option value="">Location</option>
                    <option>New Delhi</option>
                    <option>Gurugram</option>
                    <option>Faridabad</option>
                    <option>Noida</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  />
                </div>
                <button
                  type="button"
                  data-ocid="hero.primary_button"
                  className="px-6 py-2.5 text-sm font-bold text-white rounded whitespace-nowrap transition-opacity hover:opacity-90"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP CLIENTS & JOBS */}
      <section
        id="jobs"
        className="py-16"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{
                background: "oklch(0.62 0.18 40 / 0.15)",
                color: "oklch(0.62 0.18 40)",
              }}
            >
              Featured Jobs
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              TOP CLIENTS &amp; JOBS
            </h2>
          </div>

          {/* Client Logos */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CLIENT_LOGOS.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-center px-5 py-3 rounded-lg min-w-[90px]"
                style={{
                  background: client.bg,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <span
                  className="font-black text-sm tracking-wider"
                  style={{ color: client.color }}
                >
                  {client.name}
                </span>
              </div>
            ))}
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {FEATURED_JOBS.map((job, i) => (
              <div
                key={job.title}
                data-ocid={`jobs.item.${i + 1}`}
                className="p-4 rounded-lg flex flex-col gap-2 transition-transform hover:-translate-y-0.5"
                style={{
                  background: "oklch(0.96 0.003 260)",
                  border: "1px solid oklch(0.88 0.003 260)",
                }}
              >
                <h3 className="font-sans font-semibold text-sm text-gray-900 leading-tight">
                  {job.title}
                </h3>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.40 0.008 260)" }}
                >
                  {job.company}
                </p>
                <div
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  <MapPin size={11} />
                  {job.location}
                </div>
                <button
                  type="button"
                  onClick={() => setApplyOpen(true)}
                  data-ocid={`jobs.item.${i + 1}`}
                  className="mt-auto text-xs font-bold px-3 py-1.5 rounded transition-opacity hover:opacity-80 text-white w-fit"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR EXPERTISE */}
      <section
        id="candidates"
        className="py-16"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{
                background: "oklch(0.62 0.18 40 / 0.15)",
                color: "oklch(0.62 0.18 40)",
              }}
            >
              What We Do
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              OUR EXPERTISE
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERTISE.map((item, i) => (
              <div
                key={item.title}
                data-ocid={`expertise.item.${i + 1}`}
                className="p-6 rounded-lg text-center"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  border: "1px solid oklch(0.88 0.003 260)",
                }}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-sans font-bold text-sm tracking-wide uppercase mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.40 0.008 260)" }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section
        className="py-16"
        style={{ background: "oklch(0.99 0.003 260)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{
                background: "oklch(0.62 0.18 40 / 0.15)",
                color: "oklch(0.62 0.18 40)",
              }}
            >
              Success Stories
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              CANDIDATE TESTIMONIALS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                data-ocid={`testimonials.item.${i + 1}`}
                className="p-6 rounded-lg"
                style={{
                  background: "oklch(0.96 0.003 260)",
                  border: "1px solid oklch(0.88 0.003 260)",
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((si) => (
                    <Star
                      key={si}
                      size={14}
                      fill="oklch(0.62 0.18 40)"
                      style={{ color: "oklch(0.62 0.18 40)" }}
                    />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-5"
                  style={{ color: "oklch(0.30 0.008 260)" }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "oklch(0.62 0.18 40)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {t.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.45 0.008 260)" }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section
        id="blog"
        className="py-16"
        style={{ background: "oklch(0.97 0.003 260)" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{
                background: "oklch(0.62 0.18 40 / 0.15)",
                color: "oklch(0.62 0.18 40)",
              }}
            >
              Knowledge Hub
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              RECENT INDUSTRY INSIGHTS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, i) => (
              <div
                key={post.title}
                data-ocid={`blog.item.${i + 1}`}
                className="rounded-lg overflow-hidden transition-transform hover:-translate-y-1"
                style={{
                  background: "oklch(0.99 0.003 260)",
                  border: "1px solid oklch(0.88 0.003 260)",
                }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-base text-gray-900 mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed mb-4"
                    style={{ color: "oklch(0.40 0.008 260)" }}
                  >
                    {post.excerpt}
                  </p>
                  <a
                    href="#blog"
                    data-ocid={`blog.item.${i + 1}`}
                    className="text-xs font-bold transition-opacity hover:opacity-80"
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  >
                    Learn More &rsaquo;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "oklch(0.97 0.003 260)",
          borderTop: "1px solid oklch(0.88 0.003 260)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Logo + desc */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  N
                </div>
                <div>
                  <span
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  >
                    NIRA REBEL
                  </span>
                  <span className="block text-xs text-muted-foreground tracking-widest">
                    HR AGENCY
                  </span>
                </div>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.45 0.008 260)" }}
              >
                Professional HR recruitment agency in New Delhi, connecting
                talent with India's top employers.
              </p>
            </div>

            {/* Column 2: Contact */}
            <div>
              <h4 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-gray-800">
                Contact Us
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={13}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  />
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  >
                    38, Central Ave, Pocket C, Raju Park, Sangam Vihar, New
                    Delhi 110080
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} style={{ color: "oklch(0.62 0.18 40)" }} />
                  <a
                    href="tel:+919891331853"
                    className="text-xs"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  >
                    +91-9891331853
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} style={{ color: "oklch(0.62 0.18 40)" }} />
                  <a
                    href="mailto:rebelhrjobs1451@gmail.com"
                    className="text-xs break-all"
                    style={{ color: "oklch(0.45 0.008 260)" }}
                  >
                    rebelhrjobs1451@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-gray-800">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      data-ocid="footer.link"
                      className="text-xs transition-colors hover:text-white"
                      style={{ color: "oklch(0.45 0.008 260)" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Social */}
            <div>
              <h4 className="font-sans font-bold text-xs tracking-widest uppercase mb-4 text-gray-800">
                Social Media
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="https://instagram.com/reblehr.agency"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  <Instagram
                    size={15}
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  />
                  @reblehr.agency
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  <Linkedin
                    size={15}
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  />
                  Arun Rebel
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: "oklch(0.45 0.008 260)" }}
                >
                  <Facebook
                    size={15}
                    style={{ color: "oklch(0.62 0.18 40)" }}
                  />
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: "1px solid oklch(0.88 0.003 260)" }}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs" style={{ color: "oklch(0.75 0.003 260)" }}>
              &copy; {new Date().getFullYear()} Nira Rebel HR Agency Pvt Ltd.
              All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "oklch(0.50 0.006 260)" }}>
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: "oklch(0.45 0.008 260)" }}
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* APPLY NOW MODAL */}
      <Dialog open={applyOpen} onOpenChange={handleCloseModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          style={{
            background: "oklch(0.99 0.003 260)",
            border: "1px solid oklch(0.85 0.003 260)",
          }}
          data-ocid="apply.modal"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-gray-900 text-xl">
              Apply Now
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="py-10 text-center" data-ocid="apply.success_state">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                style={{ background: "oklch(0.62 0.18 40 / 0.15)" }}
              >
                ✅
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-sm" style={{ color: "oklch(0.40 0.008 260)" }}>
                Thank you for applying. Our team will contact you shortly.
              </p>
              <button
                type="button"
                onClick={handleCloseModal}
                data-ocid="apply.close_button"
                className="mt-6 px-6 py-2.5 text-sm font-bold text-white rounded transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.62 0.18 40)" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="apply-name"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="apply-name"
                    required
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Your name"
                    data-ocid="apply.input"
                    className="text-sm"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      borderColor: "oklch(0.82 0.003 260)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <Label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="apply-phone"
                  >
                    Phone *
                  </Label>
                  <Input
                    id="apply-phone"
                    required
                    value={form.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="+91-XXXXXXXXXX"
                    data-ocid="apply.input"
                    className="text-sm"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      borderColor: "oklch(0.82 0.003 260)",
                      color: "white",
                    }}
                  />
                </div>
              </div>

              <div>
                <Label
                  className="text-xs text-muted-foreground mb-1 block"
                  htmlFor="apply-email"
                >
                  Email
                </Label>
                <Input
                  id="apply-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="your@email.com"
                  data-ocid="apply.input"
                  className="text-sm"
                  style={{
                    background: "oklch(0.96 0.003 260)",
                    borderColor: "oklch(0.82 0.003 260)",
                    color: "white",
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className="text-xs text-muted-foreground mb-1 block"
                    htmlFor="apply-age"
                  >
                    Age
                  </Label>
                  <Input
                    id="apply-age"
                    type="number"
                    min="18"
                    max="60"
                    value={form.age}
                    onChange={(e) => handleFormChange("age", e.target.value)}
                    placeholder="Age"
                    data-ocid="apply.input"
                    className="text-sm"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      borderColor: "oklch(0.82 0.003 260)",
                      color: "white",
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Gender
                  </Label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleFormChange("gender", e.target.value)}
                    data-ocid="apply.select"
                    className="w-full px-3 py-2 text-sm rounded"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: form.gender ? "white" : "oklch(0.45 0.008 260)",
                    }}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Qualification
                  </Label>
                  <select
                    value={form.qualification}
                    onChange={(e) =>
                      handleFormChange("qualification", e.target.value)
                    }
                    data-ocid="apply.select"
                    className="w-full px-3 py-2 text-sm rounded"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: form.qualification
                        ? "white"
                        : "oklch(0.45 0.008 260)",
                    }}
                  >
                    <option value="">Select</option>
                    <option>10th Pass</option>
                    <option>12th Pass</option>
                    <option>Graduate</option>
                    <option>Post Graduate</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Experience
                  </Label>
                  <select
                    value={form.experience}
                    onChange={(e) =>
                      handleFormChange("experience", e.target.value)
                    }
                    data-ocid="apply.select"
                    className="w-full px-3 py-2 text-sm rounded"
                    style={{
                      background: "oklch(0.96 0.003 260)",
                      border: "1px solid oklch(0.85 0.003 260)",
                      color: form.experience
                        ? "white"
                        : "oklch(0.45 0.008 260)",
                    }}
                  >
                    <option value="">Select</option>
                    <option>Fresher</option>
                    <option>0–1 Year</option>
                    <option>1–3 Years</option>
                    <option>3+ Years</option>
                  </select>
                </div>
              </div>

              <div>
                <Label
                  className="text-xs text-muted-foreground mb-1 block"
                  htmlFor="apply-position"
                >
                  Position Applying For *
                </Label>
                <Input
                  id="apply-position"
                  required
                  value={form.position}
                  onChange={(e) => handleFormChange("position", e.target.value)}
                  placeholder="e.g. ATM Operator, Bank Sales Executive"
                  data-ocid="apply.input"
                  className="text-sm"
                  style={{
                    background: "oklch(0.96 0.003 260)",
                    borderColor: "oklch(0.82 0.003 260)",
                    color: "white",
                  }}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Preferred Location
                </Label>
                <select
                  value={form.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  data-ocid="apply.select"
                  className="w-full px-3 py-2 text-sm rounded"
                  style={{
                    background: "oklch(0.96 0.003 260)",
                    border: "1px solid oklch(0.85 0.003 260)",
                    color: form.location ? "white" : "oklch(0.45 0.008 260)",
                  }}
                >
                  <option value="">Select Location</option>
                  <option>New Delhi</option>
                  <option>Gurugram</option>
                  <option>Faridabad</option>
                  <option>Noida</option>
                  <option>Delhi NCR</option>
                </select>
              </div>

              <div>
                <Label
                  className="text-xs text-muted-foreground mb-1 block"
                  htmlFor="apply-message"
                >
                  Additional Message
                </Label>
                <Textarea
                  id="apply-message"
                  value={form.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  placeholder="Anything else you'd like us to know..."
                  rows={3}
                  data-ocid="apply.textarea"
                  className="text-sm resize-none"
                  style={{
                    background: "oklch(0.96 0.003 260)",
                    borderColor: "oklch(0.82 0.003 260)",
                    color: "white",
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  data-ocid="apply.cancel_button"
                  className="flex-1 py-2.5 text-sm font-medium rounded border transition-colors"
                  style={{
                    borderColor: "oklch(0.78 0.003 260)",
                    color: "oklch(0.40 0.008 260)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-ocid="apply.submit_button"
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded transition-opacity hover:opacity-90"
                  style={{ background: "oklch(0.62 0.18 40)" }}
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* LOGIN / REGISTER MODAL */}
      <LoginRegisterModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />
    </div>
  );
}
