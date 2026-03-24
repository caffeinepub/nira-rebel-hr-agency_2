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
import {
  useCallerProfile,
  useCallerRole,
  useIsAdmin,
  useSubmitDirectApplication,
} from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Facebook,
  Instagram,
  Linkedin,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import LoginRegisterModal from "./components/LoginRegisterModal";
import StaffPortal from "./components/StaffPortal";

function useCountUp(target: number, duration = 2000): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return count;
}

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "Services", href: "#expertise" },
  { label: "About", href: "#about" },
  { label: "Candidates", href: "#candidates" },
  { label: "Blogs", href: "#blog" },
];

const CAROUSEL_SLIDES = [
  {
    badge: "TOP BANKING PARTNERS",
    heading: "SBI \u2022 PNB \u2022 Axis Bank",
    gold: "& More",
    subtitle:
      "Floor Coordinator \u2022 ATM Operator \u2022 Sales Manager \u2022 Branch Manager",
  },
  {
    badge: "PAN INDIA PLACEMENTS",
    heading: "Find Your Dream Job",
    gold: "Across India",
    subtitle:
      "Delhi \u2022 Gurugram \u2022 Bihar \u2022 Patna \u2022 UP \u2022 Rewari & More",
  },
  {
    badge: "EXPERT RECRUITMENT",
    heading: "Your Career Starts Here",
    gold: "Pan India",
    subtitle: "Banking \u2022 E-Commerce \u2022 Logistics \u2022 Metro & More",
  },
];

const JOB_FILTERS = [
  "All",
  "SBI Bank",
  "PNB Bank",
  "Hitachi Cash Management",
  "E-Commerce / Logistics",
  "Metro Department",
  "Axis Bank",
];

interface JobCard {
  title: string;
  company: string;
  location: string;
  address: string;
  salary: string;
  category: string;
  categoryColor: string;
  description: string;
  filter: string;
}

