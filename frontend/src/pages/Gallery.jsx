import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    apiFetch("/gallery")
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", "Development", "Photography", "Travel", "Events", "Other"];

  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  }, [lightboxIndex, filteredItems.length]);

  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, prevImage, nextImage]);

  if (loading) {
    return (
      <main className="bg-[#faf9f6] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-zinc-950" />
      </main>
    );
  }

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <main className="bg-[#faf9f6] text-zinc-900 min-h-screen pb-24">
      
      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-0 pb-8 text-center">
        
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
          Photo & Design Gallery
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 font-normal mt-2 max-w-auto leading-relaxed">
          Architectural photography, 3D renderings, design studies, and studio photos.
        </p>

        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-1.5 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-200 ${
                selectedCategory === cat
                  ? "bg-zinc-950 text-white shadow-sm font-semibold"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* MASONRY GRID */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openLightbox(index)}
              className="group relative rounded-xl overflow-hidden bg-zinc-100 cursor-pointer aspect-[4/3] shadow-sm hover:shadow-md transition-all duration-500 border border-zinc-200"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end">
                  <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-semibold tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white inline-block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  {item.description && (
                    <p className="text-[11px] text-zinc-300 mt-0.5 line-clamp-2 font-normal">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300 select-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-zinc-300">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-zinc-800 px-2.5 py-0.5 rounded-full text-white">
                {currentItem.category}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image Container */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            />

            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition focus:outline-none"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition focus:outline-none"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Title & Description */}
          <div className="text-center text-white max-w-xl mx-auto space-y-0.5 z-10 pb-1">
            <h3 className="text-lg font-medium">{currentItem.title}</h3>
            {currentItem.description && (
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">{currentItem.description}</p>
            )}
          </div>

        </div>
      )}

    </main>
  );
}