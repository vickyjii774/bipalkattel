

import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import {

  GraduationCap,
  Award,
  Compass,
  Code,
  Layers,
  Server,
  Box,
  Globe,
  Zap,
  Database,
  GitBranch,
  ArrowUpRight,
} from "lucide-react";

import { apiFetch } from "../utils/api";



// Skill icon mapping

const skillIconMap = {

  Code: Code,
  Layout: Layers,
  Zap: Zap,
  Server: Server,
  Globe: Globe,
  Database: Database,
  Box: Box,
  Layers: Layers,
  GitBranch: GitBranch,
};



export default function About() {

  const [about, setAbout] = useState(null);

  const [skills, setSkills] = useState([]);
  /** @typedef {{ id: string | number, title: string, organization?: string, year?: string | number, description?: string, image?: string }} Achievement */
  const [achievements, setAchievements] = useState(/** @type {Achievement[]} */ ([]));

  const [experience, setExperience] = useState([]);

  const [gallery, setGallery] = useState([]);

  const [loading, setLoading] = useState(true);



  useEffect(() => {

    Promise.all([

      apiFetch("/about").then(setAbout),

      apiFetch("/skills").then(setSkills),
      apiFetch("/achievements").then(setAchievements),

      apiFetch("/experience").then(setExperience),

      apiFetch("/gallery").then(setGallery),

    ])

      .catch(console.error)

      .finally(() => setLoading(false));

  }, []);



  if (loading) {

    return (

      <main className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <div className="h-8 w-8 rounded-full border-2 border-[#DCE8DF] border-t-[#214E34] animate-spin" />

          <span className="text-xs font-medium tracking-wide text-[#857E7B]">

            Loading profile...

          </span>

        </div>

      </main>

    );

  }



  return (

    <main className="min-h-screen bg-[#F7F7F2] text-[#17251D]">



      {/* ==================== ABOUT HERO ==================== */}



      <section className="relative overflow-hidden border-b border-[#D9DED9]">

        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-[#DCE8DF]/60 blur-3xl pointer-events-none" />



        <div className="relative max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 pt-10 pb-20 lg:pt-16 lg:pb-24">

          <div className="grid grid-cols-12 gap-4 sm:gap-8 lg:gap-16 items-center">



            {/* Text */}

            <div className="col-span-7 lg:col-span-7 space-y-6">

              <div className="space-y-4">

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.04em] leading-[1.05] text-[#17251D]">

                  Designing ideas.

                  <br />

                  <span className="font-serif italic font-normal text-[#214E34]">

                    Building experiences.

                  </span>

                </h1>



                <p className="max-w-2xl text-sm sm:text-lg text-[#4E5952] leading-relaxed">

                  {about?.heading ||

                    "Designing physical spaces and building modern applications."}

                </p>



                <p className="max-w-2xl text-xs sm:text-sm text-[#6C746F] leading-6 sm:leading-7">

                  {about?.introduction}

                </p>

              </div>



              <div className="flex flex-wrap gap-2 sm:gap-3 pt-2">

                <Link

                  to="/experience"

                  className="group inline-flex items-center gap-2 rounded-lg bg-[#214E34] px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:bg-[#173A27] hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"

                >

                  View Experience

                  <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />

                </Link>



                <Link

                  to="/gallery"

                  className="inline-flex items-center gap-2 rounded-lg border border-[#C9D0CB] bg-white px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[#214E34] transition-all duration-300 hover:border-[#214E34] hover:bg-[#2b893e] hover:text-white hover:-translate-y-0.5 cursor-pointer"

                >

                  Explore Gallery

                </Link>

              </div>

            </div>



            {/* Profile Image */}

            <div className="col-span-5 lg:col-span-5 flex justify-center">

              <div className="relative w-full flex justify-center">

                <div className="w-full max-w-[130px] sm:max-w-[220px] lg:max-w-[310px] aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl bg-[#E8ECE8] shadow-2xl">

                  <img

                    src="/bpal.jpg"

                    alt="Profile"

                    className="h-full w-full object-cover transition duration-500 hover:scale-105"

                  />

                </div>

              </div>

            </div>



          </div>

        </div>

      </section>



      {/* ==================== BIOGRAPHY ==================== */}



      <section className="bg-[#EEF1ED] text-[#17251D]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-20 lg:py-24">

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">



            <div className="lg:col-span-4 space-y-4">

              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight leading-tight">

                Combining creativity with clean technology.

              </h2>

            </div>



            <div className="lg:col-span-8 space-y-6">

              <div className="space-y-4 text-sm leading-7 text-[#4E5952]">

                {about?.biography ? (

                  about.biography.split("\n\n").map((paragraph, i) => (

                    <p key={i}>{paragraph}</p>

                  ))

                ) : (

                  <p>

                    Passionate about crafting minimalist, responsive, and

                    functional solutions.

                  </p>

                )}

              </div>



              {about?.philosophy && (

                <div className="rounded-2xl border border-[#496050] bg-[#203328] p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-default hover:border-[#214E34]/40">

                  <div className="flex items-center gap-2 mb-3">

                    <Compass className="h-4 w-4 text-[#BFD1C4]" />



                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BFD1C4]">

                      Design Philosophy

                    </span>

                  </div>



                  <p className="text-sm italic leading-7 text-[#E1E8E2]">

                    "{about.philosophy}"

                  </p>

                </div>

              )}

            </div>



          </div>

        </div>

      </section>



      {/* ==================== EDUCATION ==================== */}



      <section className="border-b border-[#D9DED9]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-20">

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">



            <div className="lg:col-span-4">

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">

                Education

              </h2>



              <p className="mt-4 max-w-xs text-sm leading-6 text-[#6C746F]">

                The academic foundation behind my technical and creative work.

              </p>

            </div>



            <div className="lg:col-span-8 space-y-4">

              {about?.education?.map((edu) => (

                <div

                  key={edu.id}

                  className="group rounded-2xl border border-[#D9DED9] bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#AFC4B5] hover:shadow-lg cursor-default"

                >

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F0EA] text-[#214E34]">

                        <GraduationCap className="h-4 w-4" />

                      </div>



                      <div>

                        <h3 className="text-base font-semibold text-[#17251D]">

                          {edu.degree}

                        </h3>



                        <p className="mt-1 text-xs font-medium text-[#6C746F]">

                          {edu.institution}

                        </p>

                      </div>

                    </div>



                    <span className="w-fit rounded-md bg-[#EEF3EF] px-3 py-1 text-[10px] font-bold font-mono text-[#214E34]">

                      {edu.year}

                    </span>

                  </div>



                  {edu.details && (

                    <p className="mt-4 pl-12 text-xs leading-6 text-[#6C746F]">

                      {edu.details}

                    </p>

                  )}

                </div>

              ))}

            </div>



          </div>

        </div>

      </section>



      {/* ==================== SKILLS ==================== */}



      <section className="bg-[#EEF1ED]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-20">



          <div className="mb-10">





            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">

              Skills & Technologies

            </h2>



            <p className="mt-3 text-sm text-[#6C746F]">

              Tools and technologies I use to bring ideas to life.

            </p>

          </div>



          {skills.length > 0 ? (

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">

              {skills.map((skill) => {

                const IconComp = skillIconMap[skill.icon] || Code;



                return (

                  <div

                    key={skill.id}

                    className="group flex items-center gap-3 rounded-xl border border-[#D3DAD4] bg-white p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#AFC4B5] hover:shadow-lg"

                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F0EA] text-[#214E34] transition-colors group-hover:bg-[#214E34] group-hover:text-white">

                      <IconComp className="h-5 w-5" />

                    </div>



                    <span className="text-xs sm:text-sm font-semibold text-[#344239]">

                      {skill.name}

                    </span>

                  </div>

                );

              })}

            </div>

          ) : (

            <p className="text-sm text-[#6C746F]">

              Skills will appear here once added.

            </p>

          )}



        </div>

      </section>



      {/* ==================== ACHIEVEMENTS ==================== */}

      {achievements.length > 0 && (
        <section className="border-t border-[#D9DED9] bg-[#F7F7F2]">
          <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-20">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">
                Achievements
              </h2>
              <p className="mt-3 text-sm text-[#6C746F]">
                Milestones, recognitions, and accomplishments along the way.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <article
                  key={achievement.id}
                  className="group overflow-hidden rounded-2xl border border-[#D9DED9] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#AFC4B5] hover:shadow-lg"
                >
                  {achievement.image && (
                    <div className="aspect-[16/9] overflow-hidden bg-[#E8ECE8]">
                      <img
                        src={achievement.image}
                        alt={achievement.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F0EA] text-[#214E34]">
                        <Award className="h-4 w-4" />
                      </div>
                      {achievement.year && (
                        <span className="rounded-md bg-[#EEF3EF] px-3 py-1 text-[10px] font-bold font-mono text-[#214E34]">
                          {achievement.year}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-semibold text-[#17251D]">
                      {achievement.title}
                    </h3>

                    {achievement.organization && (
                      <p className="mt-1 text-xs font-medium text-[#214E34]">
                        {achievement.organization}
                      </p>
                    )}

                    {achievement.description && (
                      <p className="mt-3 text-xs leading-6 text-[#6C746F]">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== EXPERIENCE ==================== */}



      <section className="border-t border-[#D9DED9]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-20">



          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">

              Experience History

            </h2>



            <Link

              to="/experience"

              className="group inline-flex items-center gap-2 w-fit text-xs uppercase tracking-[0.12em] font-bold text-[#214E34] transition-colors hover:text-[#173A27] cursor-pointer"

            >

              View full experience

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />

            </Link>

          </div>



          <div className="space-y-4">

            {experience.map((exp) => (

              <div

                key={exp.id}

                className="group rounded-2xl border border-[#D9DED9] bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#AFC4B5] hover:shadow-lg"

              >

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                  <div>

                    <h3 className="text-base font-semibold text-[#214E34]">

                      {exp.position}

                    </h3>



                    <p className="mt-1 text-xs font-medium text-[#6C746F]">

                      {exp.organization}

                      {exp.location && ` · ${exp.location}`}

                    </p>

                  </div>



                  <span className="w-fit rounded-md bg-[#EEF3EF] px-3 py-1 text-[10px] font-mono font-bold text-[#214E34]">

                    {exp.startdate} —{" "}

                    {exp.iscurrent ? "Present" : exp.enddate}

                  </span>

                </div>



                <p className="mt-4 text-xs leading-6 text-[#626B65]">

                  {exp.description}

                </p>

              </div>

            ))}

          </div>



        </div>

      </section>



      {/* ==================== GALLERY ==================== */}



      <section className="bg-[#EEF1ED] text-[#08a04a]">

        <div className="max-w-6xl mx-auto px-5 sm:px-7 lg:px-9 py-10">



          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">

            <div>

              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">

                Gallery Preview

              </h2>

            </div>



            <Link

              to="/gallery"

              className="group inline-flex items-center gap-2 w-fit rounded-lg border border-[#82c594] bg-[#78d691] px-4 py-2.5 text-xs uppercase tracking-[0.12em] font-semibold text-[#214E34] transition-all duration-300 hover:bg-[#214E34] hover:border-[#214E34] hover:text-white hover:-translate-y-0.5 hover:shadow-md cursor-pointer"

            >

              Explore full gallery

              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />

            </Link>

          </div>



          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            {gallery.slice(0, 4).map((item) => (

              <div

                key={item.id}

                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#203328] border border-[#3C5144] shadow-lg"

              >

                <img

                  src={item.image}

                  alt={item.title}

                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"

                />



                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1710]/90 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />



                <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">

                  <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-[#BFD1C4]">

                    {item.category}

                  </span>



                  <h4 className="mt-1 text-xs font-semibold text-white line-clamp-1">

                    {item.title}

                  </h4>

                </div>

              </div>

            ))}

          </div>



        </div>

      </section>



    </main>

  );

}
