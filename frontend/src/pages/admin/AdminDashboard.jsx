import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";
import {
  LayoutDashboard, FolderKanban, Briefcase, Code, Image as ImageIcon,
  User, Settings, Mail, LogOut, Plus, Edit2, Trash2, Check, X, Upload,
  Star, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw, Menu, Award, ChevronLeft, ChevronRight
} from "lucide-react";


function AdditionalImageManager({ images, onChange, onUpload, label = "Additional Images" }) {
  const [url, setUrl] = useState("");

  const addUrl = () => {
    const value = url.trim();
    if (!value) return;
    onChange([...images, value]);
    setUrl("");
  };

  const move = (index, direction) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section className="space-y-3 rounded-xl border border-[#857E7B]/20 bg-[#F7F7F2] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-[11px] uppercase tracking-wider text-[#214E34]">{label}</h4>
          <p className="mt-1 text-[10px] text-[#857E7B]">Upload images or add image URLs. Reorder them using the arrows.</p>
        </div>
        <span className="rounded-full bg-[#DCE8DF] px-2 py-1 text-[10px] font-semibold text-[#214E34]">{images.length} images</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          placeholder="Paste an image URL (https://...)"
          className="min-w-0 flex-1 rounded-lg border border-[#857E7B]/30 bg-white px-3 py-2 text-xs outline-none focus:border-[#214E34]"
        />
        <button type="button" onClick={addUrl} className="rounded-lg bg-[#214E34] px-3 py-2 text-xs font-semibold text-white hover:bg-[#17251D]">
          Add URL
        </button>
        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#214E34]/30 bg-white px-3 py-2 text-xs font-semibold text-[#214E34] hover:bg-[#DCE8DF]">
          <Upload className="h-3.5 w-3.5" /> Upload
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) await onUpload(file, (uploadedUrl) => onChange((current) => [...current, uploadedUrl]));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="overflow-hidden rounded-lg border border-[#857E7B]/20 bg-white">
              <div className="aspect-[4/3] bg-stone-100">
                <img src={src} alt={`${label} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <span className="min-w-0 truncate text-[9px] text-[#857E7B]">Image {index + 1}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" disabled={index === 0} onClick={() => move(index, -1)} title="Move left" className="rounded p-1 text-[#214E34] hover:bg-[#DCE8DF] disabled:opacity-25"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => move(index, 1)} title="Move right" className="rounded p-1 text-[#214E34] hover:bg-[#DCE8DF] disabled:opacity-25"><ChevronRight className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => onChange(images.filter((_, i) => i !== index))} title="Remove image" className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[#857E7B]/30 bg-white p-4 text-center text-[10px] text-[#857E7B]">No additional images added yet.</p>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [skills, setSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [about, setAbout] = useState(null);
  const [settings, setSettings] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Modals state
  const [modalType, setModalType] = useState(null); // project, experience, skill, achievement, gallery
  const [editingItem, setEditingItem] = useState(null);
  const [projectImages, setProjectImages] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [sData, pData, eData, skData, gData, aData, setDbData, mData, achData] = await Promise.all([
        apiFetch("/admin/dashboard"),
        apiFetch("/admin/projects"),
        apiFetch("/admin/experience"),
        apiFetch("/admin/skills"),
        apiFetch("/admin/gallery"),
        apiFetch("/about"),
        apiFetch("/settings"),
        apiFetch("/admin/messages"),
        apiFetch("/admin/achievements")
      ]);

      setStats(sData);
      setProjects(pData);
      setExperience(eData);
      setSkills(skData);
      setAchievements(Array.isArray(achData) ? achData : []);
      setGallery(gData);
      setAbout(aData);
      // Convert legacy GitHub/LinkedIn settings into the flexible social_links list.
      const legacySocialLinks = [
        setDbData?.github ? { id: "legacy-github", platform: "GitHub", url: setDbData.github } : null,
        setDbData?.linkedin ? { id: "legacy-linkedin", platform: "LinkedIn", url: setDbData.linkedin } : null,
      ].filter(Boolean);
      setSettings({
        ...setDbData,
        social_links: Array.isArray(setDbData?.social_links)
          ? setDbData.social_links.map((item, index) => ({
              ...item,
              id: item.id || `saved-social-${index}`,
            }))
          : legacySocialLinks,
      });
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

  const uploadImageFile = async (file, callback) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await apiFetch("/admin/upload", { method: "POST", body: formData });
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
      images: projectImages,
      // Keep the legacy field populated so older frontend builds still display these images.
      screenshots: projectImages,
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
      display_order: Math.max(1, Math.floor(Number(form.display_order.value) || 1))
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
      display_order: Math.max(1, Math.floor(Number(form.display_order.value) || 1))
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
      icon: form.icon.value || "Code",
      is_active: form.is_active.checked,
      display_order: Math.max(1, Math.floor(Number(form.display_order.value) || 1))
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

  // Achievement Actions
  const handleSaveAchievement = async (e) => {
    e.preventDefault();
    const form = e.target;

    const achievementData = {
      title: form.title.value.trim(),
      organization: form.organization.value.trim(),
      year: form.year.value.trim(),
      description: form.description.value.trim(),
      image: form.image.value.trim(),
      display_order: Math.max(1, Math.floor(Number(form.display_order.value) || 1)),
      is_published: form.is_published.checked
    };

    try {
      if (editingItem) {
        await apiFetch(`/admin/achievements/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(achievementData)
        });
        showToast("Achievement updated successfully!");
      } else {
        await apiFetch("/admin/achievements", {
          method: "POST",
          body: JSON.stringify(achievementData)
        });
        showToast("Achievement added successfully!");
      }

      setModalType(null);
      setEditingItem(null);
      await loadAllData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;

    try {
      await apiFetch(`/admin/achievements/${id}`, { method: "DELETE" });
      showToast("Achievement deleted!");
      await loadAllData();
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
      images: galleryImages,
      is_published: form.is_published.checked,
      display_order: Math.max(1, Math.floor(Number(form.display_order.value) || 1))
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

  // Dynamic social link controls in Site Settings.
  const addSocialLink = () => {
    setSettings((prev) => ({
      ...prev,
      social_links: [
        ...(Array.isArray(prev.social_links) ? prev.social_links : []),
        { id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, platform: "Facebook", url: "" },
      ],
    }));
  };

  const updateSocialLink = (id, field, value) => {
    setSettings((prev) => ({
      ...prev,
      social_links: (prev.social_links || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeSocialLink = (id) => {
    setSettings((prev) => ({
      ...prev,
      social_links: (prev.social_links || []).filter((item) => item.id !== id),
    }));
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
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "gallery", label: "Gallery", icon: ImageIcon },
    { id: "about", label: "About Page", icon: User },
    { id: "settings", label: "Site Settings", icon: Settings },
    { id: "messages", label: "Messages", icon: Mail, badge: stats?.unread_messages },
  ];

  return (
    <div className="min-h-dvh md:h-dvh md:min-h-0 md:overflow-hidden bg-[#F7F7F2] flex flex-col md:flex-row text-[#17251D] font-sans">
      
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 ${
          toast.type === "error" ? "bg-[#17251D] text-rose-300 border border-rose-400/30" : "bg-[#214E34] text-white"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Header (hidden on md and above) */}
      <div className="md:hidden bg-[#17251D] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-white/10 shadow-xs">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Bipal Dashboard</h1>
          <p className="text-[10px] text-[#857E7B] truncate max-w-[180px]">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#857E7B] hover:text-white transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* SIDEBAR (Desktop sticky, Mobile drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-dvh w-64 max-w-[85vw] bg-[#17251D] text-white p-5 sm:p-6 flex flex-col justify-between overflow-hidden shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col space-y-6">
          <div className="flex shrink-0 items-center justify-between">
            <div>
              <h1 className="text-lg font-light tracking-tight text-white">Bipal Dashboard</h1>
              <p className="text-[10px] text-[#857E7B] truncate max-w-[180px]">{user?.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={loadAllData}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#857E7B] hover:text-white transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-[#857E7B] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1 pb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-[#214E34] text-white font-semibold shadow-xs"
                      : "text-[#857E7B] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="bg-[#DCE8DF] text-[#214E34] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 pt-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#857E7B] hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="min-w-0 min-h-0 flex-1 p-4 pb-8 sm:p-6 sm:pb-10 md:p-8 md:overflow-y-auto md:overscroll-contain md:h-dvh max-w-6xl mx-auto w-full">

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Dashboard Overview</h2>
              <p className="text-xs text-[#857E7B] mt-1">Portfolio statistics and content status</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#857E7B]/20 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#857E7B] font-semibold">Projects</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17251D]">{stats?.total_projects || 0}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#857E7B]/20 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#857E7B] font-semibold">Experience</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17251D]">{stats?.total_experience || 0}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#857E7B]/20 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#857E7B] font-semibold">Skills</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17251D]">{stats?.total_skills || 0}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#857E7B]/20 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#857E7B] font-semibold">Gallery</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17251D]">{stats?.total_gallery || 0}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#857E7B]/20 shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#857E7B] font-semibold">Messages</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#17251D]">{stats?.total_messages || 0}</p>
              </div>

              <div className="bg-[#DCE8DF] border border-[#214E34]/20 p-4 rounded-2xl shadow-xs space-y-1">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#214E34] font-semibold">Unread</span>
                <p className="text-2xl sm:text-3xl font-semibold text-[#214E34]">{stats?.unread_messages || 0}</p>
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-white rounded-2xl border border-[#857E7B]/20 p-5 sm:p-6 space-y-4 shadow-xs">
              <h3 className="text-base sm:text-lg font-medium text-[#17251D]">Recent Contact Inquiries</h3>
              {stats?.recent_messages && stats.recent_messages.length > 0 ? (
                <div className="divide-y divide-[#857E7B]/15">
                  {stats.recent_messages.map((m) => (
                    <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#17251D]">{m.name}</span>
                        <span className="text-xs text-[#857E7B] ml-2 font-mono">({m.email})</span>
                        <p className="text-xs text-[#857E7B] mt-1 line-clamp-1">{m.message}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("messages")}
                        className="text-xs font-semibold uppercase tracking-wider text-[#214E34] hover:underline w-fit cursor-pointer"
                      >
                        View in Messages
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#857E7B]">No contact messages received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 2. PROJECTS MANAGEMENT */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Manage Projects</h2>
                <p className="text-xs text-[#857E7B] mt-1">Add, edit, or remove portfolio showcase projects</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setProjectImages([]); setModalType('project'); }}
                className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#857E7B]/20 overflow-hidden shadow-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#857E7B]/15 text-[11px] uppercase tracking-wider font-semibold text-[#857E7B]">
                      <th className="p-4">Project</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#857E7B]/15 text-xs text-[#17251D]">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F7F7F2]/60 transition">
                        <td className="p-4 font-medium flex items-center gap-3">
                          <img src={p.image} alt={p.title} className="w-10 h-8 object-cover rounded border border-[#857E7B]/20" />
                          <div>
                            <div className="font-semibold text-[#17251D]">{p.title}</div>
                            <div className="text-[10px] text-[#857E7B]">{p.company || p.year}</div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs">{p.category}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {p.is_featured && (
                              <span className="bg-[#214E34] text-white text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                <Star className="w-3 h-3" /> Featured
                              </span>
                            )}
                            {p.is_published ? (
                              <span className="bg-[#DCE8DF] text-[#214E34] text-[10px] px-2 py-0.5 rounded font-semibold">Published</span>
                            ) : (
                              <span className="bg-stone-100 text-[#857E7B] text-[10px] px-2 py-0.5 rounded">Draft</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => { setEditingItem(p); setProjectImages((Array.isArray(p.images) && p.images.length ? p.images : (Array.isArray(p.screenshots) ? p.screenshots : []))); setModalType('project'); }}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            title="Delete"
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
          </div>
        )}

        {/* 3. EXPERIENCE MANAGEMENT */}
        {activeTab === "experience" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Manage Experience</h2>
                <p className="text-xs text-[#857E7B] mt-1">Add, edit, or reorder vertical timeline experience entries</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('experience'); }}
                className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Experience
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#857E7B]/20 overflow-hidden shadow-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#857E7B]/15 text-[11px] uppercase tracking-wider font-semibold text-[#857E7B]">
                      <th className="p-4">Position</th>
                      <th className="p-4">Organization</th>
                      <th className="p-4">Dates</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#857E7B]/15 text-xs text-[#17251D]">
                    {experience.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#F7F7F2]/60 transition">
                        <td className="p-4 font-semibold text-[#17251D]">{exp.position}</td>
                        <td className="p-4 text-[#17251D]">{exp.organization}</td>
                        <td className="p-4 font-mono text-xs">{exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => { setEditingItem(exp); setModalType('experience'); }}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            title="Delete"
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
          </div>
        )}

        {/* 4. SKILLS MANAGEMENT */}
        {activeTab === "skills" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Manage Technical Skills</h2>
                <p className="text-xs text-[#857E7B] mt-1">Add, manage, and reorder your technical skills</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setModalType('skill'); }}
                className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#857E7B]/20 overflow-hidden shadow-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[400px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#857E7B]/15 text-[11px] uppercase tracking-wider font-semibold text-[#857E7B]">
                      <th className="p-4">Skill Name</th>
                      <th className="p-4">Order</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#857E7B]/15 text-xs text-[#17251D]">
                    {skills.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F7F7F2]/60 transition">
                        <td className="p-4 font-semibold text-[#17251D]">{s.name}</td>
                        <td className="p-4">{s.display_order}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => { setEditingItem(s); setModalType('skill'); }}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(s.id)}
                            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            title="Delete"
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
          </div>
        )}

        {/* 5. ACHIEVEMENTS MANAGEMENT */}
        {activeTab === "achievements" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">
                  Manage Achievements
                </h2>
                <p className="text-xs text-[#857E7B] mt-1">
                  Add, edit, publish, or remove awards and recognitions.
                </p>
              </div>

              <button
                onClick={() => { setEditingItem(null); setModalType("achievement"); }}
                className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Achievement
              </button>
            </div>

            {achievements.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-[#857E7B]/20 overflow-hidden shadow-xs">
                    {item.image ? (
                      <div className="aspect-[16/9] bg-[#F7F7F2] overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-[#E8F0EA] flex items-center justify-center">
                        <Award className="w-10 h-10 text-[#214E34]" />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-[#17251D]">{item.title}</h3>
                          <p className="text-xs text-[#214E34] mt-1">{item.organization}</p>
                        </div>
                        {item.year && (
                          <span className="text-[10px] font-mono bg-[#EEF3EF] text-[#214E34] px-2 py-1 rounded-md shrink-0">
                            {item.year}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-[#857E7B] leading-5 line-clamp-3">{item.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-[#857E7B]/15">
                        <span className={`text-[10px] font-bold uppercase ${item.is_published ? "text-[#214E34]" : "text-rose-500"}`}>
                          {item.is_published ? "Published" : "Hidden"}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingItem(item); setModalType("achievement"); }}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                            title="Edit achievement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAchievement(item.id)}
                            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete achievement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#857E7B]/20 p-10 text-center">
                <Award className="w-8 h-8 mx-auto text-[#A3B2A7] mb-3" />
                <p className="text-sm font-semibold text-[#17251D]">No achievements added yet</p>
                <p className="text-xs text-[#857E7B] mt-1">Select Add Achievement to create your first entry.</p>
              </div>
            )}
          </div>
        )}

        {/* 6. GALLERY MANAGEMENT */}
        {activeTab === "gallery" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Manage Gallery</h2>
                <p className="text-xs text-[#857E7B] mt-1">Upload persistent images and set categories</p>
              </div>
              <button
                onClick={() => { setEditingItem(null); setGalleryImages([]); setModalType('gallery'); }}
                className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Image
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="bg-white border border-[#857E7B]/20 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                    <img src={g.image} alt={g.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-widest bg-[#17251D]/80 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                      {g.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-[#17251D]">{g.title}</h4>
                    <p className="text-xs text-[#857E7B] line-clamp-2">{g.description}</p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#857E7B]/15">
                      <button
                        onClick={() => { setEditingItem(g); setGalleryImages((Array.isArray(g.images) ? g.images : [])); setModalType('gallery'); }}
                        className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                        title="Delete"
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
          <form onSubmit={handleSaveAbout} className="bg-white rounded-2xl border border-[#857E7B]/20 p-5 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Edit About Page</h2>
              <p className="text-xs text-[#857E7B] mt-1">Update public biography, heading, philosophy, and profile picture</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">About Heading</label>
                <input
                  type="text"
                  value={about.heading || ""}
                  onChange={(e) => setAbout({ ...about, heading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">Short Introduction</label>
                <textarea
                  rows={2}
                  value={about.introduction || ""}
                  onChange={(e) => setAbout({ ...about, introduction: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">Biography (Paragraphs separated by double linebreaks)</label>
                <textarea
                  rows={6}
                  value={about.biography || ""}
                  onChange={(e) => setAbout({ ...about, biography: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">Profile Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={about.profile_image || ""}
                    onChange={(e) => setAbout({ ...about, profile_image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
                  />
                  <label className="px-4 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl cursor-pointer hover:bg-[#17251D] transition flex items-center gap-1.5 shrink-0 shadow-xs">
                    <Upload className="w-4 h-4" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setAbout({ ...about, profile_image: url }))} />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">Design Philosophy</label>
                <input
                  type="text"
                  value={about.philosophy || ""}
                  onChange={(e) => setAbout({ ...about, philosophy: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
                />
              </div>
            </div>

            <button type="submit" className="px-5 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition cursor-pointer shadow-xs">
              Save About Page Changes
            </button>
          </form>
        )}

        {/* 7. SITE SETTINGS */}
{activeTab === "settings" && settings && (
  <form
    onSubmit={handleSaveSettings}
    className="bg-white rounded-2xl border border-[#857E7B]/20 p-5 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-300"
  >
    <div>
      <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">
        Site Settings
      </h2>
      <p className="text-xs text-[#857E7B] mt-1">
        Global website branding, social media links, and footer info
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">

      {/* PROFILE NAME */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Profile Name
        </label>
        <input
          type="text"
          value={settings.profile_name || ""}
          onChange={(e) => setSettings({ ...settings, profile_name: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

      {/* LOGO TEXT */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Logo Text
        </label>
        <input
          type="text"
          value={settings.logo_text || ""}
          onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

      {/* TAGLINE */}
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Tagline
        </label>
        <input
          type="text"
          value={settings.tagline || ""}
          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

      {/* FOOTER PROFILE IMAGE */}
<div className="space-y-3 sm:col-span-2">
  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
    Profile Image
  </label>

  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-[#857E7B]/20 bg-[#F7F7F2]">

    {/* IMAGE PREVIEW */}
    {settings.footer_image ? (
      <img
        src={settings.footer_image}
        alt="Footer profile"
        className="w-20 h-20 rounded-full object-cover border-2 border-[#214E34]"
      />
    ) : (
      <div className="w-20 h-20 rounded-full bg-[#DCE8DF] flex items-center justify-center text-[#214E34] text-xs font-medium">
        No Image
      </div>
    )}

    <div className="flex flex-wrap items-center gap-2">

      {/* UPLOAD / REPLACE */}
      <label className="px-4 py-2.5 bg-[#214E34] text-white text-xs font-semibold rounded-xl hover:bg-[#17251D] transition cursor-pointer flex items-center gap-2">
        <Upload className="w-4 h-4" />
        {settings.footer_image ? "Replace Image" : "Upload Image"}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) =>
            handleImageUpload(e, (url) =>
              setSettings((prev) => ({
                ...prev,
                footer_image: url
              }))
            )
          }
        />
      </label>

      {/* REMOVE IMAGE */}
      {settings.footer_image && (
        <button
          type="button"
          onClick={() =>
            setSettings((prev) => ({
              ...prev,
              footer_image: ""
            }))
          }
          className="px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition"
        >
          Remove Image
        </button>
      )}
    </div>
  </div>

  {/* IMAGE URL INPUT */}
  <div className="space-y-2">
    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#857E7B]">
      Or Paste Image URL
    </label>

    <input
      type="url"
      value={settings.footer_image || ""}
      onChange={(e) =>
        setSettings((prev) => ({
          ...prev,
          footer_image: e.target.value
        }))
      }
      placeholder="https://example.com/profile-image.jpg"
      className="w-full px-4 py-3 rounded-xl border border-[#857E7B]/30 bg-white text-sm text-[#214E34] outline-none focus:border-[#214E34] transition"
    />
  </div>

  <p className="text-[10px] text-[#857E7B]">
    Upload JPG, PNG, WEBP or GIF (maximum 5MB), or paste a direct image URL.
  </p>
</div>


      {/* CONTACT EMAIL */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Contact Email
        </label>
        <input
          type="email"
          value={settings.email || ""}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

      {/* LOCATION */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Location
        </label>
        <input
          type="text"
          value={settings.location || ""}
          onChange={(e) => setSettings({ ...settings, location: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

      {/* DYNAMIC SOCIAL MEDIA LINKS */}
      <div className="min-w-0 sm:col-span-2 space-y-4 rounded-2xl border border-[#857E7B]/20 bg-[#F7F7F2]/70 p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#17251D]">Social Media Links</h3>
            <p className="text-[11px] text-[#857E7B] mt-1">
              Add any number of profiles. Choose a platform and paste its profile URL.
            </p>
          </div>
          <button
            type="button"
            onClick={addSocialLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#214E34] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#17251D] transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Social Link
          </button>
        </div>

        {(settings.social_links || []).length > 0 ? (
          <div className="space-y-3">
            {(settings.social_links || []).map((social, index) => (
              <div key={social.id || `social-${index}`} className="grid grid-cols-1 sm:grid-cols-[minmax(150px,0.8fr)_minmax(0,1.5fr)_auto] gap-3 items-stretch sm:items-end rounded-xl border border-[#857E7B]/20 bg-white p-3 sm:p-4 min-w-0">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#857E7B]">Platform</label>
                  <select
                    value={social.platform || "Other"}
                    onChange={(e) => updateSocialLink(social.id, "platform", e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2] text-xs text-[#17251D] outline-none focus:border-[#214E34]"
                  >
                    {[
                      "Facebook", "Instagram", "GitHub", "LinkedIn", "YouTube", "X", "TikTok",
                      "WhatsApp", "Telegram", "Discord", "Threads", "Pinterest", "Behance",
                      "Dribbble", "Medium", "Reddit", "Snapchat", "Website", "Other"
                    ].map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#857E7B]">Profile URL</label>
                  <input
                    type="url"
                    value={social.url || ""}
                    onChange={(e) => updateSocialLink(social.id, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2] text-xs text-[#17251D] outline-none focus:border-[#214E34]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(social.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-red-200 text-red-600 text-[11px] font-semibold hover:bg-red-50 transition"
                  aria-label={`Remove ${social.platform || "social"} link`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Remove</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#857E7B]/40 bg-white/70 px-4 py-6 text-center">
            <p className="text-xs font-medium text-[#17251D]">No social links added</p>
            <p className="text-[11px] text-[#857E7B] mt-1">Select “Add Social Link” to add your first profile.</p>
          </div>
        )}
      </div>

      {/* COPYRIGHT */}
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-[#857E7B] block">
          Copyright Notice
        </label>
        <input
          type="text"
          value={settings.copyright || ""}
          onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#857E7B]/30 bg-[#F7F7F2] text-xs sm:text-sm text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none"
        />
      </div>

    </div>

    {/* SAVE SETTINGS */}
    <button
      type="submit"
      className="px-5 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-[#17251D] transition cursor-pointer shadow-xs"
    >
      Save Settings
    </button>
  </form>
)}


        {/* 8. MESSAGES MANAGEMENT */}
        {activeTab === "messages" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#17251D]">Contact Messages</h2>
              <p className="text-xs text-[#857E7B] mt-1">Review contact submissions from the public website</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#857E7B]/20 overflow-hidden shadow-xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F7F7F2] border-b border-[#857E7B]/15 text-[11px] uppercase tracking-wider font-semibold text-[#857E7B]">
                      <th className="p-4">Sender</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Message</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#857E7B]/15 text-xs text-[#17251D]">
                    {messages.map((m) => (
                      <tr key={m.id} className={m.is_read ? "bg-white hover:bg-[#F7F7F2]/60 transition" : "bg-[#DCE8DF]/30 font-medium hover:bg-[#DCE8DF]/40 transition"}>
                        <td className="p-4">
                          <div className="font-semibold text-[#17251D]">{m.name}</div>
                          <div className="text-[10px] text-[#857E7B] font-mono">{m.email}</div>
                        </td>
                        <td className="p-4 font-medium text-[#17251D]">{m.subject}</td>
                        <td className="p-4 text-[#857E7B] max-w-xs">{m.message}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => toggleMessageRead(m.id, m.is_read)}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] transition cursor-pointer"
                            title={m.is_read ? "Mark Unread" : "Mark Read"}
                          >
                            {m.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#214E34]" />}
                          </button>
                          <a
                            href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                            className="p-1.5 rounded hover:bg-[#DCE8DF] text-[#214E34] inline-block transition cursor-pointer"
                            title="Reply via Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="p-1.5 rounded hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            title="Delete"
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
          </div>
        )}

      </main>

      {/* MODAL FOR ADD / EDIT ITEM */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto border border-[#857E7B]/20 text-[#17251D]">
            
            <div className="flex items-center justify-between border-b border-[#857E7B]/15 pb-3">
              <h3 className="text-lg sm:text-xl font-light tracking-tight capitalize text-[#17251D]">
                {editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
              </h3>
              <button
                onClick={() => { setModalType(null); setEditingItem(null); }}
                className="p-1.5 rounded-full hover:bg-stone-100 text-[#857E7B] hover:text-[#17251D] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PROJECT FORM */}
            {modalType === 'project' && (
              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Title *</label>
                    <input type="text" name="title" defaultValue={editingItem?.title || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Slug *</label>
                    <input type="text" name="slug" defaultValue={editingItem?.slug || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Category</label>
                    <input type="text" name="category" defaultValue={editingItem?.category || "Web Application"} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Company / Client</label>
                    <input type="text" name="company" defaultValue={editingItem?.company || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Year</label>
                    <input type="text" name="year" defaultValue={editingItem?.year || "2026"} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} min="1" step="1" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Short Description *</label>
                  <textarea name="short_description" rows={2} defaultValue={editingItem?.short_description || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Full Overview Description</label>
                  <textarea name="full_description" rows={4} defaultValue={editingItem?.full_description || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Main Image URL</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" id="project_image_input" name="image" defaultValue={editingItem?.image || ""} onChange={(e) => { const preview = document.getElementById("project_cover_preview"); if (preview) { preview.src = e.target.value; preview.classList.toggle("hidden", !e.target.value); } }} className="min-w-0 flex-1 p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                    <label className="px-3 py-2.5 bg-[#214E34] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#17251D] transition flex items-center justify-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" /> Upload Cover
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => uploadImageFile(e.target.files?.[0], (url) => { const input = document.getElementById("project_image_input"); const preview = document.getElementById("project_cover_preview"); if (input) input.value = url; if (preview) { preview.src = url; preview.classList.remove("hidden"); } })} />
                    </label>
                  </div>
                  <img id="project_cover_preview" src={editingItem?.image || ""} alt="Project cover preview" className={`mt-2 h-24 w-40 rounded-lg border border-[#857E7B]/20 object-cover ${editingItem?.image ? "" : "hidden"}`} />
                </div>

                <AdditionalImageManager
                  images={projectImages}
                  onChange={setProjectImages}
                  onUpload={uploadImageFile}
                  label="Project Screenshots / Additional Images"
                />

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">GitHub URL</label>
                    <input type="text" name="github_url" defaultValue={editingItem?.github_url || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Live Demo URL</label>
                    <input type="text" name="live_demo_url" defaultValue={editingItem?.live_demo_url || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Problem Statement</label>
                  <textarea name="problem" rows={2} defaultValue={editingItem?.problem || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Solution Architecture</label>
                  <textarea name="solution" rows={2} defaultValue={editingItem?.solution || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Technologies (Comma separated)</label>
                  <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(", ") || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Key Features (One per line)</label>
                  <textarea name="features" rows={3} defaultValue={editingItem?.features?.join("\n") || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Challenges</label>
                    <textarea name="challenges" rows={2} defaultValue={editingItem?.challenges || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Results & Impact</label>
                    <textarea name="results" rows={2} defaultValue={editingItem?.results || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_featured" defaultChecked={editingItem?.is_featured ?? false} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Featured Project</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Published Status</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#857E7B]/15 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border border-[#857E7B]/30 rounded-xl text-[#857E7B] hover:text-[#17251D] hover:bg-stone-100 transition cursor-pointer text-xs">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#214E34] text-white rounded-xl font-semibold hover:bg-[#17251D] transition cursor-pointer text-xs shadow-xs">Save Project</button>
                </div>
              </form>
            )}

            {/* EXPERIENCE FORM */}
            {modalType === 'experience' && (
              <form onSubmit={handleSaveExperience} className="space-y-4 text-xs">
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Position *</label>
                    <input type="text" name="position" defaultValue={editingItem?.position || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Organization *</label>
                    <input type="text" name="organization" defaultValue={editingItem?.organization || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Start Date</label>
                    <input type="text" name="start_date" defaultValue={editingItem?.start_date || ""} placeholder="e.g. 2025-01" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">End Date</label>
                    <input type="text" name="end_date" defaultValue={editingItem?.end_date || ""} placeholder="e.g. 2025-12 or Present" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Location</label>
                    <input type="text" name="location" defaultValue={editingItem?.location || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} min="1" step="1" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Description *</label>
                  <textarea name="description" rows={3} defaultValue={editingItem?.description || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Key Responsibilities (One per line)</label>
                  <textarea name="responsibilities" rows={3} defaultValue={editingItem?.responsibilities?.join("\n") || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Achievements (One per line)</label>
                  <textarea name="achievements" rows={2} defaultValue={editingItem?.achievements?.join("\n") || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Technologies (Comma separated)</label>
                  <input type="text" name="technologies" defaultValue={editingItem?.technologies?.join(", ") || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_current" defaultChecked={editingItem?.is_current ?? false} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Current Position</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Published</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#857E7B]/15 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border border-[#857E7B]/30 rounded-xl text-[#857E7B] hover:text-[#17251D] hover:bg-stone-100 transition cursor-pointer text-xs">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#214E34] text-white rounded-xl font-semibold hover:bg-[#17251D] transition cursor-pointer text-xs shadow-xs">Save Experience</button>
                </div>
              </form>
            )}

            {/* SKILL FORM */}
            {modalType === 'skill' && (
              <form onSubmit={handleSaveSkill} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Skill Name *</label>
                  <input type="text" name="name" defaultValue={editingItem?.name || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Icon Identifier</label>
                  <input type="text" name="icon" defaultValue={editingItem?.icon || "Code"} placeholder="Code, Zap, Server..." className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Display Order</label>
                  <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} min="1" step="1" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_active" defaultChecked={editingItem?.is_active ?? true} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Active Status</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#857E7B]/15 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border border-[#857E7B]/30 rounded-xl text-[#857E7B] hover:text-[#17251D] hover:bg-stone-100 transition cursor-pointer text-xs">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#214E34] text-white rounded-xl font-semibold hover:bg-[#17251D] transition cursor-pointer text-xs shadow-xs">Save Skill</button>
                </div>
              </form>
            )}

            {/* ACHIEVEMENT FORM */}
            {modalType === "achievement" && (
              <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingItem?.title || ""}
                    required
                    placeholder="e.g. First Place - Web Design Competition"
                    className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                      Awarding Organisation *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      defaultValue={editingItem?.organization || ""}
                      required
                      placeholder="University / Organisation"
                      className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                      Year / Date
                    </label>
                    <input
                      type="text"
                      name="year"
                      defaultValue={editingItem?.year || ""}
                      placeholder="e.g. 2026"
                      className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingItem?.description || ""}
                    placeholder="Describe this achievement..."
                    className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                    Certificate / Achievement Image
                  </label>
                  <input
                    type="text"
                    id="achievement_image_input"
                    name="image"
                    defaultValue={editingItem?.image || ""}
                    placeholder="Upload an image or paste an image URL"
                    className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs mb-2"
                  />

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#214E34] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#17251D] transition">
                    <Upload className="w-4 h-4" /> Upload Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => {
                        const imageInput = document.getElementById("achievement_image_input");
                        if (imageInput) imageInput.value = url;
                      })}
                    />
                  </label>
                  <p className="text-[10px] text-[#857E7B] mt-2">
                    Optional. JPG, PNG, WEBP or GIF. Maximum 5 MB.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                     
                      defaultValue={editingItem?.display_order || 1}
                      className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                      <input
                        type="checkbox"
                        name="is_published"
                        defaultChecked={editingItem?.is_published ?? true}
                        className="w-4 h-4 rounded accent-[#214E34] cursor-pointer"
                      />
                      <span>Publish Achievement</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#857E7B]/15 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setModalType(null); setEditingItem(null); }}
                    className="px-4 py-2 border border-[#857E7B]/30 rounded-xl text-[#857E7B] hover:text-[#17251D] hover:bg-stone-100 transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#214E34] text-white rounded-xl font-semibold hover:bg-[#17251D] transition cursor-pointer text-xs shadow-xs"
                  >
                    Save Achievement
                  </button>
                </div>
              </form>
            )}

            {/* GALLERY FORM */}
            {modalType === 'gallery' && (
              <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Title *</label>
                  <input type="text" name="title" defaultValue={editingItem?.title || ""} required className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Category *</label>
                    <select name="category" defaultValue={editingItem?.category || "Development"} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-white text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs cursor-pointer">
                      <option value="Photography">Photography</option>
                      <option value="Travel">Travel</option>
                      <option value="Events">Events</option>
                      <option value="Development">Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Display Order</label>
                    <input type="number" name="display_order" defaultValue={editingItem?.display_order || 1} min="1" step="1" className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                  </div>
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Image URL *</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" id="gallery_image_input" name="image" defaultValue={editingItem?.image || ""} required onChange={(e) => { const preview = document.getElementById("gallery_cover_preview"); if (preview) { preview.src = e.target.value; preview.classList.toggle("hidden", !e.target.value); } }} className="min-w-0 flex-1 p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                    <label className="px-3 py-2.5 bg-[#214E34] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#17251D] transition flex items-center justify-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" /> Upload Cover
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => uploadImageFile(e.target.files?.[0], (url) => { const input = document.getElementById("gallery_image_input"); const preview = document.getElementById("gallery_cover_preview"); if (input) input.value = url; if (preview) { preview.src = url; preview.classList.remove("hidden"); } })} />
                    </label>
                  </div>
                  <img id="gallery_cover_preview" src={editingItem?.image || ""} alt="Gallery cover preview" className={`mt-2 h-24 w-40 rounded-lg border border-[#857E7B]/20 object-cover ${editingItem?.image ? "" : "hidden"}`} />
                </div>

                <AdditionalImageManager
                  images={galleryImages}
                  onChange={setGalleryImages}
                  onUpload={uploadImageFile}
                  label="Gallery Additional Images"
                />

                <div>
                  <label className="font-semibold uppercase tracking-wider text-[#857E7B] block mb-1 text-[11px]">Description</label>
                  <textarea name="description" rows={2} defaultValue={editingItem?.description || ""} className="w-full p-2.5 border border-[#857E7B]/30 rounded-xl bg-[#F7F7F2] text-[#17251D] focus:border-[#214E34] focus:ring-1 focus:ring-[#214E34] outline-none text-xs" />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-xs text-[#17251D]">
                    <input type="checkbox" name="is_published" defaultChecked={editingItem?.is_published ?? true} className="w-4 h-4 rounded accent-[#214E34] cursor-pointer" />
                    <span>Published</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#857E7B]/15 flex justify-end gap-2.5">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 border border-[#857E7B]/30 rounded-xl text-[#857E7B] hover:text-[#17251D] hover:bg-stone-100 transition cursor-pointer text-xs">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#214E34] text-white rounded-xl font-semibold hover:bg-[#17251D] transition cursor-pointer text-xs shadow-xs">Save Image</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
