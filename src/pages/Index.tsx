import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CircleCheckBig,
  Headphones,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";
import logo from "../assets/images/react-logo.png";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const solutions = [
    "TallyPrime Licensing",
    "ERP Implementation",
    "Tally Customization",
    "Business Process Automation",
    "Integration & Support",
    "Enterprise Software Services",
  ];


  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else if (user?.role === "dealer") {
        navigate("/dealer");
      } else {
        navigate("/retailer/dashboard");
      }
    }
  }, [isAuthenticated, user?.role, navigate]);

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(86,109,226,0.28),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#0b1220_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="absolute -left-12 top-0 h-48 w-48 rounded-full bg-royal/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-xl font-bold tracking-[0.24em] text-white shadow-lg shadow-royal/30">
                  <img src={logo} alt="Seerweb Logo" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">
                    Seerweb OMS
                  </p>
                  <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-4xl">
                    Seerweb ERP Solutions Pvt Ltd
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Tally, ERP, and enterprise IT solutions designed to streamline accounting,
                    operations, implementation, and long-term business growth.
                  </p>
                </div>
              </div>

            </div>
          </section>

          <aside className="flex items-center">
            <div className="w-full">
              

              <LoginForm />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
