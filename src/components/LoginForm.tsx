import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "../assets/images/react-logo.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import icons
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (!success) {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-white/10 bg-white text-slate-900 shadow-2xl shadow-black/25">
      <div className="h-1.5 bg-gradient-to-r from-royal via-blue-500 to-cyan-400" />
      <CardHeader className="space-y-4 p-6 pb-5 sm:p-8 sm:pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-bold tracking-[0.24em] text-white">
            <img src={logo} alt="Seerweb Logo" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-royal">
              Seerweb OMS
            </p>
            <p className="text-sm text-slate-500">Enterprise business application access</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Secure login for authorized users</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-royal" />
              <p>
                Use your assigned OMS username and password to continue to the
                dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700"
            >
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 shadow-sm focus-visible:ring-royal"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-11 text-slate-900 shadow-sm focus-visible:ring-royal"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors hover:text-slate-700"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            {isLoading ? "Signing in..." : "Login to Seerweb OMS"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 border-t border-slate-100 bg-slate-50/70 p-6 text-xs text-slate-500 sm:px-8">
        <p className="font-medium text-slate-700">Enterprise Software Expertise</p>
        <p>
          TallyPrime, ERP implementation, customization, integration, and business
          software support.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
