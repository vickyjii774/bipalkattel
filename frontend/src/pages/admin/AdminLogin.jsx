import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Lock, Mail, ShieldAlert, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center p-6">
      <div className="bg-white border border-black/10 rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-light text-neutral-900 tracking-tight">Admin Portal</h1>
          <p className="text-xs text-neutral-500 font-medium">Log in to manage portfolio content</p>
        </div>

        {/* Demo Credentials Tip */}
        <div className="p-3 bg-neutral-100 rounded-xl border border-black/5 text-[11px] text-neutral-600 font-mono space-y-1">
          <p className="font-semibold text-neutral-800">Initial Credentials:</p>
          <p>Email: <span className="text-black font-semibold">admin@example.com</span></p>
          <p>Password: <span className="text-black font-semibold">admin123</span></p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm text-neutral-900 focus:outline-none focus:border-black transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition duration-300 shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

      </div>
    </div>
  );
}
