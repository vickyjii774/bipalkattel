
import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Tiktok,
} from "../components/Icons";

import { apiFetch } from "../utils/api";

export default function Contact() {
  const [settings, setSettings] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiFetch("/settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMsg("");
    setErrorMsg("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMsg(
        "Please fill out all required fields (Name, Email, and Message)."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      setSuccessMsg(
        res.message ||
          "Thank you! Your message has been sent successfully."
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setErrorMsg(
        err.message || "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: settings?.github,
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: settings?.linkedin,
      icon: Linkedin,
    },
    {
      name: "Instagram",
      url: settings?.instagram,
      icon: Instagram,
    },
    {
      name: "Facebook",
      url: settings?.facebook,
      icon: Facebook,
    },
    {
      name: "YouTube",
      url: settings?.youtube,
      icon: Youtube,
    },
    {
      name: "TikTok",
      url: settings?.tiktok,
      icon: Tiktok,
    },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6] text-zinc-900 pb-24">

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-2 pb-10 text-center">

        <div className="max-w-2xl mx-auto">

          

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950">
            Let's{" "}
            <span className="text-zinc-500">Connect</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-600 mt-3 leading-relaxed">
            Whether you need architectural design, interior design, 3D modeling, or any other design-related application, or have a project inquiry, send a message below.
          </p>

        </div>
      </section>


      {/* CONTACT FORM */}
      
<section className="w-full flex justify-center px-5 sm:px-7">

  <div className="w-full max-w-2xl">

    <form
      onSubmit={handleSubmit}
      className="
        bg-white
        border border-zinc-200
        rounded-xl
        p-4 sm:p-5
        shadow-sm
        space-y-4
      "
    >

      {/* FORM TITLE */}
      <div className="pb-2.5 border-b border-zinc-100">
        <h2 className="text-sm sm:text-base font-semibold tracking-tight text-zinc-950 text-center">
          Send A Message
        </h2>

       
      </div>


      {/* SUCCESS */}
      {successMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}


      {/* ERROR */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-medium flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}


      {/* NAME + EMAIL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        <div className="space-y-1">
          <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-600 font-medium">
            Name *
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Aarav Sharma"
            required
            className="
              w-full
              px-3 py-2
              rounded-lg
              border border-zinc-200
              bg-zinc-50/50
              text-xs
              text-zinc-900
              placeholder:text-zinc-400
              outline-none
              focus:border-zinc-900
              focus:bg-white
              transition
            "
          />
        </div>


        <div className="space-y-1">
          <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-600 font-medium">
            Email *
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. aarav@example.com"
            required
            className="
              w-full
              px-3 py-2
              rounded-lg
              border border-zinc-200
              bg-zinc-50/50
              text-xs
              text-zinc-900
              placeholder:text-zinc-400
              outline-none
              focus:border-zinc-900
              focus:bg-white
              transition
            "
          />
        </div>

      </div>


      {/* SUBJECT */}
      <div className="space-y-1">

        <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-600 font-medium">
          Subject *
        </label>

        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required    
          placeholder="Project inquiry"
          className="
            w-full
            px-3 py-2
            rounded-lg
            border border-zinc-200
            bg-zinc-50/50
            text-xs
            text-zinc-900
            placeholder:text-zinc-400
            outline-none
            focus:border-zinc-900
            focus:bg-white
            transition
          "
        />

      </div>


      {/* MESSAGE */}
      <div className="space-y-1">

        <label className="text-[9px] sm:text-[10px] uppercase tracking-wider text-zinc-600 font-medium">
          Message *
        </label>

        <textarea
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe your project, idea, or inquiry..."
          required
          className="
            w-full
            px-3 py-2
            rounded-lg
            border border-zinc-200
            bg-zinc-50/50
            text-xs
            text-zinc-900
            placeholder:text-zinc-400
            outline-none
            focus:border-zinc-900
            focus:bg-white
            transition
            resize-none
          "
        />

      </div>


      {/* SUBMIT */}
      <div className="pt-0.5">

        <button
          type="submit"
          disabled={loading}
          className="
            w-full sm:w-auto
            px-5
            bg-zinc-950
            text-white
            text-[10px]
            uppercase
            hover:bg-zinc-800
            shadow-sm
            inline-flex
            items-center
            justify-center
            gap-1.5
            disabled:opacity-50
            disabled:cursor-not-allowed
            cursor-pointer
             font-mono font-bold text-sm tracking-wider py-3.5 rounded-xl transition-all duration-200

          "
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px '; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              
        >

          {loading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <Send className="w-3 h-3" />
            </>
          )}

        </button>

      </div>

    </form>



          {/* SOCIAL LINKS */}
          <div className="mt-8 text-center">

            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Or find me on
            </p>

            <div className="flex justify-center flex-wrap gap-2">

              {socialLinks.map((social) => {

                if (!social.url) return null;

                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="
                      p-2.5
                      rounded-lg
                      bg-white
                      border border-zinc-200
                      text-zinc-500
                      hover:bg-zinc-950
                      hover:text-white
                      hover:border-zinc-950
                      transition
                      duration-300
                      shadow-sm
                    "
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
