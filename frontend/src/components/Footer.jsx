
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api";

export default function Footer() {
  const location = useLocation();

  const [settings, setSettings] = useState({
    profile_name: "Bipal Kattel",
    tagline: "Junior Architect & Web Developer",
    footer_image: "",
    copyright: `Kathmandu, Nepal © ${new Date().getFullYear()} Bipal Kattel. All rights reserved.`,
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
        console.error("Failed to load footer settings:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Hide footer on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#17251D] text-white border-t border-[#214E34]/30">
      <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 py-6">

        <div className="flex flex-row items-center justify-between gap-4">

          {/* Profile Image, Name and Tagline */}
          <div className="flex items-center gap-3 min-w-0">

            {settings.footer_image && (
              <img
                src={settings.footer_image}
                alt={settings.profile_name || "Profile"}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#214E34] flex-shrink-0"
              />
            )}

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">
                {settings.profile_name}
              </h3>

              <p className="text-xs text-white/70 leading-relaxed">
                {settings.tagline}
              </p>
            </div>

          </div>

          {/* Copyright */}
          <div className="text-xs text-white/70 text-right flex-shrink-0">
            <p>{settings.copyright}</p>
          </div>

        </div>

      </div>
    </footer>
  );
}
