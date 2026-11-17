
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

    return [
      ...new Set(
        photos.filter(
          (photo) =>
            typeof photo === "string" && photo.trim() !== ""
        )
      ),
    ];
  };

  // Fetch gallery events.
  useEffect(() => {
    apiFetch("/gallery")
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Failed to load gallery:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter events by category.
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter(
          (item) => item.category === selectedCategory
        );

  // Open an individual event.
  const openEvent = (event) => {
    setSelectedEvent(event);
    setCurrentPhotoIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close event viewer and return to event cards.
  const closeEvent = useCallback(() => {
    setSelectedEvent(null);
    setCurrentPhotoIndex(0);
  }, []);

  // Get photos only from the selected event.
  const currentPhotos = selectedEvent
    ? getEventPhotos(selectedEvent)
    : [];

  // Previous photo - loops within the selected event.
  const previousPhoto = useCallback(() => {
    if (!selectedEvent || currentPhotos.length <= 1) return;

    setCurrentPhotoIndex((previous) =>
      previous === 0
        ? currentPhotos.length - 1
        : previous - 1
    );
  }, [selectedEvent, currentPhotos.length]);

  // Next photo - loops within the selected event.
  const nextPhoto = useCallback(() => {
    if (!selectedEvent || currentPhotos.length <= 1) return;

    setCurrentPhotoIndex((previous) =>
      previous === currentPhotos.length - 1
        ? 0
        : previous + 1
    );
  }, [selectedEvent, currentPhotos.length]);

  // Keyboard navigation.
  useEffect(() => {
    if (!selectedEvent) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeEvent();
      if (event.key === "ArrowLeft") previousPhoto();
      if (event.key === "ArrowRight") nextPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent, closeEvent, previousPhoto, nextPhoto]);

  // Loading screen.
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

      {/* ==========================================
          GALLERY HEADER
      ========================================== */}

      <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-16 pb-10 text-center">

        <p className="text-xs uppercase tracking-[0.2em] text-[#214E34] font-semibold mb-3">
          Moments & Memories
        </p>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#17251D]">
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

      {/* ==========================================
          EVENT COLLECTIONS
          Hidden when an event is opened.
      ========================================== */}

      {!selectedEvent && (
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

                    {/* EVENT COVER IMAGE */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-[#DCE8DF]">

                      <img
                        src={coverImage}
                        alt={event.title || "Gallery event"}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#17251D]/70 via-transparent to-transparent" />

                      {/* PHOTO COUNT */}

                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#17251D]/75 text-white backdrop-blur-md px-3 py-1.5 rounded-full">
                        <Images className="w-3.5 h-3.5" />

                        <span className="text-[11px] font-medium">
                          {photos.length} Photos
                        </span>
                      </div>

                      {/* CATEGORY */}

                      <div className="absolute bottom-4 left-4 text-white">
                        <span className="text-[9px] uppercase tracking-wider bg-[#214E34] px-2 py-1 rounded">
                          {event.category || "Gallery"}
                        </span>
                      </div>

                      <div className="absolute bottom-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md text-white">
                        <Maximize2 className="w-4 h-4" />
                      </div>

                    </div>

                    {/* EVENT DETAILS */}

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
      )}

      {/* ==========================================
          SELECTED EVENT PHOTO VIEWER
          Original website background.
          Centred image card.
      ========================================== */}

      {selectedEvent && activePhoto && (
        <section className="max-w-5xl mx-auto px-5 sm:px-7 lg:px-9 pt-8 sm:pt-10 pb-16">

          {/* EVENT TITLE AND DESCRIPTION */}

          <div className="flex items-start justify-between gap-4 mb-8">

            <div className="min-w-0">

              <p className="text-xs uppercase tracking-[0.18em] text-[#214E34] font-semibold mb-2">
                Gallery / {selectedEvent.category || "Event"}
              </p>

              <h2 className="text-2xl sm:text-3xl font-semibold text-[#17251D]">
                {selectedEvent.title || "Gallery Event"}
              </h2>

              {selectedEvent.description && (
                <p className="text-sm text-[#857E7B] mt-2 max-w-2xl leading-relaxed">
                  {selectedEvent.description}
                </p>
              )}

            </div>

            {/* CLOSE BUTTON */}

            <button
              onClick={closeEvent}
              aria-label="Close event gallery"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#857E7B]/30 bg-white text-[#17251D] hover:bg-[#214E34] hover:text-white hover:border-[#214E34] transition-all duration-200"
            >
              <X className="w-4 h-4" />

              <span className="text-xs font-semibold">
                Close
              </span>
            </button>

          </div>

          {/* CENTRED IMAGE CARD */}

          <div className="max-w-4xl mx-auto">

            <div className="relative bg-white rounded-2xl overflow-hidden border border-[#857E7B]/20 shadow-lg">

              {/* MAIN IMAGE */}

              <div className="w-full h-[55vh] sm:h-[65vh] min-h-[280px] flex items-center justify-center p-2 sm:p-4">

                <img
                  key={activePhoto}
                  src={activePhoto}
                  alt={`${selectedEvent.title || "Event"} photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                  draggable="false"
                />

              </div>

              {/* PREVIOUS PHOTO */}

              {currentPhotos.length > 1 && (
                <button
                  onClick={previousPhoto}
                  aria-label="Previous photo"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 border border-[#857E7B]/20 text-[#214E34] shadow-md hover:bg-[#214E34] hover:text-white transition-all duration-200"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* NEXT PHOTO */}

              {currentPhotos.length > 1 && (
                <button
                  onClick={nextPhoto}
                  aria-label="Next photo"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 border border-[#857E7B]/20 text-[#214E34] shadow-md hover:bg-[#214E34] hover:text-white transition-all duration-200"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

            </div>

            {/* PHOTO COUNTER */}

            <div className="flex items-center justify-center mt-5">

              <span className="text-xs font-semibold text-[#214E34] bg-white border border-[#857E7B]/20 px-4 py-2 rounded-full">
                Photo {currentPhotoIndex + 1} of {currentPhotos.length}
              </span>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}
