
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

  const categories = [
    "All",
    "Development",
    "Photography",
    "Travel",
    "Events",
    "Other"
  ];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  // Combine cover image and additional images.
  const galleryImages = filteredItems.flatMap((item) => {
    const images = [
      item.image,
      ...(Array.isArray(item.images) ? item.images : [])
    ].filter(Boolean);

    // Remove duplicate image URLs.
    return [...new Set(images)].map((image, imageIndex) => ({
      ...item,
      image,
      imageIndex
    }));
  });

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = useCallback(() => {
    if (lightboxIndex === null || galleryImages.length === 0) return;

    setLightboxIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }, [lightboxIndex, galleryImages.length]);

  const nextImage = useCallback(() => {
    if (lightboxIndex === null || galleryImages.length === 0) return;

    setLightboxIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  }, [lightboxIndex, galleryImages.length]);

  // Keyboard navigation.
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
      <main className="bg-[#F7F7F2] min-h-screen py-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#214E34]" />
      </main>
    );
  }

  const currentItem =
    lightboxIndex !== null ? galleryImages[lightboxIndex] : null;

  return (
    <main className="bg-[#F7F7F2] text-[#17251D] min-h-screen pb-24">

      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-12 pb-8 text-center">

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">
          Photo & Design Gallery
        </h1>

        <p className="text-xs sm:text-sm text-[#857E7B] font-normal mt-2 leading-relaxed">
          Architectural photography, 3D renderings, design studies, and studio photos.
        </p>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-1.5 pt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setLightboxIndex(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#214E34] text-white shadow-sm font-semibold"
                  : "bg-white border border-[#857E7B]/30 text-[#17251D] hover:bg-[#DCE8DF]/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9">

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">

            {galleryImages.map((item, index) => (
              <div
                key={`${item.id}-${item.imageIndex}-${index}`}
                onClick={() => openLightbox(index)}
                className="group relative rounded-xl overflow-hidden bg-[#DCE8DF]/30 cursor-pointer aspect-[4/3] shadow-sm hover:shadow-md transition-all duration-300 border border-[#857E7B]/20"
              >

                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />

                {/* ALWAYS VISIBLE TITLE */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17251D]/95 via-[#17251D]/60 to-transparent p-4 pt-12 text-white">

                  <div className="flex items-end justify-between gap-2">

                    <div className="min-w-0">

                      <span className="text-[9px] uppercase font-semibold tracking-wider bg-[#214E34]/90 text-[#DCE8DF] px-2 py-1 rounded inline-block mb-1">
                        {item.category}
                      </span>

                      <h3 className="text-sm font-semibold">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-[11px] text-[#DCE8DF]/80 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                    </div>

                    <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shrink-0">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>

                  </div>
                </div>

              </div>
            ))}

          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-sm text-[#857E7B]">
              No images available in this category.
            </p>
          </div>
        )}

      </section>

      {/* FULLSCREEN LIGHTBOX */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-[#17251D]/95 backdrop-blur-sm flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300 select-none">

          {/* TOP BAR */}
          <div className="flex items-center justify-between text-white z-10">

            <div className="flex items-center gap-2">

              <span className="text-[11px] font-mono font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-[#DCE8DF]">
                {lightboxIndex + 1} / {galleryImages.length}
              </span>

              <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#214E34] px-2.5 py-0.5 rounded-full text-white">
                {currentItem.category}
              </span>

            </div>

            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 p-2 rounded-full text-red-500 ring-2 ring-red-500 hover:bg-red-600 hover:text-white hover:ring-red-600 transition duration-200 focus:outline-none z-10 cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

          {/* MAIN IMAGE */}
          <div className="relative flex-1 flex items-center justify-center my-3 overflow-hidden">

            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="max-h-[75vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-[#214E34]/40"
            />

            {/* PREVIOUS */}
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 p-2.5 rounded-full bg-[#214E34]/70 hover:bg-[#214E34] text-white backdrop-blur-md transition focus:outline-none cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* NEXT */}
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 p-2.5 rounded-full bg-[#214E34]/70 hover:bg-[#214E34] text-white backdrop-blur-md transition focus:outline-none cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* BOTTOM TITLE & DESCRIPTION */}
          <div className="text-center text-white max-w-xl mx-auto space-y-0.5 z-10 pb-1">

            <h3 className="text-lg font-medium text-[#F7F7F2]">
              {currentItem.title}
            </h3>

            {currentItem.description && (
              <p className="text-xs text-[#857E7B] leading-relaxed font-normal">
                {currentItem.description}
              </p>
            )}

          </div>

        </div>
      )}

    </main>
  );
}
