import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-[#857E7B]/20 rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-full bg-[#214E34] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-[#17251D] tracking-tight">Bipal Portal</h1>
          <p className="text-xs text-[#857E7B]">Log in to manage portfolio </p>
        </div>

        {error && (
          <div className="p-3 bg-[#857E7B]/10 border border-[#857E7B]/30 text-[#17251D] text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#214E34]" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#857E7B] uppercase tracking-wider block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#857E7B] absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#857E7B] uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#857E7B] absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#17251D] transition duration-300 shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

      </div>
    </div>
  );
}
