
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [settings, setSettings] = useState({
    logo_text: "Bipal",
    profile_name: "Bipal Kattel",
    footer_image: "",
  });

  useEffect(() => {
    let isMounted = true;

    apiFetch("/settings")
      .then((data) => {
        if (isMounted && data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch((error) => {
        console.error("Failed to load navbar settings:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Hide navbar on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Experience", path: "/experience" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F7F7F2]/90 backdrop-blur-md border-b border-[#857E7B]/20 transition-all">
      <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 h-16 flex items-center justify-between">

        {/* Logo, Profile Image & Name */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none cursor-pointer"
        >
          {settings.footer_image ? (
            <img
              src={settings.footer_image}
              alt={settings.profile_name || "Profile"}
              className="h-9 w-9 rounded-full object-cover border-2 border-[#214E34] flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[#214E34] text-white font-semibold flex items-center justify-center text-xs shadow-sm group-hover:scale-105 transition-transform duration-300">
              {settings.logo_text?.charAt(0) || "B"}
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#17251D] group-hover:text-[#214E34] transition-colors leading-tight">
              {settings.profile_name || "Bipal Kattel"}
            </span>

            <span className="text-[10px] font-medium text-[#857E7B] leading-tight">
              Architect & Developer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
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
                className={`text-xs font-medium transition-colors relative py-1 cursor-pointer ${
                  isActive
                    ? "text-[#214E34] font-semibold"
                    : "text-[#857E7B] hover:text-[#214E34]"
                }`}
              >
                {link.name}

                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#214E34] rounded-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-lg text-[#17251D] hover:bg-[#DCE8DF]/50 transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F7F7F2] border-b border-[#857E7B]/20 px-5 py-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path === "/projects" &&
                location.pathname.startsWith("/projects/"));

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block text-sm font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "bg-[#214E34] text-white font-semibold"
                    : "text-[#17251D] hover:bg-[#DCE8DF]/50"
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
