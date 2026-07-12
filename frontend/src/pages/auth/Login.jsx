import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Truck, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

const DEMO_ACCOUNTS = [
  { email: "manager@transitops.io", role: "Fleet Manager" },
  { email: "driver@transitops.io", role: "Driver" },
  { email: "safety@transitops.io", role: "Safety Officer" },
  { email: "finance@transitops.io", role: "Financial Analyst" },
];

export default function LoginPage() {
  const { user, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("manager@transitops.io");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      // error surfaced via context
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between items-center">
      {/* Top Header: Logo */}
      <div className="w-full flex justify-center py-2 lg:py-4">
        <div className="flex items-center gap-2">
          <svg className="h-6 w-6 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" strokeDasharray="3 3" className="opacity-25" />
            <path d="M6 9.5c3.6-1.5 8.4-1.5 12 0" />
            <path d="M4.5 12c5-2 10-2 15 0" />
            <path d="M6 14.5c3.6 1.5 8.4 1.5 12 0" />
          </svg>
          <span className="font-sans font-bold text-slate-900 tracking-tight text-lg">TransitOps</span>
        </div>
      </div>

      {/* Middle Content: Form Card */}
      <div className="w-full max-w-[360px] flex-1 flex flex-col justify-center py-4 lg:py-6">
        <h1 className="font-serif text-[32px] font-normal text-slate-950 text-center tracking-tight leading-tight">
          Welcome Back
        </h1>
        <p className="mt-2 text-xs font-light text-slate-400 text-center leading-normal">
          Enter your email and password to access your account
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2.5 text-center text-xs font-medium text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700 block">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#F4F5F7] border-0 focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-800 placeholder:text-slate-400/80 rounded-xl h-11 px-4 text-sm transition-all"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-700 block">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-[#F4F5F7] border-0 focus:outline-none focus:ring-2 focus:ring-slate-200 text-slate-800 placeholder:text-slate-400/80 rounded-xl h-11 pl-4 pr-10 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" defaultChecked className="rounded border-slate-300 data-[state=checked]:bg-black data-[state=checked]:border-black" />
              <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

          </div>

          {/* Submit Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-slate-900 active:scale-[0.98] disabled:active:scale-100 disabled:opacity-50 font-semibold rounded-xl h-11 text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-sm"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Google Sign In Button */}

          </div>
        </form>

        {/* Collapsible Demo Accounts (Hackathon helper) */}
        <div className="mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              Quick Demo Accounts
            </span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100">
              {showDemo ? "Hide" : "Show"}
            </span>
          </button>
          {showDemo && (
            <div className="mt-2 grid grid-cols-2 gap-1.5 animate-fade-in">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword("password123");
                  }}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 px-2 py-1.5 text-left text-[10px] hover:border-slate-300 hover:bg-slate-100 transition-all duration-150"
                >
                  <p className="font-semibold text-slate-700">{acc.role}</p>
                  <p className="truncate text-slate-400 font-light">{acc.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer: Sign Up Info */}

    </div>
  );
}
