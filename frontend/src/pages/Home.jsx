import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Code, Layers, Server, Box, Globe, Zap, Database, GitBranch, Building2, MapPin } from "lucide-react";
import { apiFetch } from "../utils/api";
import { useLocation } from "react-router-dom";

const skillIconMap = {
  Code: Code,
  Layout: Layers,
  Zap: Zap,
  Server: Server,
  Globe: Globe,
  Database: Database,
  Box: Box,
  Layers: Layers,
  GitBranch: GitBranch
};

export default function Home() {
  const [settings, setSettings] = useState(null);
  const [about, setAbout] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const { pathname } = useLocation();

useEffect(() => {
  apiFetch("/settings").then(setSettings).catch(() => {});
  apiFetch("/about").then(setAbout).catch(() => {});
  apiFetch("/projects?featured=true").then(setProjects).catch(() => {});
  apiFetch("/skills").then(setSkills).catch(() => {});
  apiFetch("/experience").then(setExperience).catch(() => {});
}, []);


  return (
    <main className="bg-[#faf9f6] text-zinc-900 min-h-screen">

      {/* HERO SECTION */}
      
<section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-5 pb-14">
  <div className="grid grid-cols-12 gap-4 sm:gap-8 items-center">

    {/* ================= LEFT CONTENT ================= */}
    <div className="col-span-7 space-y-4">

      {/* Availability Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[9px] sm:text-[11px] font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

        {settings?.availability_status || "Available"}
      </div>


      {/* Heading */}
      <h1 className="text-xl sm:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
        Hi, I'm{" "}

        <span className="text-zinc-900 font-normal italic font-serif">
          {settings?.profile_name || "Bipal Kattel"}
        </span>
      </h1>


      {/* Description */}
      <p className="text-[10px] sm:text-base text-zinc-600 font-normal leading-relaxed max-w-lg">
        {settings?.tagline ||
          "Architect & Developer based in Kathmandu. I design physical spaces and build responsive web applications."}
      </p>


      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">

        <Link
          to="/projects"
          className="px-3 py-2 sm:px-5 sm:py-2.5 bg-zinc-950 text-white text-[9px] sm:text-xs font-semibold rounded-lg hover:bg-zinc-800 transition duration-300 shadow-sm inline-flex items-center gap-1.5"
        >
          View My Work

          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>


        <Link
          to="/contact"
          className="px-3 py-2 sm:px-5 sm:py-2.5 border border-zinc-300 bg-white text-zinc-900 text-[9px] sm:text-xs font-semibold rounded-lg hover:bg-zinc-100 transition duration-300 shadow-sm"
        >
          Contact Me
        </Link>

      </div>
    </div>


    {/* ================= RIGHT HERO IMAGE ================= */}
    <div className="col-span-5 flex justify-center">

      <div className="relative w-full max-w-[140px] sm:max-w-[320px] aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-zinc-200 bg-zinc-100 group">

        <img
          src={
            about?.profile_image ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=85"
          }
          alt="Profile Visual"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex flex-col justify-end p-2 sm:p-5 text-white">

          <span className="text-[7px] sm:text-[11px] font-medium tracking-wider text-zinc-300 flex items-center gap-1 mb-1">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />

            Based in {settings?.location || "Kathmandu, Nepal"}
          </span>

          <p className="text-[7px] sm:text-sm font-light text-center">
            Architecture · Developer · 3D · Rendering
          </p>

        </div>
      </div>
    </div>

  </div>
</section>



      {/* SHORT ABOUT SECTION */}
      <section className="border-t border-zinc-200/80 bg-white py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">About Me</span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-red-950 mt-1">
              Simple craft.
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-3">
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-normal">
              {about?.introduction || "I enjoy solving problems through clean software code and thoughtful architectural design. From 3D residential models to responsive web applications, I focus on usability and precision."}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 border-b border-zinc-950 pb-0.5 text-xs uppercase tracking-wider font-semibold text-zinc-950 hover:text-zinc-600 transition"
            >
              Read full story →
            </Link>
          </div>
        </div>
      </section>

      
{/* ================= FEATURED PROJECTS ================= */}
<section className="py-10 sm:py-16 bg-[#faf9f6] border-t border-zinc-200/80">

  <div className="max-w-5xl mx-auto px-3 sm:px-7 lg:px-9">

    {/* Section Header */}
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 mb-5 sm:mb-8">

      <div>
        <span className="text-[8px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Portfolio Work
        </span>

        <h2 className="text-lg sm:text-3xl font-semibold tracking-tight text-zinc-950 mt-1">
          Featured Projects
        </h2>
      </div>

      <Link
        to="/projects"
        className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-900 border-b border-zinc-900 pb-0.5 hover:text-zinc-600 self-start sm:self-auto"
      >
        View all projects →
      </Link>

    </div>


    {/* ================= PROJECT GRID ================= */}
    <div className="grid grid-cols-3 gap-2 sm:gap-6">

      {projects.slice(0, 3).map((project) => (

        <Link
          key={project.id}
          to="/projects"
          className="
            group
            bg-white
            border
            border-zinc-200
            rounded-lg
            sm:rounded-xl
            overflow-hidden
            shadow-sm
            hover:shadow-md
            hover:-translate-y-0.5
            transition-all
            duration-300
            flex
            flex-col
            justify-between
          "
        >

          <div>

            {/* Project Image */}
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">

              <img
                src={project.image}
                alt={project.title}
                className="
                  w-full
                  h-full
                  object-cover
                  group-hover:scale-105
                  transition-transform
                  duration-500
                "
              />

              {/* Company Badge */}
              {project.company && (
                <span
                  className="
                    absolute
                    top-1
                    left-1
                    sm:top-2.5
                    sm:left-2.5
                    bg-zinc-900/80
                    backdrop-blur-md
                    text-white
                    text-[6px]
                    sm:text-[9px]
                    tracking-wider
                    font-medium
                    px-1
                    sm:px-2
                    py-0.5
                    rounded
                    flex
                    items-center
                    gap-0.5
                    sm:gap-1
                  "
                >
                  <Building2 className="w-2 h-2 sm:w-2.5 sm:h-2.5" />

                  <span className="truncate max-w-[55px] sm:max-w-none">
                    {project.company}
                  </span>
                </span>
              )}

            </div>


            {/* Project Information */}
            <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">

              <span className="text-[6px] sm:text-[10px] font-semibold text-zinc-500 uppercase tracking-wider line-clamp-1">
                {project.category} · {project.year}
              </span>

              <h3
                className="
                  text-[10px]
                  sm:text-base
                  font-semibold
                  text-zinc-950
                  group-hover:text-black
                  transition-colors
                  leading-snug
                  line-clamp-2
                "
              >
                {project.title}
              </h3>

              <p
                className="
                  text-[7px]
                  sm:text-xs
                  text-zinc-600
                  line-clamp-2
                  leading-relaxed
                "
              >
                {project.short_description}
              </p>

            </div>

          </div>


          {/* Technologies */}
          <div className="p-2 sm:p-4 pt-0">

            <div className="flex flex-wrap gap-0.5 sm:gap-1 pt-1.5 sm:pt-2.5 border-t border-zinc-100">

              {project.technologies?.slice(0, 3).map((tech) => (

                <span
                  key={tech}
                  className="
                    text-[5px]
                    sm:text-[9px]
                    font-medium
                    bg-zinc-100
                    text-zinc-700
                    px-1
                    sm:px-1.5
                    py-0.5
                    rounded
                    truncate
                    max-w-[55px]
                    sm:max-w-none
                  "
                >
                  {tech}
                </span>

              ))}

            </div>

          </div>

        </Link>

      ))}

    </div>

  </div>

</section>



         {/* CONTACT CTA */}
      <section className="bg-zinc-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Get In Touch</span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-white">
              Have a project in mind?
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-md">
              Available for architectural design, freelance  development, or other roles.
            </p>
          </div>

          <Link
            to="/contact"
            className="px-5 py-2.5 bg-white text-zinc-950 text-xs font-semibold rounded-lg hover:bg-zinc-200 transition duration-300 shadow-md inline-flex items-center gap-1.5 w-fit shrink-0"
          >
            Start Conversation <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </main>
  );
}