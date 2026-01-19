import React, { useState, useEffect, useRef } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { preloadClubImages } from "../utils/imagePreloader";

interface Club {
  id: number;
  name: string;
  description: string;
  location: string;
  price_per_day: number;
  rating: number;
  image_url: string | null;
}

const ClubsActivities = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPrice = searchParams.get("price")
    ? Number(searchParams.get("price"))
    : null;

  const clubsFromHome: Club[] | undefined = location.state?.clubs;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [key: number]: number }>({});
  const touchStartRef = useRef<{ [key: number]: number | null }>({});
  const touchEndRef = useRef<{ [key: number]: number | null }>({});

  /* ---------------------------------------------------------
      Load Clubs From Home → Fallback Fetch
  --------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Case 1 — clubs from home page
      if (clubsFromHome && clubsFromHome.length > 0) {
        const formatted = clubsFromHome.map((c: any) => ({
          ...c,
          name: c.name || c.title || "",
        }));

        const base = selectedPrice
          ? formatted.filter((club) => club.price_per_day === selectedPrice)
          : formatted;

        setClubs(base);
        setFilteredClubs(base);
        // Preload images immediately for zero load delay
        preloadClubImages(base);
        setLoading(false);
        return;
      }

      // Case 2 — fetch from backend
      try {
        const res = await api.get("/clubs", {
          params: selectedPrice ? { maxPrice: selectedPrice } : {},
        });

        const data: Club[] = res.data?.clubs || [];

        const formatted = data.map((c: any) => ({
          ...c,
          name: c.name || c.title || "",
        }));

        setClubs(formatted);
        setFilteredClubs(formatted);
        // Preload images immediately for zero load delay
        preloadClubImages(formatted);
      } catch (err) {
        console.error("BACKEND FETCH ERROR:", err);
        setClubs([]);
        setFilteredClubs([]);
      }

      setLoading(false);
    };

    loadData();
  }, [clubsFromHome, selectedPrice]);

  /* ---------------- SEARCH ---------------- */
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredClubs(clubs);
      return;
    }

    const lower = term.toLowerCase();

    const results = clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(lower) ||
        club.location.toLowerCase().includes(lower) ||
        club.description.toLowerCase().includes(lower)
    );

    setFilteredClubs(results);
  };

  /* ---------------- MULTIPLE IMAGES ---------------- */
  const generateClubImages = (club: Club) => {
    return club.image_url
      ? [club.image_url, club.image_url, club.image_url, club.image_url]
      : ["/card-img.png", "/card-img.png", "/card-img.png", "/card-img.png"];
  };

  const getCurrentImageIndex = (clubId: number) => {
    return currentImageIndices[clubId] || 0;
  };

  const setCurrentImageIndex = (clubId: number, index: number) => {
    setCurrentImageIndices((prev) => ({ ...prev, [clubId]: index }));
  };

  /* ---------------- SWIPE HANDLERS ---------------- */
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent, clubId: number) => {
    touchEndRef.current[clubId] = null;
    touchStartRef.current[clubId] = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent, clubId: number) => {
    touchEndRef.current[clubId] = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (clubId: number, images: string[]) => {
    const start = touchStartRef.current[clubId];
    const end = touchEndRef.current[clubId];
    
    if (!start || !end) return;
    
    const distance = start - end;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const currentIndex = getCurrentImageIndex(clubId);

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentImageIndex(clubId, currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentImageIndex(clubId, currentIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-20">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="px-6 py-4">

          {/* Back + Title */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/welcome")}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Fitness Clubs
            </h1>

            <div className="w-6" />
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <img
              src="/search-Icon.png"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 opacity-60"
            />
            <input
              type="text"
              placeholder="Search for clubs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3
                bg-gray-100 focus:bg-white
                rounded-xl border border-gray-300
                focus:ring-2 focus:ring-blue-500/30
                outline-none transition
              "
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mt-5 text-gray-700 font-medium">
            <img src="/location.png" className="w-4 h-4 opacity-70" />
            <span>Pune City</span>
          </div>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="px-6 py-4">

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {selectedPrice ? `Clubs Rs.${selectedPrice}/Day` : "All Clubs"}
          </h2>

          <span className="text-sm text-gray-600">
            {filteredClubs.length} clubs
          </span>
        </div>

        {/* ================= LOADING ================= */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
          </div>
        ) : filteredClubs.length === 0 ? (
          <p className="text-center text-gray-600 mt-10">No clubs found.</p>
        ) : (
          /* ================= GRID: 3 CARDS PER ROW ================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {filteredClubs.map((club) => {
              const clubImages = generateClubImages(club);
              const currentIndex = getCurrentImageIndex(club.id);
              
              return (
              <div
                key={club.id}
                className="
                  bg-white rounded-2xl shadow-md border border-gray-100 
                  overflow-hidden hover:shadow-lg transition-all duration-300
                  flex flex-col
                "
              >
                {/* IMAGE */}
                <div 
                  className="h-40 sm:h-48 overflow-hidden relative"
                  onTouchStart={(e) => onTouchStart(e, club.id)}
                  onTouchMove={(e) => onTouchMove(e, club.id)}
                  onTouchEnd={() => onTouchEnd(club.id, clubImages)}
                >
                  <img
                    src={clubImages[currentIndex] || club.image_url || "/card-img.png"}
                    alt={club.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300 select-none"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/card-img.png";
                    }}
                  />
                  
                  {/* Carousel Dots - Pink/Gray pagination indicators */}
                  {clubImages.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
                      {clubImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(club.id, index);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            index === currentIndex 
                              ? "bg-pink-500" 
                              : "bg-transparent border-[1px] border-gray-300"
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {club.name}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                      {club.location}
                    </p>

                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {club.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-blue-600 font-bold text-lg">
                      ₹{club.price_per_day}/day
                    </span>
                    <span className="text-yellow-500 font-semibold text-sm">
                      ⭐ {club.rating}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/clubs/${club.id}`, { state: { club } })
                    }
                    className="
                      mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm
                      hover:bg-blue-700 transition shadow-sm w-full
                    "
                  >
                    View Details
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsActivities;
