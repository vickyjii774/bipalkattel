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
      <main className="bg-[#F7F7F2] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#214E34]" />
      </main>
    );
  }

  return (
    <main className="bg-[#F7F7F2] text-[#17251D] min-h-screen pb-24">
      
      {/* HEADER SECTION */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-12 pb-8">
        <div className="space-y-2 pb-6 border-b border-[#857E7B]/20 text-align-center sm:text-center">
         
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">
            Projects & Works
          </h1>
          <p className="text-xs sm:text-sm text-[#857E7B] font-normal  leading-relaxed">
            A collection of architectural floorplans, 3D renderings, and modern web applications.
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-200 cursor-pointer ${
                filterCategory === cat
                  ? "bg-[#214E34] text-[#F7F7F2] shadow-sm font-semibold"
                  : "bg-white border border-[#857E7B]/30 text-[#17251D] hover:bg-[#DCE8DF]/40"
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
              className="group bg-white border border-[#857E7B]/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#214E34]/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#DCE8DF]/30">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {project.is_featured && (
                    <span className="absolute top-2.5 right-2.5 bg-[#214E34] text-[#DCE8DF] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Featured
                    </span>
                  )}

                  {project.company && (
                    <span className="absolute top-2.5 left-2.5 bg-[#17251D]/85 backdrop-blur-md text-[#DCE8DF] text-[9px] tracking-wider font-medium px-2 py-0.5 rounded flex items-center gap-1">
                      <Building2 className="w-2.5 h-2.5" /> {project.company}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-[#857E7B] font-semibold uppercase tracking-wider">
                    <span>{project.category}</span>
                    <span>{project.year}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#17251D] group-hover:text-[#214E34] transition-colors leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-[#857E7B] leading-relaxed line-clamp-2">
                    {project.short_description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="flex flex-wrap gap-1 pt-2.5 border-t border-[#857E7B]/10">
                  {project.technologies?.slice(0, 3).map((tech) => (
                    <span key={tech} className="text-[9px] font-medium bg-[#DCE8DF]/50 text-[#214E34] px-1.5 py-0.5 rounded">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs font-medium text-[#214E34] group-hover:text-[#17251D] transition-colors">
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
        <div className="fixed inset-0 z-50 bg-[#17251D]/75 backdrop-blur-sm flex justify-center items-y-auto p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-[#F7F7F2] text-[#17251D] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto relative space-y-6 p-5 sm:p-8 border border-[#857E7B]/20">
            
            {/* Close Button */}
           <button
            onClick={closeProjectDetails}
           className="absolute top-5 right-5 p-2 rounded-full  text-red-600 ring-2 ring-red-500 hover:bg-red-600 hover:text-white hover:ring-red-600 transition duration-200 focus:outline-none z-10 cursor-pointer"
           aria-label="Close Project Details"
           >
           <X className="w-4 h-4" />
           </button>

            {/* Modal Header */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#214E34] text-[#F7F7F2] px-2.5 py-0.5 rounded-md">
                  {selectedProject.category}
                </span>
                <span className="text-[10px] font-mono font-medium text-[#214E34] bg-[#DCE8DF] px-2.5 py-0.5 rounded-md">
                  {selectedProject.year}
                </span>
                {selectedProject.company && (
                  <span className="text-xs font-medium text-[#857E7B] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#214E34]" /> Client: {selectedProject.company}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#17251D]">
                {selectedProject.title}
              </h2>
            </div>

            {/* Hero Image */}
            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-[#DCE8DF]/30 shadow-sm border border-[#857E7B]/20 max-h-[340px]">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>

            {/* Action Buttons */}
            {/*
            <div className="flex flex-wrap items-center gap-3">
              {selectedProject.live_demo_url && (
                <a
                  href={selectedProject.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#214E34] text-white text-xs font-semibold rounded-lg hover:bg-[#17251D] transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Live Preview <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {selectedProject.github_url && (
                <a
                  href={selectedProject.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-[#857E7B]/40 bg-white text-[#17251D] text-xs font-semibold rounded-lg hover:bg-[#DCE8DF]/40 transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  GitHub Repository <Github className="w-3.5 h-3.5" />
                </a>
              )}
            </div> 
            
            */}

            {/* Overview & Problem / Solution */}
            <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-[#857E7B]/20 text-xs">
              <div className="space-y-1.5">
                <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                  Overview & Description
                </h3>
                <p className="text-[#857E7B] leading-relaxed font-normal">
                  {selectedProject.full_description || selectedProject.short_description}
                </p>
              </div>

              {selectedProject.problem && (
                <div className="space-y-1.5">
                  <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                    Challenge & Objectives
                  </h3>
                  <p className="text-[#857E7B] leading-relaxed font-normal">
                    {selectedProject.problem}
                  </p>
                </div>
              )}
            </div>

            {selectedProject.solution && (
              <div className="space-y-1.5 p-4 bg-white rounded-xl border border-[#857E7B]/20 text-xs">
                <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                  Design & Implementation Approach
                </h3>
                <p className="text-[#17251D] leading-relaxed font-normal">
                  {selectedProject.solution}
                </p>
              </div>
            )}

            {/* Key Features */}
            {selectedProject.features && selectedProject.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                  Key Features & Deliverables
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedProject.features.map((feat, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#857E7B]/20 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#214E34] shrink-0 mt-0.5" />
                      <span className="text-xs text-[#17251D] leading-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                Tools & Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedProject.technologies?.map((tech) => (
                  <span key={tech} className="text-[11px] font-mono font-medium bg-[#214E34] text-[#F7F7F2] px-2.5 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Screenshots Gallery */}
            {selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#857E7B]/20">
                <h3 className="text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">
                  Project Screenshots & Renders
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {selectedProject.screenshots.map((shot, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden border border-[#857E7B]/20 aspect-[16/10] bg-[#DCE8DF]/20">
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