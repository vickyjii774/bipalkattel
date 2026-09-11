import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Compass, Code, Layers, Server, Box, Globe, Zap, Database, GitBranch } from "lucide-react";
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

export default function About() {
  const [about, setAbout] = useState(null);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/about").then(setAbout),
      apiFetch("/skills").then(setSkills),
      apiFetch("/experience").then(setExperience),
      apiFetch("/gallery").then(setGallery)
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-zinc-950" />
      </main>
    );
  }

  return (
    <main className="bg-[#faf9f6] text-zinc-900 min-h-screen">
      
      {/* ABOUT HERO */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-5 pb-14">
        

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
              About{" "}
              <span className="italic font-serif font-normal">
                Me.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-700 leading-relaxed font-normal pt-1">
              {about?.heading || "Designing physical spaces and building modern web applications."}
            </p>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              {about?.introduction}
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[4/5] rounded-2xl overflow-hidden shadow-lg bg-zinc-100 border border-zinc-200">
              <img
                src={about?.profile_image || "https://scontent.fktm21-1.fna.fbcdn.net/v/t39.30808-6/465791650_1929776887518329_3008042345498741105_n.jpg?stp=dst-jpg_tt6&cstp=mx1357x1344&ctp=s1357x1344&_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=kNhI-175N9IQ7kNvwGbkmXA&_nc_oc=AdrGirFGiHUTV-oiOstEUkxl9dE0kIY4lVTBki1hExyYBh9kWRJEh541MMrwA0J52mXAQPeWSLErEFiipdfTqNSf&_nc_zt=23&_nc_ht=scontent.fktm21-1.fna&_nc_gid=gsViUO5dax3Q0GVSV3ZsVA&_nc_ss=7b2a8&oh=00_AQKdNBOm2Lal_SnCFIIOWTpHttqLOh7-XlEwFaywkF6nyw&oe=6AA614A8"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BIOGRAPHY & PHILOSOPHY */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Personal Bio
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-white">
              Combining spatial design with clean web code.
            </h2>
          </div>

          <div className="lg:col-span-8 space-y-4 text-zinc-300 text-xs sm:text-sm leading-relaxed font-light">
            {about?.biography ? (
              about.biography.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))
            ) : (
              <p>Passionate about crafting minimalist, responsive, and functional solutions.</p>
            )}

            {about?.philosophy && (
              <div className="p-4 rounded-xl bg-gray-800/80 border border-zinc-700/60 mt-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-white" /> Design Philosophy
                </span>
                <p className="italic text-xs text-zinc-200">{about.philosophy}</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* EDUCATION */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 py-16 border-t border-zinc-200">
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 block mb-1">
              Academic Qualifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">Education</h2>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {about?.education?.map((edu) => (
              <div key={edu.id} className="p-4 sm:p-5 bg-gray-900 border border-zinc-200 rounded-xl space-y-1.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-white" /> {edu.degree}
                  </h3>
                  <span className="text-[11px] font-mono font-semibold text-red-500 bg-zinc-100 px-2.5 py-0.5 rounded-md w-fit">
                    {edu.year}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 font-medium">{edu.institution}</p>
                {edu.details && <p className="text-xs text-zinc-600 leading-relaxed font-normal">{edu.details}</p>}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* TECHNICAL SKILLS BY CATEGORY */}
      <section className="bg-zinc-100 py-16 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 space-y-6">
          
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 block mb-1">
              Technical Tools
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">Skills & Software</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} className="bg-gray-900 border border-zinc-200 rounded-xl p-4 space-y-3 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-wider font-semibold text-white border-b border-red-400 pb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((skill) => {
                    const IconComp = skillIconMap[skill.icon] || Code;
                    return (
                      <div key={skill.id} className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-zinc-100 text-zinc-900">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-white">{skill.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* EMBEDDED EXPERIENCE */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 py-16 border-t border-zinc-200">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 block mb-1">
                Work Experience
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">Experience History</h2>
            </div>
            <Link to="/experience" className="text-xs uppercase tracking-wider font-semibold border-b border-zinc-950 pb-0.5 text-zinc-950">
              View full experience page →
            </Link>
          </div>

          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="p-5 bg-gray-900 border border-zinc-200 rounded-xl space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-base font-semibold text-red-500">{exp.position}</h3>
                    <p className="text-xs font-medium text-zinc-300">{exp.organization} · {exp.location}</p>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-red-600 bg-zinc-100 px-2.5 py-0.5 rounded-md w-fit">
                    {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMBEDDED GALLERY */}
      <section className="bg-zinc-900 text-white py-16 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 block mb-1">
                Visual Projects
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-white">Gallery Preview</h2>
            </div>
            <Link to="/gallery" className="text-xs uppercase tracking-wider text-zinc-300 hover:text-white border-b border-zinc-500 pb-0.5">
              Explore full gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {gallery.slice(0, 4).map((item) => (
              <div key={item.id} className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-900 border border-zinc-700 shadow-md">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                  <span className="text-[9px] uppercase font-semibold text-zinc-300">{item.category}</span>
                  <h4 className="text-xs font-medium text-white mt-0.5 line-clamp-1">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}