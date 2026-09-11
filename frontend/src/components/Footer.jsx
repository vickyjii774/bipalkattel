
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUp, Mail, MapPin } from "lucide-react";
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Tiktok,
  Twitter,
} from "./Icons";
import { apiFetch } from "../utils/api";

export default function Footer() {
  const location = useLocation();

  const [settings, setSettings] = useState({
    profile_name: "Bipal Kattel",
    tagline: "Junior Architect & Web Developer",
    email: "bipalkattel10@gmail.com",
    location: "Kathmandu, Nepal",

    github: "https://github.com/bipalkattel",
    linkedin: "https://linkedin.com/in/bipalkattel",
    instagram: "https://instagram.com/bipal_kattel",
    facebook: "https://facebook.com/bipalkattel",
    youtube: "https://youtube.com/bipalkattel",
    tiktok: "",
    twitter: "",

    copyright: `© ${new Date().getFullYear()} Bipal Kattel. All rights reserved.`,
  });

  useEffect(() => {
    apiFetch("/settings")
      .then((data) => {
        if (data && data.profile_name) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Do not show footer on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-900">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-9 py-5">

        {/* Main Footer */}
     <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-red-800/80">

  {/* ================= BRAND ================= */}
  <div className="md:col-span-5 space-y-3">
    <h3 className="text-xl font-semibold tracking-tight text-white">
      {settings.profile_name}
    </h3>

    <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
      {settings.tagline}
    </p>

    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1 font-mono">
      <ul>
      <span className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {settings.location}
      </span>

      <span className="flex items-center gap-1">
        <Mail className="w-3 h-3" />
        {settings.email}
      </span>
      </ul>
    </div>
  </div>


  {/* ================= NAVIGATION + SOCIAL + TOP ================= */}
  <div className="md:col-span-7 grid grid-cols-[1fr_1fr_auto] gap-x-8 md:gap-x-12">

    {/* Navigation */}
    <div>
      <h4 className="text-[11px] uppercase tracking-widest text-zinc-400 mb-4 font-semibold">
        Navigation
      </h4>

      <ul className="space-y-1.5 text-xs text-zinc-300">
        <li>
          <Link to="/" className="hover:text-red-700 transition">
            Home
          </Link>
        </li>

        <li>
          <Link to="/about" className="hover:text-red-700 transition">
            About
          </Link>
        </li>

        <li>
          <Link to="/projects" className="hover:text-red-700 transition">
            Projects
          </Link>
        </li>
        <li>
          <Link to="/experience" className="hover:text-red-700 transition">
            Experience
          </Link>
        </li>

        <li>
          <Link to="/gallery" className="hover:text-red-700 transition">
            Gallery
          </Link>
        </li>

        <li>
          <Link to="/contact" className="hover:text-red-700 transition">
            Contact
          </Link>
        </li>
      </ul>
    </div>


    {/* Social */}
    <div>
      <h4 className="text-[11px] uppercase tracking-widest text-zinc-400 mb-4 font-semibold">
        Social
      </h4>

      <ul className="space-y-1.5 text-xs text-zinc-300">

        {settings.linkedin && (
          <li>
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn
            </a>
          </li>
        )}

        {settings.instagram && (
          <li>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram
            </a>
          </li>
        )}

        {settings.facebook && (
          <li>
            <a
              href={settings.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Facebook className="w-3.5 h-3.5" />
              Facebook
            </a>
          </li>
        )}

        {settings.youtube && (
          <li>
            <a
              href={settings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Youtube className="w-3.5 h-3.5" />
              YouTube
            </a>
          </li>
        )}

        {settings.tiktok && (
          <li>
            <a
              href={settings.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Tiktok className="w-3.5 h-3.5" />
              TikTok
            </a>
          </li>
        )}

        {settings.twitter && (
          <li>
            <a
              href={settings.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-red-700 transition"
            >
              <Twitter className="w-3.5 h-3.5" />
              Twitter
            </a>
          </li>
        )}
      </ul>
    </div>


    {/* Back To Top */}
    <div className="flex items-start justify-end">

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="
          group
          inline-flex
          items-center
          justify-center
          w-9
          h-9
          rounded-full
          border
          border-zinc-700
          text-white
          transition-all
          duration-300
          hover:border-red-700
          hover:text-red-700
          hover:-translate-y-1
          cursor-pointer
        "
      >
        <ArrowUp
          className="
            w-3.5
            h-3.5
            transition-transform
            duration-300
            group-hover:-translate-y-0.5
            cursor-pointer
          "
        />
      </button>

    </div>

  </div>

</div>

        {/* ================= COPYRIGHT ================= */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center text-center text-xs text-zinc-500 gap-3">

          <p>
            {settings.copyright}
          </p>

        </div>

      </div>
    </footer>
  );
}
