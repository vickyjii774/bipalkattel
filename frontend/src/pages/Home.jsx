import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Code, Layers, Server, Box, Globe, Zap, Database, GitBranch, Building2, MapPin } from "lucide-react";
import { apiFetch } from "../utils/api";

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

  useEffect(() => {
    apiFetch("/settings").then(setSettings).catch(() => {});
    apiFetch("/about").then(setAbout).catch(() => {});
    apiFetch("/projects?featured=true").then(setProjects).catch(() => {});
    apiFetch("/skills").then(setSkills).catch(() => {});
    apiFetch("/experience").then(setExperience).catch(() => {});
  }, []);

  return (
    <main className="bg-[#F7F7F2] text-[#17251D] min-h-screen">

      {/* HERO SECTION */}
<section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-10 pb-14">
  <div className="grid grid-cols-12 gap-4 sm:gap-8 items-center">
    
    <div className="col-span-7 space-y-3 sm:space-y-4">
      {/* Availability Badge */}
     

<div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#DCE8DF] border border-[#214E34]/20 text-[#214E34] text-[6px] sm:text-[11px] font-semibold">
  <span className="w-1.5 h-1.5 rounded-full bg-[#214E34] animate-pulse" />
  {settings?.availability_status || "Open for architecture &  projects"}
</div>

      <h1 className="text-2xl sm:text-5xl font-semibold tracking-tight text-[#17251D] leading-tight">
        Hi, I'm{" "}
        <span className="text-[#214E34] font-normal italic font-serif">
          {settings?.profile_name || "Bipal Kattel"}
        </span>
      </h1>

      <p className="text-[11px] sm:text-base text-[#857E7B] font-normal leading-relaxed max-w-lg">
        {settings?.tagline || "Junior Architect & Web Developer based in Kathmandu. I design physical spaces and build responsive web applications."}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
        <Link
          to="/projects"
          className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#214E34] text-[#F7F7F2] text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-[#17251D] transition duration-300 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
        >
          View My Work
          <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </Link>

        <Link
          to="/contact"
          className="px-3 sm:px-5 py-2 sm:py-2.5 border border-[#857E7B]/40 bg-white text-[#17251D] text-[10px] sm:text-xs font-semibold rounded-lg hover:bg-[#DCE8DF]/40 transition duration-300 shadow-sm cursor-pointer"
        >
          Contact Me
        </Link>
      </div>
    </div>

    {/* Hero Visual Card */}
    <div className="col-span-5 flex justify-center">
      <div className="relative w-full max-w-[140px] sm:max-w-[320px] aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-zinc-200 bg-zinc-100 group">
        <img
          src={about?.profile_image || "/bpal.jpg"}
          alt="Profile Visual"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

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
      <section className="border-t border-[#857E7B]/20 bg-white py-14">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17251D] mt-1">
              Simple design, purposeful craft.
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-3">
            <p className="text-[#857E7B] text-sm sm:text-base leading-relaxed font-normal">
              {about?.introduction || "I enjoy solving problems through clean software code and thoughtful architectural design. From 3D residential models to responsive web applications, I focus on usability and precision."}
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 border-b border-[#214E34] pb-0.5 text-xs uppercase tracking-wider font-semibold text-[#214E34] hover:text-[#17251D] transition cursor-pointer"
            >
              Read full story →
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="py-16 bg-[#F7F7F2] border-t border-[#857E7B]/20">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17251D] mt-1">
                Featured Projects
              </h2>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold uppercase tracking-wider text-[#214E34] border-b border-[#214E34] pb-0.5 hover:text-[#17251D] cursor-pointer"
            >
              View all projects →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to="/projects"
                className="group bg-white border border-[#857E7B]/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#214E34]/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#DCE8DF]/40">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {project.company && (
                      <span className="absolute top-2.5 left-2.5 bg-[#17251D]/85 backdrop-blur-md text-[#DCE8DF] text-[9px] tracking-wider font-medium px-2 py-0.5 rounded flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" /> {project.company}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-semibold text-[#857E7B] uppercase tracking-wider">
                      {project.category} · {project.year}
                    </span>
                    <h3 className="text-base font-semibold text-[#17251D] group-hover:text-[#214E34] transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#857E7B] line-clamp-2 leading-relaxed">
                      {project.short_description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1 pt-2.5 border-t border-[#857E7B]/10">
                    {project.technologies?.slice(0, 3).map((tech) => (
                      <span key={tech} className="text-[9px] font-medium bg-[#DCE8DF]/50 text-[#214E34] px-1.5 py-0.5 rounded">
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
      <section className="bg-[#fbfefc] text-green-700 py-16">
        <div className="bg-[#F7F7F2] max-w-5xl  mx-auto px-5 sm:px-7 lg:px-9 flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-xl shadow-sm transition-all duration-300 hover:border-[#214E34]/40 hover:-translate-y-1  hover:shadow-md border border-[#857E7B]/20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight mt-1 ">
              Have a project in mind?
            </h2>
            <p className="text-[#17251D] text-xs sm:text-sm mt-1 max-w-md">
              Available for architectural design, freelance web development, or junior roles.
            </p>
          </div>

          <Link
            to="/contact"
            className="px-5 py-2.5 bg-[#DCE8DF] text-[#17251D] hover:bg-green-800 hover:text-white text-xs font-semibold rounded-lg transition duration-300 shadow-md inline-flex items-center gap-1.5 w-fit shrink-0 cursor-pointer"
          >
            Start Conversation <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </main>
  );
}