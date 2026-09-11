
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Navbar() {
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [settings, setSettings] = useState({
    logo_text: " B",
    profile_name: "Bipal Kattel",
  });

  /* =========================
     GET SETTINGS
  ========================= */
  useEffect(() => {
    apiFetch("/settings")
      .then((data) => {
        if (data && data.profile_name) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  /* =========================
     CLOSE MOBILE MENU
     WHEN ROUTE CHANGES
  ========================= */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* =========================
     SCROLL TO TOP
  ========================= */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  /* =========================
     ADMIN ROUTES
  ========================= */
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  /* =========================
     NAVIGATION LINKS
  ========================= */
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Experience", path: "/experience" },

    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#faf9f6]/90 backdrop-blur-md border-b border-zinc-200/80 transition-all">

      <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 h-16 flex items-center justify-between">

        {/* =========================
            LOGO & NAME
        ========================= */}
        <Link
          to="/"
          onClick={scrollToTop}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="h-8 w-8 rounded-full bg-green-300 text-white font-semibold flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform duration-300">
            {settings.logo_text?.charAt(0) || "B"}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-black transition-colors leading-tight">
              {settings.profile_name || "Bipal Kattel"}
            </span>

            <span className="text-[10px] font-medium text-zinc-500 leading-tight">
              Architect & Developer
            </span>
          </div>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}
        <nav className="hidden md:flex items-center gap-6">

          {navLinks.map((link) => {

            const isActive =
              location.pathname === link.path ||
              (link.path === "/projects" &&
                location.pathname.startsWith("/projects/"));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={
                  link.path === "/"
                    ? scrollToTop
                    : undefined
                }
                className={`text-xs font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-zinc-950 font-semibold"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {link.name}

                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-zinc-950 rounded-full transition-all duration-300" />
                )}
              </Link>
            );
          })}

        </nav>

        {/* =========================
            MOBILE HAMBURGER
        ========================= */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-lg text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}
      {mobileOpen && (
        <div className="md:hidden bg-[#faf9f6] border-b border-zinc-200 px-5 py-4 space-y-2 animate-in slide-in-from-top duration-300">

          {navLinks.map((link) => {

            const isActive =
              location.pathname === link.path ||
              (link.path === "/projects" &&
                location.pathname.startsWith("/projects/"));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={
                  link.path === "/"
                    ? scrollToTop
                    : undefined
                }
                className={`block text-sm font-medium py-1.5 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-zinc-950 text-white font-semibold"
                    : "text-zinc-700 hover:bg-zinc-200/60"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

        </div>
      )}

    </header>
  );
}
