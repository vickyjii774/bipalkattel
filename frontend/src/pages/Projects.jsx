import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ExternalLink, X, Sparkles, CheckCircle2, ArrowRight, Building2 } from "lucide-react";
import { Github } from "../components/Icons";
import { apiFetch } from "../utils/api";

export default function Projects() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    apiFetch("/projects")
      .then((data) => {
        setProjects(data);
        if (slug) {
          const match = data.find((p) => p.slug === slug || p.id === slug);
          if (match) setSelectedProject(match);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const categories = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];

  const filteredProjects = filterCategory === "All"
    ? projects
    : projects.filter((p) => p.category === filterCategory);

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    navigate(`/projects/${project.slug}`, { replace: true });
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    navigate("/projects", { replace: true });
  };

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-zinc-950" />
      </main>
    );
  }

  return (
    <main className="bg-[#faf9f6] text-zinc-900 min-h-screen pb-24">
      
      {/* HEADER SECTION */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-0 pb-8 text-center">
        <div className="space-y-2 pb-6 border-b border-zinc-200">
         
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
            Projects & Works
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 font-normal max-w-auto leading-relaxed">
            A collection of architectural floorplans, 3D renderings, and modern web applications.
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-200 ${
                filterCategory === cat
                  ? "bg-zinc-950 text-white shadow-sm font-semibold"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openProjectDetails(project)}
              className="group bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-400 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {project.is_featured && (
                    <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}

                  {project.company && (
                    <span className="absolute top-2.5 left-2.5 bg-zinc-900/80 backdrop-blur-md text-white text-[9px] tracking-wider font-medium px-2 py-0.5 rounded flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" /> {project.company}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>

                  <h3 className="text-base font-semibold text-zinc-950 group-hover:text-black transition-colors leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                    {project.short_description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="flex flex-wrap gap-1 pt-2.5 border-t border-zinc-100">
                  {project.technologies?.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-[9px] font-medium bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs font-medium text-zinc-950 group-hover:text-zinc-600 transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FULL IN-PLACE PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-sm flex justify-center items-y-auto p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#faf9f6] text-zinc-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto relative space-y-6 p-5 sm:p-8 border border-white/20">
            
            {/* Close Button */}
            <button
              onClick={closeProjectDetails}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-200 hover:bg-zinc-900 text-zinc-700 hover:text-white transition duration-200 focus:outline-none z-10"
              aria-label="Close Project Details"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-950 text-white px-2.5 py-0.5 rounded-md">
                  {selectedProject.category}
                </span>
                <span className="text-[10px] font-mono font-medium text-zinc-600 bg-zinc-200 px-2.5 py-0.5 rounded-md">
                  {selectedProject.year}
                </span>
                {selectedProject.company && (
                  <span className="text-xs font-medium text-zinc-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Client: {selectedProject.company}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
                {selectedProject.title}
              </h2>
            </div>

            {/* Hero Image */}
            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-zinc-100 shadow-sm border border-zinc-200 max-h-[340px]">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedProject.live_demo_url && (
                <a
                  href={selectedProject.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 transition inline-flex items-center gap-1.5"
                >
                  Live Preview <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {selectedProject.github_url && (
                <a
                  href={selectedProject.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-zinc-300 bg-white text-zinc-900 text-xs font-semibold rounded-lg hover:bg-zinc-100 transition inline-flex items-center gap-1.5"
                >
                  GitHub Repository <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Overview & Problem / Solution */}
            <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-zinc-200 text-xs">
              <div className="space-y-1.5">
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Overview & Description
                </h3>
                <p className="text-zinc-700 leading-relaxed font-normal">
                  {selectedProject.full_description || selectedProject.short_description}
                </p>
              </div>

              {selectedProject.problem && (
                <div className="space-y-1.5">
                  <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Challenge & Objectives
                  </h3>
                  <p className="text-zinc-700 leading-relaxed font-normal">
                    {selectedProject.problem}
                  </p>
                </div>
              )}
            </div>

            {selectedProject.solution && (
              <div className="space-y-1.5 p-4 bg-white rounded-xl border border-zinc-200 text-xs">
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Design & Implementation Approach
                </h3>
                <p className="text-zinc-800 leading-relaxed font-normal">
                  {selectedProject.solution}
                </p>
              </div>
            )}

            {/* Key Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Key Features & Deliverables
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedProject.features.map((feat, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-zinc-200 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-700 leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                Tools & Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies?.map((tech) => (
                  <span key={tech} className="text-[11px] font-mono font-medium bg-zinc-950 text-white px-2.5 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshots Gallery */}
            {selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                  Project Screenshots & Renders
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedProject.screenshots.map((shot, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-zinc-200 aspect-[16/10] bg-zinc-100">
                      <img src={shot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </main>
  );
}