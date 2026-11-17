
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Images,
} from "lucide-react";
import { apiFetch } from "../utils/api";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const categories = [
    "All",
    "Development",
    "Photography",
    "Travel",
    "Events",
    "Other",
  ];

  // Get all photos belonging to one event.
  const getEventPhotos = (event) => {
    const photos = [
      event.image,
      ...(Array.isArray(event.images) ? event.images : []),
    ];

    return [...new Set(
      photos.filter(
        (photo) => typeof photo === "string" && photo.trim() !== ""
      )
    )];
  };

  useEffect(() => {
    apiFetch("/gallery")
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load gallery:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter(
          (item) => item.category === selectedCategory
        );

  const openEvent = (event) => {
    setSelectedEvent(event);
    setCurrentPhotoIndex(0);
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    setCurrentPhotoIndex(0);
  };

  const currentPhotos = selectedEvent
    ? getEventPhotos(selectedEvent)
    : [];

  const previousPhoto = useCallback(() => {
    if (!selectedEvent || currentPhotos.length === 0) return;

    setCurrentPhotoIndex((previous) =>
      previous === 0
        ? currentPhotos.length - 1
        : previous - 1
    );
  }, [selectedEvent, currentPhotos.length]);

  const nextPhoto = useCallback(() => {
    if (!selectedEvent || currentPhotos.length === 0) return;

    setCurrentPhotoIndex((previous) =>
      previous === currentPhotos.length - 1
        ? 0
        : previous + 1
    );
  }, [selectedEvent, currentPhotos.length]);

  // Keyboard controls and prevent background scrolling.
  useEffect(() => {
    if (!selectedEvent) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeEvent();
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent, previousPhoto, nextPhoto]);

  if (loading) {
    return (
      <main className="bg-[#F7F7F2] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#214E34]" />
      </main>
    );
  }

  const activePhoto = currentPhotos[currentPhotoIndex];

  return (
    <main className="bg-[#F7F7F2] text-[#17251D] min-h-screen pb-24">

      {/* HEADER */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-16 pb-10 text-center">

       

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Photo & Design Gallery
        </h1>

        <p className="text-sm text-[#857E7B] mt-3 leading-relaxed max-w-xl mx-auto">
          Explore collections of photography, events, projects,
          travels, and memorable moments.
        </p>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap justify-center gap-2 pt-7">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-medium rounded-full transition duration-200 ${
                selectedCategory === category
                  ? "bg-[#214E34] text-white shadow-sm"
                  : "bg-white border border-[#857E7B]/25 text-[#17251D] hover:bg-[#DCE8DF]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* EVENT COLLECTIONS */}
      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9">

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredItems.map((event) => {
              const photos = getEventPhotos(event);
              const coverImage = photos[0];

              if (!coverImage) return null;

              return (
                <button
                  key={event._id || event.id || event.title}
                  onClick={() => openEvent(event)}
                  className="group text-left rounded-2xl overflow-hidden bg-white border border-[#857E7B]/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >

                  {/* EVENT COVER */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#DCE8DF]">

                    <img
                      src={coverImage}
                      alt={event.title || "Gallery event"}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#17251D]/70 via-transparent to-transparent" />

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#17251D]/75 text-white backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Images className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium">
                        {photos.length} Photos
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-[9px] uppercase tracking-wider bg-[#214E34] px-2 py-1 rounded">
                        {event.category || "Gallery"}
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  {/* EVENT INFORMATION */}
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-[#17251D]">
                      {event.title || "Untitled Event"}
                    </h3>

                    {event.description && (
                      <p className="text-xs text-[#857E7B] mt-1.5 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#857E7B]/15">
                      <span className="text-xs text-[#214E34] font-medium">
                        View event photos
                      </span>

                      <ChevronRight className="w-4 h-4 text-[#214E34] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                </button>
              );
            })}

          </div>
        ) : (
          <div className="py-24 text-center">
            <Images className="w-10 h-10 text-[#857E7B]/50 mx-auto mb-3" />

            <p className="text-sm text-[#857E7B]">
              No events available in this category.
            </p>
          </div>
        )}
      </section>

      {/* EVENT PHOTO VIEWER */}
      {selectedEvent && activePhoto && (
        <div className="fixed inset-0 z-50 bg-[#101914]/[0.97] backdrop-blur-md flex flex-col select-none">

          {/* TOP BAR */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 text-white border-b border-white/10">

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold truncate">
                {selectedEvent.title || "Gallery Event"}
              </h2>

              <p className="text-[11px] text-white/50 mt-1">
                {selectedEvent.category || "Gallery"}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">

              <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-full">
                {currentPhotoIndex + 1} / {currentPhotos.length}
              </span>

              <button
                onClick={closeEvent}
                aria-label="Close gallery"
                className="p-2.5 rounded-full text-white hover:bg-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

            </div>
          </div>

          {/* MAIN PHOTO */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-16 py-4">

            <img
              key={activePhoto}
              src={activePhoto}
              alt={`${selectedEvent.title || "Event"} photo ${currentPhotoIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              draggable="false"
            />

            {/* PREVIOUS */}
            {currentPhotos.length > 1 && (
              <button
                onClick={previousPhoto}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-[#214E34] text-white backdrop-blur-md transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* NEXT */}
            {currentPhotos.length > 1 && (
              <button
                onClick={nextPhoto}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-[#214E34] text-white backdrop-blur-md transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* BOTTOM INFORMATION */}
          <div className="px-4 sm:px-8 py-4 text-center border-t border-white/10">

            <h3 className="text-sm font-medium text-white">
              {selectedEvent.title}
            </h3>

            {selectedEvent.description && (
              <p className="text-xs text-white/50 mt-1 max-w-xl mx-auto">
                {selectedEvent.description}
              </p>
            )}

            {/* PHOTO PROGRESS */}
            <div className="flex justify-center gap-1 mt-4">
              {currentPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  aria-label={`Go to photo ${index + 1}`}
                  className={`h-1 rounded-full transition-all ${
                    index === currentPhotoIndex
                      ? "w-7 bg-white"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>

            <p className="text-[10px] text-white/40 mt-3">
              Use ← → arrow keys to navigate · ESC to close
            </p>

          </div>
        </div>
      )}

    </main>
  );
}