const JOBS: JobCard[] = [
  {
    title: "Teller",
    company: "SBI Bank",
    location: "Delhi",
    address: "SBI Branch 1, Delhi",
    salary: "\u20b935,000/month",
    category: "Banking",
    categoryColor: "#1a3a6b",
    description:
      "Counter and Cash Management, System Handling, System Management, Close Vending Machines.",
    filter: "SBI Bank",
  },
  {
    title: "Cashier",
    company: "PNB Bank",
    location: "Delhi",
    address: "PNB Central Branch, Delhi",
    salary: "\u20b932,000/month",
    category: "Banking",
    categoryColor: "#1a5276",
    description:
      "Deposit, Withdrawal, Loans, System Handling, System Management, ATM Reconciliation.",
    filter: "PNB Bank",
  },
  {
    title: "Vault Manager",
    company: "Hitachi",
    location: "Delhi",
    address: "Hitachi Regional Office, Delhi",
    salary: "\u20b945,000/month",
    category: "Cash Management",
    categoryColor: "#b45309",
    description:
      "Triangle balancing, Daybook maintenance, Cash deposit, Bank liaison for clients, Cross-check and reconciliation.",
    filter: "Hitachi Cash Management",
  },
  {
    title: "Warehousing Officer",
    company: "Blinkit",
    location: "Delhi",
    address: "Warehouse 2, Delhi",
    salary: "\u20b925,000/month",
    category: "E-Commerce/Logistics",
    categoryColor: "#0e7490",
    description:
      "Inventory use, Inventory system, Material logistics, Inward/outward record maintenance.",
    filter: "E-Commerce / Logistics",
  },
  {
    title: "Procurement",
    company: "Zepto",
    location: "Delhi",
    address: "Procurement Center, Delhi",
    salary: "\u20b927,000/month",
    category: "E-Commerce/Logistics",
    categoryColor: "#0e7490",
    description:
      "Logistics, Warehousing, System operations, Vendor management, Delivery management, Procurement.",
    filter: "E-Commerce / Logistics",
  },
  {
    title: "Accountant",
    company: "Metro Express",
    location: "Delhi",
    address: "Metro Office, Delhi",
    salary: "\u20b930,000/month",
    category: "Metro Department",
    categoryColor: "#6d28d9",
    description:
      "Deposit of tender, JV management, Record keeping, Counter deposit management, Travel allowance/expenses management.",
    filter: "Metro Department",
  },
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
    icon: "\u2699\ufe0f",
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

const WA_GROUP =
  "https://chat.whatsapp.com/Ij6uY2RChCtBoP5uqaM4Oc?mode=hqctcla";
const WA_CHANNEL = "https://whatsapp.com/channel/0029VbAz4VLChq6I5mpCQH3D";

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
  const [applyJobTitle, setApplyJobTitle] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ApplyFormData>(initialForm);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");

  const [currentPage, _setCurrentPage] = useState<string>(
    window.location.pathname,
  );
  const { identity, clear } = useInternetIdentity();
  const candidatesCount = useCountUp(10000);
  const placementsCount = useCountUp(5000);
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsAdmin();
  const { data: callerRole } = useCallerRole();
  const { data: callerProfile } = useCallerProfile();
  const isStaffOrAdmin = callerRole === "admin" || callerRole === "user";
  const displayName =
    callerProfile?.name?.trim() ||
    `${identity?.getPrincipal().toString().slice(0, 5)}\u2026` ||
    "";

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  const submitDirectApp = useSubmitDirectApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitDirectApp.mutateAsync({
        candidateName: form.name,
        jobTitle: form.position,
        phone: form.phone,
        email: form.email,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const handleCloseModal = () => {
    setApplyOpen(false);
    setSubmitted(false);
    setForm(initialForm);
    setApplyJobTitle("");
  };

  const openApplyWithJob = (jobTitle: string) => {
    setApplyJobTitle(jobTitle);
    setForm((prev) => ({ ...prev, position: jobTitle }));
    setApplyOpen(true);
  };

  const filteredJobs =
    activeFilter === "All"
      ? JOBS
      : JOBS.filter((j) => j.filter === activeFilter);

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
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── ANNOUNCEMENT BAR ── */}
      {!announcementDismissed && (
        <div
          className="w-full flex items-center justify-between gap-2 px-4 py-2 text-white text-sm"
          style={{ background: "#25D366" }}
          data-ocid="announcement.panel"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium">
              Join our WhatsApp for instant job alerts!
            </span>
            <a
              href={WA_GROUP}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="announcement.primary_button"
              className="px-3 py-1 rounded border border-white text-white text-xs font-bold hover:bg-white hover:text-green-600 transition-colors"
            >
              Join Group
            </a>
            <a
              href={WA_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="announcement.secondary_button"
              className="px-3 py-1 rounded border border-white text-white text-xs font-bold hover:bg-white hover:text-green-600 transition-colors"
            >
              WA Channel
            </a>
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementDismissed(true)}
            aria-label="Dismiss"
            data-ocid="announcement.close_button"
            className="p-1 rounded hover:bg-green-500 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── DARK NAVBAR ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{ background: "#0d1b2e", borderBottom: "1px solid #1e3150" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/assets/uploads/nira_rebel_photo-019d1c52-1b51-77f0-b8ce-2159e2ba622a-1.jpeg"
                alt="Nira Rebel HR Agency"
                className="h-10 w-auto object-contain rounded"
              />
              <div className="hidden sm:block">
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: "#f5c842" }}
                >
                  Nira Rebel HR Agency
                </p>
                <p className="text-[10px]" style={{ color: "#a0b4c8" }}>
                  Pvt Ltd
                </p>
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
                  className="px-3 py-2 text-sm font-medium text-white hover:text-yellow-400 transition-colors rounded"
                >
                  {link.label}
                </a>
              ))}
              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    window.open("/staff", "_blank");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-medium text-white hover:text-yellow-400 transition-colors rounded"
                >
                  Staff Portal
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    window.open("/admin", "_blank");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-semibold rounded"
                  style={{ color: "#f5c842" }}
                >
                  Admin
                </button>
              )}
            </nav>

            {/* WhatsApp + Auth buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href={WA_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="nav.secondary_button"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded border border-green-400 text-green-400 hover:bg-green-400 hover:text-white transition-colors"
              >
                WA Channel
              </a>
              <a
                href={WA_GROUP}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="nav.primary_button"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded text-white transition-colors"
                style={{ background: "#25D366" }}
              >
                WA Group
              </a>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm text-white">
                    <User size={14} style={{ color: "#f5c842" }} />
                    <span className="text-xs font-medium text-white">
                      {displayName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    data-ocid="nav.secondary_button"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded text-white border-gray-400 hover:border-white transition-colors"
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
                  className="px-4 py-1.5 text-sm font-medium border rounded text-white transition-colors"
                  style={{ borderColor: "#f5c842", color: "#f5c842" }}
                >
                  Admin Login
                </button>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="lg:hidden p-2 text-white"
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
            className="lg:hidden"
            style={{ background: "#0d1b2e", borderTop: "1px solid #1e3150" }}
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-white hover:text-yellow-400 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                  data-ocid="nav.link"
                >
                  {link.label}
                </a>
              ))}
              {isStaffOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.open("/staff", "_blank");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-medium text-white text-left hover:text-yellow-400"
                >
                  Staff Portal
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.open("/admin", "_blank");
                  }}
                  data-ocid="nav.link"
                  className="px-3 py-2 text-xs font-semibold text-left"
                  style={{ color: "#f5c842" }}
                >
                  Admin Dashboard
                </button>
              )}
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={WA_GROUP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-bold rounded text-white text-center"
                  style={{ background: "#25D366" }}
                >
                  Join WA Group
                </a>
                <a
                  href={WA_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-bold rounded border border-green-400 text-green-400 text-center"
                >
                  WA Channel
                </a>
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    data-ocid="nav.secondary_button"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm border rounded text-white border-gray-500"
                  >
                    <LogOut size={13} />
                    Logout ({displayName})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openLogin();
                      setMobileMenuOpen(false);
                    }}
                    data-ocid="nav.secondary_button"
                    className="px-4 py-2 text-sm border rounded text-center"
                    style={{ borderColor: "#f5c842", color: "#f5c842" }}
                  >
                    Admin Login
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── HERO CAROUSEL ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "600px", minHeight: "500px" }}
        id="home"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-banner.dim_1600x600.jpg')",
          }}
        />
        {/* Gradient overlay - dark left, lighter right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(10,20,40,0.92) 0%, rgba(10,20,40,0.75) 50%, rgba(10,20,40,0.45) 100%)",
          }}
        />

        {/* Slide content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-end pb-14">
          <div className="max-w-xl">
            {CAROUSEL_SLIDES.map((slide, i) => (
              <div
                key={slide.badge}
                className="transition-all duration-700"
                style={{
                  display: i === activeSlide ? "block" : "none",
                }}
              >
                {/* Badge */}
                <span
                  className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-full mb-4"
                  style={{ background: "#f5c842", color: "#0d1b2e" }}
                >
                  {slide.badge}
                </span>

                {/* Logo row */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/assets/uploads/nira_rebel_photo-019d1c52-1b51-77f0-b8ce-2159e2ba622a-1.jpeg"
                    alt="Nira Rebel HR Agency"
                    className="w-14 h-14 object-cover rounded-full border-2"
                    style={{ borderColor: "#f5c842" }}
                  />
                  <div>
                    <p className="text-white text-xs font-bold">
                      Nira Rebel HR Agency
                    </p>
                    <p className="text-xs" style={{ color: "#a0b4c8" }}>
                      Empowering Talent
                    </p>
                  </div>
                </div>

                {/* Heading */}
                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-1">
                  {slide.heading}
                </h1>
                <p
                  className="text-xl font-bold mb-3"
                  style={{ color: "#f5c842" }}
                >
                  {slide.gold}
                </p>
                <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setApplyOpen(true)}
                    data-ocid="hero.primary_button"
                    className="px-6 py-2.5 text-sm font-bold rounded text-white transition-opacity hover:opacity-90"
                    style={{ background: "#f5c842", color: "#0d1b2e" }}
                  >
                    Our Services
                  </button>
                  <a
                    href="#about"
                    data-ocid="hero.secondary_button"
                    className="px-6 py-2.5 text-sm font-bold rounded border border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <button
          type="button"
          onClick={() =>
            setActiveSlide(
              (prev) =>
                (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length,
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Previous slide"
          data-ocid="hero.pagination_prev"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={() =>
            setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Next slide"
          data-ocid="hero.pagination_next"
        >
          <ChevronRight size={22} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {CAROUSEL_SLIDES.map((slide, i) => (
            <button
              type="button"
              key={slide.badge}
              onClick={() => setActiveSlide(i)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background:
                  i === activeSlide ? "#f5c842" : "rgba(255,255,255,0.4)",
                transform: i === activeSlide ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Trust counters overlay (bottom right) */}
        <div className="absolute bottom-5 right-6 hidden lg:flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-black text-white">
              {candidatesCount.toLocaleString()}+
            </p>
            <p className="text-xs text-white/70">Registered Candidates</p>
          </div>
          <div
            className="w-px"
            style={{ background: "rgba(255,255,255,0.3)" }}
          />
          <div className="text-center">
            <p className="text-2xl font-black text-white">
              {placementsCount.toLocaleString()}+
            </p>
            <p className="text-xs text-white/70">Successful Placements</p>
          </div>
          <div
            className="w-px"
            style={{ background: "rgba(255,255,255,0.3)" }}
          />
          <div className="text-center flex flex-col items-center">
            <ShieldCheck size={22} className="text-yellow-400 mb-0.5" />
            <p className="text-xs text-white font-bold">ISO Certified</p>
          </div>
        </div>
      </section>

      {/* ── JOBS SECTION ── */}
      <section id="jobs" className="py-14" style={{ background: "#f8f9fa" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{ background: "#fef3c7", color: "#b45309" }}
            >
              Latest Openings
            </span>
            <h2 className="text-3xl font-black text-gray-900">JOBS</h2>
          </div>

          {/* Filter Tabs */}
          <div
            className="flex flex-wrap gap-2 justify-center mb-8"
            data-ocid="jobs.tab"
          >
            {JOB_FILTERS.map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-4 py-2 text-xs font-bold rounded-full border transition-all"
                style={{
                  background: activeFilter === filter ? "#0d1b2e" : "#ffffff",
                  color: activeFilter === filter ? "#ffffff" : "#374151",
                  borderColor: activeFilter === filter ? "#0d1b2e" : "#d1d5db",
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.length === 0 ? (
              <div
                className="col-span-3 text-center py-10 text-gray-400"
                data-ocid="jobs.empty_state"
              >
                No jobs found for this category.
              </div>
            ) : (
              filteredJobs.map((job, i) => (
                <div
                  key={`${job.title}-${job.company}`}
                  data-ocid={`jobs.item.${i + 1}`}
                  className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow"
                >
                  {/* Title + Category */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-base text-gray-900">
                      {job.title}
                    </h3>
                    <span
                      className="px-2 py-1 text-[10px] font-bold rounded-full flex-shrink-0 text-white"
                      style={{ background: job.categoryColor }}
                    >
                      {job.category}
                    </span>
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-700">
                    <span>🏢</span>
                    <span className="font-semibold">{job.company}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin size={13} className="text-gray-400" />
                    <span>{job.location}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>🏢</span>
                    <span>{job.address}</span>
                  </div>

                  {/* Salary */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-gray-900">
                      {job.salary}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {job.description}
                  </p>

                  {/* Apply Button */}
                  <button
                    type="button"
                    onClick={() => openApplyWithJob(job.title)}
                    data-ocid={`jobs.item.${i + 1}`}
                    className="w-full py-2.5 text-sm font-bold rounded text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-auto"
                    style={{ background: "#25a244" }}
                  >
                    Apply Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CLIENT LOGOS STRIP ── */}
      <section className="py-8 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            Trusted By Top Employers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "SBI", color: "#1a3a6b" },
              { name: "PNB", color: "#1a5276" },
              { name: "AXIS BANK", color: "#97144d" },
              { name: "HITACHI", color: "#d32f2f" },
              { name: "METRO", color: "#1565c0" },
              { name: "BLINKIT", color: "#f9a825" },
            ].map((c) => (
              <div
                key={c.name}
                className="px-5 py-2.5 rounded-lg bg-white shadow-sm border border-gray-100"
              >
                <span
                  className="font-black text-sm tracking-wider"
                  style={{ color: c.color }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERTISE ── */}
      <section
        id="expertise"
        className="py-14"
        style={{ background: "#f8f9fa" }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{ background: "#fef3c7", color: "#b45309" }}
            >
              What We Do
            </span>
            <h2 className="text-3xl font-black text-gray-900">OUR EXPERTISE</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERTISE.map((item, i) => (
              <div
                key={item.title}
                data-ocid={`expertise.item.${i + 1}`}
                className="p-6 rounded-xl text-center bg-white shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-sm tracking-wide uppercase mb-2 text-gray-900">
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{ background: "#fef3c7", color: "#b45309" }}
            >
              Success Stories
            </span>
            <h2 className="text-3xl font-black text-gray-900">
              CANDIDATE TESTIMONIALS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                data-ocid={`testimonials.item.${i + 1}`}
                className="p-6 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((si) => (
                    <Star
                      key={si}
                      size={14}
                      fill="#f5c842"
                      style={{ color: "#f5c842" }}
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5 text-gray-600">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "#0d1b2e" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG ── */}
      <section id="blog" className="py-14" style={{ background: "#f8f9fa" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded mb-3"
              style={{ background: "#fef3c7", color: "#b45309" }}
            >
              Knowledge Hub
            </span>
            <h2 className="text-3xl font-black text-gray-900">
              RECENT INDUSTRY INSIGHTS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post, i) => (
              <div
                key={post.title}
                data-ocid={`blog.item.${i + 1}`}
                className="rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base text-gray-900 mb-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs leading-relaxed mb-4 text-gray-500">
                    {post.excerpt}
                  </p>
                  <a
                    href="#blog"
                    data-ocid={`blog.item.${i + 1}`}
                    className="text-xs font-bold hover:opacity-80 transition-opacity"
                    style={{ color: "#b45309" }}
                  >
                    Learn More &rsaquo;
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0d1b2e" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 */}
            <div>
              <div className="mb-4">
                <img
                  src="/assets/uploads/nira_rebel_photo-019d1c52-1b51-77f0-b8ce-2159e2ba622a-1.jpeg"
                  alt="Nira Rebel HR Agency PVT LTD"
                  className="h-14 w-auto object-contain rounded"
                />
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                Empowering Talent \u2022 Innovating Recruitment \u2014
                Professional HR recruitment agency in New Delhi, connecting
                talent with India&apos;s top employers.
              </p>
            </div>

            {/* Column 2: Contact */}
            <div>
              <h4 className="font-bold text-xs tracking-widest uppercase mb-4 text-white">
                Contact Us
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={13}
                    className="mt-0.5 flex-shrink-0 text-yellow-400"
                  />
                  <p className="text-xs leading-relaxed text-gray-400">
                    38, Central Ave, Pocket C, Raju Park, Sangam Vihar, New
                    Delhi 110080
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-yellow-400" />
                  <a
                    href="tel:+919891331853"
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    +91-9891331853
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-yellow-400" />
                  <a
                    href="mailto:rebelhrjobs1451@gmail.com"
                    className="text-xs break-all text-gray-400 hover:text-white"
                  >
                    rebelhrjobs1451@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="font-bold text-xs tracking-widest uppercase mb-4 text-white">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      data-ocid="footer.link"
                      className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Social + WhatsApp */}
            <div>
              <h4 className="font-bold text-xs tracking-widest uppercase mb-4 text-white">
                Connect With Us
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href={WA_GROUP}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
                >
                  WhatsApp Group
                </a>
                <a
                  href={WA_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
                >
                  WhatsApp Channel
                </a>
                <a
                  href="https://www.instagram.com/nirareblehr.agency?igsh=MXB2YmJ4ZDMxZjJmeA=="
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Instagram size={15} className="text-yellow-400" />
                  @reblehr.agency
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Linkedin size={15} className="text-yellow-400" />
                  Arun Rebel
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="footer.link"
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Facebook size={15} className="text-yellow-400" />
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ borderTop: "1px solid #1e3150" }}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Nira Rebel HR Agency PVT LTD.
              All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Built with \u2764\ufe0f using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-gray-400"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING SOCIAL BUTTONS (right side) ── */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pr-1">
        <a
          href={WA_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp Group"
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white text-lg hover:scale-110 transition-transform"
          style={{ background: "#25D366" }}
        >
          WA
        </a>
        <a
          href="#candidates"
          title="Candidates"
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform"
          style={{ background: "#ea580c" }}
        >
          <Users size={18} />
        </a>
        <a
          href="https://www.instagram.com/nirareblehr.agency?igsh=MXB2YmJ4ZDMxZjJmeA=="
          target="_blank"
          rel="noopener noreferrer"
          title="Instagram"
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform"
          style={{
            background:
              "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
          }}
        >
          <Instagram size={18} />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform"
          style={{ background: "#0077b5" }}
        >
          <Linkedin size={18} />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook"
          className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform"
          style={{ background: "#1877f2" }}
        >
          <Facebook size={18} />
        </a>
      </div>

      {/* ── LOGIN/REGISTER MODAL ── */}
      <LoginRegisterModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultTab={authTab}
      />

      {/* ── APPLY NOW MODAL ── */}
      <Dialog open={applyOpen} onOpenChange={handleCloseModal}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto bg-white"
          data-ocid="apply.modal"
        >
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl font-bold">
              Apply Now{applyJobTitle ? ` — ${applyJobTitle}` : ""}
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="py-10 text-center" data-ocid="apply.success_state">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 bg-green-100">
                ✓
              </div>
              <h3 className="text-xl text-gray-900 font-bold mb-2">
                Application Submitted!
              </h3>
              <p className="text-sm text-gray-500">
                Thank you for applying. Our team will contact you shortly.
              </p>
              <button
                type="button"
                onClick={handleCloseModal}
                data-ocid="apply.close_button"
                className="mt-6 px-6 py-2.5 text-sm font-bold text-white rounded hover:opacity-90 transition-opacity"
                style={{ background: "#25a244" }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
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
                    className="text-sm text-gray-900"
                  />
                </div>
                <div>
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
                    htmlFor="apply-phone"
                  >
                    Phone *
                  </Label>
                  <Input
                    id="apply-phone"
                    required
                    value={form.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    placeholder="10-digit number"
                    data-ocid="apply.input"
                    className="text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Label
                  className="text-xs text-gray-600 mb-1 block"
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
                  className="text-sm text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
                    htmlFor="apply-age"
                  >
                    Age
                  </Label>
                  <Input
                    id="apply-age"
                    value={form.age}
                    onChange={(e) => handleFormChange("age", e.target.value)}
                    placeholder="e.g. 25"
                    data-ocid="apply.input"
                    className="text-sm text-gray-900"
                  />
                </div>
                <div>
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
                    htmlFor="apply-gender"
                  >
                    Gender
                  </Label>
                  <select
                    id="apply-gender"
                    value={form.gender}
                    onChange={(e) => handleFormChange("gender", e.target.value)}
                    data-ocid="apply.select"
                    className="w-full px-3 py-2 text-sm rounded border border-gray-200 text-gray-900 bg-white"
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
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
                    htmlFor="apply-qual"
                  >
                    Qualification
                  </Label>
                  <Input
                    id="apply-qual"
                    value={form.qualification}
                    onChange={(e) =>
                      handleFormChange("qualification", e.target.value)
                    }
                    placeholder="e.g. B.Com"
                    data-ocid="apply.input"
                    className="text-sm text-gray-900"
                  />
                </div>
                <div>
                  <Label
                    className="text-xs text-gray-600 mb-1 block"
                    htmlFor="apply-exp"
                  >
                    Experience
                  </Label>
                  <Input
                    id="apply-exp"
                    value={form.experience}
                    onChange={(e) =>
                      handleFormChange("experience", e.target.value)
                    }
                    placeholder="e.g. 2 years"
                    data-ocid="apply.input"
                    className="text-sm text-gray-900"
                  />
                </div>
              </div>
              <div>
                <Label
                  className="text-xs text-gray-600 mb-1 block"
                  htmlFor="apply-position"
                >
                  Position Applied For *
                </Label>
                <Input
                  id="apply-position"
                  required
                  value={form.position}
                  onChange={(e) => handleFormChange("position", e.target.value)}
                  placeholder="Job title"
                  data-ocid="apply.input"
                  className="text-sm text-gray-900"
                />
              </div>
              <div>
                <Label
                  className="text-xs text-gray-600 mb-1 block"
                  htmlFor="apply-location"
                >
                  Preferred Location
                </Label>
                <Input
                  id="apply-location"
                  value={form.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  placeholder="e.g. New Delhi"
                  data-ocid="apply.input"
                  className="text-sm text-gray-900"
                />
              </div>
              <div>
                <Label
                  className="text-xs text-gray-600 mb-1 block"
                  htmlFor="apply-message"
                >
                  Additional Message
                </Label>
                <Textarea
                  id="apply-message"
                  value={form.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  placeholder="Tell us about yourself…"
                  rows={3}
                  data-ocid="apply.textarea"
                  className="text-sm text-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitDirectApp.isPending}
                data-ocid="apply.submit_button"
                className="w-full py-3 text-sm font-bold text-white rounded hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "#25a244" }}
              >
                {submitDirectApp.isPending
                  ? "Submitting…"
                  : "Submit Application"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
