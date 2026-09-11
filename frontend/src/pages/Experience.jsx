import React, { useState, useEffect } from "react";
import { Briefcase, Calendar, MapPin, CheckCircle, Award } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Experience() {
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/experience")
      .then(setExperience)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-zinc-950" />
      </main>
    );
  }

  return (
    <main className="bg-[#faf9f6] text-zinc-900 min-h-screen pb-24">
      
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-3 sm:px-7 lg:px-9 pt-0 pb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
          Work History & Timeline
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 font-normal mt-2 max-w-auto leading-relaxed">
          A history of architectural projects, client designs, and web engineering deliverables.
        </p>
      </section>

      {/* TIMELINE SECTION */}
      <section className="max-w-3xl mx-auto px-5 sm:px-7 pb-12">
        <div className="relative border-l-2 border-zinc-200 ml-4 space-y-8 pl-6">
          
          {experience.map((exp) => (
            <div key={exp.id} className="relative group">
              
              {/* Bullet */}
              <div className="absolute -left-[31px] top-1.5 w-5 h-5 rounded-full bg-zinc-950 border-4 border-[#faf9f6] shadow-sm group-hover:scale-125 transition-transform duration-300" />

              {/* Card Container */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3 shadow-sm hover:shadow-md transition duration-300">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-zinc-800" /> {exp.organization}
                    </span>
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {exp.position}
                    </h2>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <span className="text-[10px] font-mono font-semibold text-zinc-800 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md flex items-center gap-1 w-fit">
                      <Calendar className="w-3 h-3 text-zinc-600" />
                      {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
                    </span>
                    {exp.location && (
                      <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" /> {exp.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                  {exp.description}
                </p>

                {/* Key Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                    <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-1">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="text-xs text-zinc-700 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-[11px] uppercase tracking-wider text-amber-900 font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-600" /> Achievements
                    </h3>
                    <ul className="space-y-1">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="text-xs text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {ach}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tech Stack */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-100">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className="text-[10px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      </section>

    </main>
  );
}