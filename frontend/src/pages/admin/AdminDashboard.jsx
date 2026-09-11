import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import {
  LayoutDashboard, FolderKanban, Briefcase, Code, Image as ImageIcon,
  User, Settings, Mail, LogOut, Plus, Edit2, Trash2, Check, X, Upload,
  Star, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [about, setAbout] = useState(null);
  const [settings, setSettings] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Modals state
  const [modalType, setModalType] = useState(null); // 'project', 'experience', 'skill', 'gallery'
  const [editingItem, setEditingItem] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, pData, eData, skData, gData, aData, setDbData, mData] = await Promise.all([
        apiFetch("/admin/dashboard"),
        apiFetch("/admin/projects"),
        apiFetch("/admin/experience"),
        apiFetch("/admin/skills"),
        apiFetch("/admin/gallery"),
        apiFetch("/about"),
        apiFetch("/settings"),
        apiFetch("/admin/messages")
      ]);

      setStats(sData);
      setProjects(pData);
      setExperience(eData);
      setSkills(skData);
      setGallery(gData);
      setAbout(aData);
      setSettings(setDbData);
      setMessages(mData);
    } catch (err) {
      showToast("Error loading CMS data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Image Upload helper
  const handleImageUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await apiFetch("/admin/upload", {
        method: "POST",
        body: formData
      });
      callback(res.url);
      showToast("Image uploaded successfully!");
    } catch (err) {
      showToast("Upload failed: " + err.message, "error");
    }
  };

  // --- CRUD ACTIONS ---

  // Project Actions
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const form = e.target;
    const projectData = {
      title: form.title.value,
      slug: form.slug.value,
      category: form.category.value,
      company: form.company.value,
      year: form.year.value,
      short_description: form.short_description.value,
      full_description: form.full_description.value,
      image: form.image.value,
      github_url: form.github_url.value,
      live_demo_url: form.live_demo_url.value,
      problem: form.problem.value,
      solution: form.solution.value,
      challenges: form.challenges.value,
      results: form.results.value,
      technologies: form.technologies.value.split(",").map(t => t.trim()).filter(Boolean),
      features: form.features.value.split("\n").map(f => f.trim()).filter(Boolean),
      is_featured: form.is_featured.checked,
      is_published: form.is_published.checked,
      display_order: Number(form.display_order.value) || 1
    };

    try {
      if (editingItem) {
        await apiFetch(`/admin/projects/${editingItem.id}`, { method: "PUT", body: JSON.stringify(projectData) });
        showToast("Project updated successfully!");
      } else {
        await apiFetch("/admin/projects", { method: "POST", body: JSON.stringify(projectData) });
        showToast("Project created successfully!");
      }
      setModalType(null);
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await apiFetch(`/admin/projects/${id}`, { method: "DELETE" });
      showToast("Project deleted!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Experience Actions
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const form = e.target;
    const expData = {
      organization: form.organization.value,
      position: form.position.value,
      start_date: form.start_date.value,
      end_date: form.end_date.value,
      is_current: form.is_current.checked,
      location: form.location.value,
      description: form.description.value,
      responsibilities: form.responsibilities.value.split("\n").map(r => r.trim()).filter(Boolean),
      technologies: form.technologies.value.split(",").map(t => t.trim()).filter(Boolean),
      achievements: form.achievements.value.split("\n").map(a => a.trim()).filter(Boolean),
      is_published: form.is_published.checked,
      display_order: Number(form.display_order.value) || 1
    };

    try {
      if (editingItem) {
        await apiFetch(`/admin/experience/${editingItem.id}`, { method: "PUT", body: JSON.stringify(expData) });
        showToast("Experience entry updated!");
      } else {
        await apiFetch("/admin/experience", { method: "POST", body: JSON.stringify(expData) });
        showToast("Experience entry created!");
      }
      setModalType(null);
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience entry?")) return;
    try {
      await apiFetch(`/admin/experience/${id}`, { method: "DELETE" });
      showToast("Experience entry deleted!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Skill Actions
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    const form = e.target;
    const skillData = {
      name: form.name.value,
      category: form.category.value,
      icon: form.icon.value || "Code",
      is_active: form.is_active.checked,
      display_order: Number(form.display_order.value) || 1
    };

    try {
      if (editingItem) {
        await apiFetch(`/admin/skills/${editingItem.id}`, { method: "PUT", body: JSON.stringify(skillData) });
        showToast("Skill updated!");
      } else {
        await apiFetch("/admin/skills", { method: "POST", body: JSON.stringify(skillData) });
        showToast("Skill added!");
      }
      setModalType(null);
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await apiFetch(`/admin/skills/${id}`, { method: "DELETE" });
      showToast("Skill deleted!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Gallery Actions
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    const form = e.target;
    const galleryData = {
      title: form.title.value,
      category: form.category.value,
      description: form.description.value,
      image: form.image.value,
      is_published: form.is_published.checked,
      display_order: Number(form.display_order.value) || 1
    };

    try {
      if (editingItem) {
        await apiFetch(`/admin/gallery/${editingItem.id}`, { method: "PUT", body: JSON.stringify(galleryData) });
        showToast("Gallery item updated!");
      } else {
        await apiFetch("/admin/gallery", { method: "POST", body: JSON.stringify(galleryData) });
        showToast("Gallery item added!");
      }
      setModalType(null);
      setEditingItem(null);
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("Are you sure you want to delete this gallery image?")) return;
    try {
      await apiFetch(`/admin/gallery/${id}`, { method: "DELETE" });
      showToast("Gallery item deleted!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Save About Page Data
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/about", {
        method: "PUT",
        body: JSON.stringify(about)
      });
      showToast("About page content saved!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Save Site Settings Data
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings)
      });
      showToast("Site settings saved!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Messages Actions
  const toggleMessageRead = async (id, currentStatus) => {
    try {
      await apiFetch(`/admin/messages/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: !currentStatus })
      });
      showToast(`Message marked as ${!currentStatus ? 'read' : 'unread'}`);
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await apiFetch(`/admin/messages/${id}`, { method: "DELETE" });
      showToast("Message deleted!");
      loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Code },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "about", label: "About Page", icon: User },
    { id: "settings", label: "Site Settings", icon: Settings },
    { id: "messages", label: "Messages", icon: Mail, badge: stats?.unread_messages },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row text-neutral-900 font-sans">
      
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 ${
          toast.type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#171717] text-white p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-light tracking-tight text-white">Admin CMS</h1>
              <p className="text-[11px] text-neutral-400">{user?.email}</p>
            </div>
            <button onClick={loadAllData} className="p-2 rounded hover:bg-white/10 text-neutral-400 hover:text-white" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-200 ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-md"
                      : "text-neutral-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        <div className="pt-6 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-light tracking-tight">Dashboard Overview</h2>
              <p className="text-xs text-neutral-500 mt-1">Portfolio statistics and content status</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Projects</span>
                <p className="text-3xl font-semibold text-neutral-900">{stats?.total_projects || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Experience</span>
                <p className="text-3xl font-semibold text-neutral-900">{stats?.total_experience || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Skills</span>
                <p className="text-3xl font-semibold text-neutral-900">{stats?.total_skills || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Gallery</span>
                <p className="text-3xl font-semibold text-neutral-900">{stats?.total_gallery || 0}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Messages</span>
                <p className="text-3xl font-semibold text-neutral-900">{stats?.total_messages || 0}</p>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold">Unread</span>
                <p className="text-3xl font-semibold text-rose-900">{stats?.unread_messages || 0}</p>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl border border-black/10 p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-medium">Recent Contact Inquiries</h3>
              {stats?.recent_messages && stats.recent_messages.length > 0 ? (
                <div className="divide-y divide-black/5">
                  {stats.recent_messages.map((m) => (
                    <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-neutral-900">{m.name}</span>
                        <span className="text-xs text-neutral-500 ml-2 font-mono">({m.email})</span>
                        <p className="text-xs text-neutral-700 mt-1 line-clamp-1">{m.message}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("messages")}
                        className="text-xs font-semibold uppercase tracking-wider text-black border-b border-black w-fit"
                      >
                        View in Messages
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500">No contact messages received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. PROJECTS MANAGEMENT */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-light tracking-tight">Manage Projects</h2>
                <p className="text-xs text-neutral-500 mt-1">Add, edit, or remove portfolio showcase projects</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('project'); }}
                className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                    <th className="p-4">Project</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-neutral-800">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-medium flex items-center gap-3">
                        <img src={p.image} alt={p.title} className="w-10 h-8 object-cover rounded border" />
                        <div>
                          <div className="font-semibold text-neutral-900">{p.title}</div>
                          <div className="text-[10px] text-neutral-500">{p.company || p.year}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{p.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {p.is_featured && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                          {p.is_published ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-semibold">Published</span>
                          ) : (
                            <span className="bg-neutral-100 text-neutral-600 text-[10px] px-2 py-0.5 rounded">Draft</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditingItem(p); setModalType('project'); }}
                          className="p-1.5 rounded hover:bg-black/10 text-neutral-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. EXPERIENCE MANAGEMENT */}
        {activeTab === "experience" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-light tracking-tight">Manage Experience</h2>
                <p className="text-xs text-neutral-500 mt-1">Add, edit, or reorder vertical timeline experience entries</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('experience'); }}
                className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                    <th className="p-4">Position</th>
                    <th className="p-4">Organization</th>
                    <th className="p-4">Dates</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-neutral-800">
                  {experience.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-semibold text-neutral-900">{exp.position}</td>
                      <td className="p-4">{exp.organization}</td>
                      <td className="p-4 font-mono">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditingItem(exp); setModalType('experience'); }}
                          className="p-1.5 rounded hover:bg-black/10 text-neutral-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SKILLS MANAGEMENT */}
        {activeTab === "skills" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-light tracking-tight">Manage Technical Skills</h2>
                <p className="text-xs text-neutral-500 mt-1">Categorize and reorder frontend, backend, database, and tool skills</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('skill'); }}
                className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                    <th className="p-4">Skill Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Order</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-neutral-800">
                  {skills.map((s) => (
                    <tr key={s.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-semibold text-neutral-900">{s.name}</td>
                      <td className="p-4 font-mono">{s.category}</td>
                      <td className="p-4">{s.display_order}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => { setEditingItem(s); setModalType('skill'); }}
                          className="p-1.5 rounded hover:bg-black/10 text-neutral-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(s.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. GALLERY MANAGEMENT */}
        {activeTab === "gallery" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-light tracking-tight">Manage Gallery</h2>
                <p className="text-xs text-neutral-500 mt-1">Upload persistent images and set categories</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('gallery'); }}
                className="px-4 py-2.5 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="aspect-[4/3] bg-neutral-200 overflow-hidden relative">
                    <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest bg-black/70 text-white px-2 py-0.5 rounded">
                      {g.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-neutral-900">{g.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2">{g.description}</p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5">
                      <button
                        onClick={() => { setEditingItem(g); setModalType('gallery'); }}
                        className="p-1.5 rounded hover:bg-black/10 text-neutral-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. ABOUT PAGE MANAGEMENT */}
        {activeTab === "about" && about && (
          <form onSubmit={handleSaveAbout} className="bg-white rounded-2xl border border-black/10 p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-light tracking-tight">Edit About Page</h2>
              <p className="text-xs text-neutral-500 mt-1">Update public biography, heading, philosophy, and profile picture</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">About Heading</label>
                <input
                  type="text"
                  value={about.heading || ""}
                  onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Short Introduction</label>
                <textarea
                  rows={2}
                  value={about.introduction || ""}
                  onChange={(e) => setAbout({ ...about, introduction: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Biography (Paragraphs separated by double linebreaks)</label>
                <textarea
                  rows={6}
                  value={about.biography || ""}
                  onChange={(e) => setAbout({ ...about, biography: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Profile Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={about.profile_image || ""}
                    onChange={(e) => setAbout({ ...about, profile_image: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                  />
                  <label className="px-4 py-2.5 bg-neutral-800 text-white text-xs uppercase tracking-widest font-semibold rounded-xl cursor-pointer hover:bg-black transition flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setAbout({ ...about, profile_image: url }))} />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Design Philosophy</label>
                <input
                  type="text"
                  value={about.philosophy || ""}
                  onChange={(e) => setAbout({ ...about, philosophy: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition">
              Save About Page Changes
            </button>
          </form>
        )}

        {/* 7. SITE SETTINGS */}
        {activeTab === "settings" && settings && (
          <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-black/10 p-8 space-y-6 shadow-sm animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-light tracking-tight">Site Settings</h2>
              <p className="text-xs text-neutral-500 mt-1">Global website branding, social media links, and footer info</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Profile Name</label>
                <input
                  type="text"
                  value={settings.profile_name || ""}
                  onChange={(e) => setSettings({ ...settings, profile_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Logo Text</label>
                <input
                  type="text"
                  value={settings.logo_text || ""}
                  onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Tagline</label>
                <input
                  type="text"
                  value={settings.tagline || ""}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Contact Email</label>
                <input
                  type="email"
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Location</label>
                <input
                  type="text"
                  value={settings.location || ""}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">GitHub URL</label>
                <input
                  type="text"
                  value={settings.github || ""}
                  onChange={(e) => setSettings({ ...settings, github: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">LinkedIn URL</label>
                <input
                  type="text"
                  value={settings.linkedin || ""}
                  onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 block">Copyright Notice</label>
                <input
                  type="text"
                  value={settings.copyright || ""}
                  onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50 text-sm"
                />
              </div>
            </div>

            <button type="submit" className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-neutral-800 transition">
              Save Settings
            </button>
          </form>
        )}

        {/* 8. MESSAGES MANAGEMENT */}
        {activeTab === "messages" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-light tracking-tight">Contact Messages</h2>
              <p className="text-xs text-neutral-500 mt-1">Review contact submissions from the public website</p>
            </div>

            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-black/10 text-[11px] uppercase tracking-wider font-semibold text-neutral-500">
                    <th className="p-4">Sender</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-neutral-800">
                  {messages.map((m) => (
                    <tr key={m.id} className={m.is_read ? "bg-white" : "bg-blue-50/50 font-medium"}>
                      <td className="p-4">
                        <div className="font-semibold text-neutral-900">{m.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{m.email}</div>
                      </td>
                      <td className="p-4 font-medium">{m.subject}</td>
                      <td className="p-4 text-neutral-600 max-w-xs">{m.message}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => toggleMessageRead(m.id, m.is_read)}
                          className="p-1.5 rounded hover:bg-black/10 text-neutral-700"
                          title={m.is_read ? "Mark Unread" : "Mark Read"}
                        >
                          {m.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-blue-600" />}
                        </button>
                        <a
                          href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                          className="p-1.5 rounded hover:bg-black/10 text-neutral-700 inline-block"
                          title="Reply via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-1.5 rounded hover:bg-rose-50 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL FOR ADD / EDIT ITEM */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <h3 className="text-xl font-light tracking-tight capitalize">
                {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
              </h3>
              <button onClick={() => { setModalType(null); setEditingItem(null); }} className="p-2 rounded-full hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PROJECT FORM */}
            {modalType === 'project' && (
              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Title *</label>
                    <input type="text" name="title" defaultValue={editingItem?.title || ""} required className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Slug *</label>
                    <input type="text" name="slug" defaultValue={editingItem?.slug || ""} required className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Category</label>
                    <input type="text" name="category" defaultValue={editingItem?.category || "Web Application"} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Company / Client</label>
                    <input type="text" name="company" defaultValue={editingItem?.company || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Year</label>
                    <input type="text" name="year" defaultValue={editingItem?.year || "2026"} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Short Description *</label>
                  <textarea name="short_description" rows={2} defaultValue={editingItem?.short_description || ""} required className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Full Overview Description</label>
                  <textarea name="full_description" rows={4} defaultValue={editingItem?.full_description || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Main Image URL</label>
                  <input type="text" id="project_image_input" name="image" defaultValue={editingItem?.image || ""} className="w-full p-2.5 border rounded-xl mb-1" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">GitHub URL</label>
                    <input type="text" name="github_url" defaultValue={editingItem?.github_url || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Live Demo URL</label>
                    <input type="text" name="live_demo_url" defaultValue={editingItem?.live_demo_url || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Problem Statement</label>
                  <textarea name="problem" rows={2} defaultValue={editingItem?.problem || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Solution Architecture</label>
                  <textarea name="solution" rows={2} defaultValue={editingItem?.solution || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Technologies (Comma separated)</label>
                  <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(", ") || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Key Features (One per line)</label>
                  <textarea name="features" rows={3} defaultValue={editingItem?.features?.join("\n") || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Challenges</label>
                    <textarea name="challenges" rows={2} defaultValue={editingItem?.challenges || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Results & Impact</label>
                    <textarea name="results" rows={2} defaultValue={editingItem?.results || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" name="is_featured" defaultChecked={editingItem?.is_featured ?? false} className="w-4 h-4 rounded" />
                    <span>Featured Project</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded" />
                    <span>Published Status</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border rounded-xl text-neutral-700">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-black text-white rounded-xl font-semibold">Save Project</button>
                </div>
              </form>
            )}

            {/* EXPERIENCE FORM */}
            {modalType === 'experience' && (
              <form onSubmit={handleSaveExperience} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Position *</label>
                    <input type="text" name="position" defaultValue={editingItem?.position || ""} required className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Organization *</label>
                    <input type="text" name="organization" defaultValue={editingItem?.organization || ""} required className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Start Date</label>
                    <input type="text" name="start_date" defaultValue={editingItem?.start_date || ""} placeholder="e.g. 2025-01" className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">End Date</label>
                    <input type="text" name="end_date" defaultValue={editingItem?.end_date || ""} placeholder="e.g. 2025-12 or Present" className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Location</label>
                    <input type="text" name="location" defaultValue={editingItem?.location || ""} className="w-full p-2.5 border rounded-xl" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Description *</label>
                  <textarea name="description" rows={3} defaultValue={editingItem?.description || ""} required className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Key Responsibilities (One per line)</label>
                  <textarea name="responsibilities" rows={3} defaultValue={editingItem?.responsibilities?.join("\n") || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Achievements (One per line)</label>
                  <textarea name="achievements" rows={2} defaultValue={editingItem?.achievements?.join("\n") || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Technologies (Comma separated)</label>
                  <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(", ") || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" name="is_current" defaultChecked={editingItem?.is_current ?? false} className="w-4 h-4 rounded" />
                    <span>Current Position</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium">
                    <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded" />
                    <span>Published</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border rounded-xl text-neutral-700">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-black text-white rounded-xl font-semibold">Save Experience</button>
                </div>
              </form>
            )}

            {/* SKILL FORM */}
            {modalType === 'skill' && (
              <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Skill Name *</label>
                  <input type="text" name="name" defaultValue={editingItem?.name || ""} required className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Category *</label>
                    <select name="category" defaultValue={editingItem?.category || "Frontend"} className="w-full p-2.5 border rounded-xl bg-white">
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Database">Database</option>
                      <option value="Tools">Tools</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Icon Identifier</label>
                    <input type="text" name="icon" defaultValue={editingItem?.icon || "Code"} placeholder="Code, Zap, Server..." className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Display Order</label>
                  <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" name="is_active" defaultChecked={editingItem?.is_active ?? true} className="w-4 h-4 rounded" />
                  <span className="font-medium">Active Status</span>
                </div>

                <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border rounded-xl text-neutral-700">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-black text-white rounded-xl font-semibold">Save Skill</button>
                </div>
              </form>
            )}

            {/* GALLERY FORM */}
            {modalType === 'gallery' && (
              <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Title *</label>
                  <input type="text" name="title" defaultValue={editingItem?.title || ""} required className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Category *</label>
                    <select name="category" defaultValue={editingItem?.category || "Development"} className="w-full p-2.5 border rounded-xl bg-white">
                      <option value="Photography">Photography</option>
                      <option value="Travel">Travel</option>
                      <option value="Events">Events</option>
                      <option value="Development">Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} className="w-full p-2.5 border rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Image URL *</label>
                  <input type="text" name="image" defaultValue={editingItem?.image || ""} required className="w-full p-2.5 border rounded-xl" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-neutral-600 block mb-1">Description</label>
                  <textarea name="description" rows={2} defaultValue={editingItem?.description || ""} className="w-full p-2.5 border rounded-xl" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded" />
                  <span className="font-medium">Published</span>
                </div>

                <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border rounded-xl text-neutral-700">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-black text-white rounded-xl font-semibold">Save Image</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
