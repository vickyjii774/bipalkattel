import React, { useState, useEffect } from "react";
import { Mail, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Github, Linkedin, Instagram } from "../components/Icons";
import { apiFetch } from "../utils/api";

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiFetch("/settings").then(setSettings).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill out all required fields (Name, Email, and Message).");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      setSuccessMsg(res.message || "Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setErrorMsg(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#F7F7F2] text-[#17251D] min-h-screen pb-24">
      
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-12 pb-8 text-align-center sm:text-center  ">
        
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">
          Let's Connect & Collaborate
        </h1>
        <p className="text-xs sm:text-sm text-[#857E7B] font-normal mt-2  leading-relaxed">
          Whether you need architectural design, a custom application, or have a project inquiry, send a message below.
        </p>
      </section>

      {/* FORM & INFO SECTION */}
      <section className="max-w-3xl mx-auto px-5 sm:px-7 lg:px-9">
  <div className="w-full flex flex-col items-center">

    {/* Contact Form */}
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-white border border-[#857E7B]/20 rounded-xl p-5 sm:p-7 space-y-4 shadow-sm"
      >
        <h2 className="text-lg text-center font-semibold tracking-tight text-[#17251D] border-b border-[#857E7B]/15 pb-3">
          Send A Message
        </h2>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-lg bg-[#DCE8DF] border border-[#214E34]/30 text-[#214E34] text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#214E34] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
       {errorMsg && (
  <div className="group p-3 rounded-lg bg-red-50 border border-red-300 text-red-500 text-xs font-medium flex items-center gap-2 hover:bg-red-100 hover:border-red-400 hover:shadow-sm hover:scale-[1.02] transition-all duration-200">
    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 animate-pulse group-hover:scale-110 transition-transform duration-200" />
    <span>{errorMsg}</span>
  </div>
)}

        {/* Name & Email */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#857E7B] font-medium block">
              Your Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Aarav Sharma"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-[#857E7B] font-medium block">
              Your Email *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. aarav@example.com"
              required
              className="w-full px-3 py-2 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-[#857E7B] font-medium block">
            Subject
          </label>

          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g. Architectural Design or Web Development"
            className="w-full px-3 py-2 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] focus:bg-white transition"
          />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-wider text-[#857E7B] font-medium block">
            Message *
          </label>

          <textarea
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your project, idea, or inquiry..."
            required
            className="w-full px-3 py-2 rounded-lg border border-[#857E7B]/30 bg-[#F7F7F2]/50 text-xs sm:text-sm text-[#17251D] focus:outline-none focus:border-[#214E34] focus:bg-white transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full  px-6 py-2.5 bg-[#214E34] text-white text-xs uppercase tracking-wider font-semibold rounded-lg hover:bg-[#17251D] transition duration-300 shadow-sm inline-flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Social Links */}
      <div className="flex flex-col items-center justify-center pt-6 space-y-3">
        <span className="text-[10px] text-[#857E7B] font-semibold uppercase tracking-wider">
          or connect with me on social media
        </span>

        <div className="flex justify-center items-center gap-2">
          {settings?.github && (
            <a
              href={settings.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#F7F7F2] text-[#214E34] hover:bg-[#214E34] hover:text-white transition shadow-sm cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}

          {settings?.linkedin && (
            <a
              href={settings.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#F7F7F2] text-[#214E34] hover:bg-[#214E34] hover:text-white transition shadow-sm cursor-pointer"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
          )}

          {settings?.instagram && (
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-[#F7F7F2] text-[#214E34] hover:bg-[#214E34] hover:text-white transition shadow-sm cursor-pointer"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>

  </div>
</section>

    </main>
  );
}