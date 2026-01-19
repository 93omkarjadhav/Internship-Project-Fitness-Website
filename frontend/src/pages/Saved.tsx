import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHome, AiOutlineBook, AiOutlineHeart, AiOutlineUser } from "react-icons/ai";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Club {
  id: number;
  name: string;
  title?: string;
  description: string;
  image_url: string | null;
  price_per_day: number;
  location?: string;
  rating?: number;
  facilities?: string[] | string;
}

const Saved = () => {
  const navigate = useNavigate();
  const [favoriteClubs, setFavoriteClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
    
    // Listen for storage changes (when favorites are updated from other tabs/pages)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "favoriteClubs") {
        loadFavorites();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event for same-tab updates
    const handleCustomStorageChange = () => {
      loadFavorites();
    };
    
    window.addEventListener("favoritesUpdated", handleCustomStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favoritesUpdated", handleCustomStorageChange);
    };
  }, []);

  const loadFavorites = () => {
    try {
      const saved = localStorage.getItem("favoriteClubs");
      if (saved) {
        const clubs = JSON.parse(saved);
        setFavoriteClubs(clubs);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (clubId: number) => {
    try {
      const updated = favoriteClubs.filter((c) => c.id !== clubId);
      setFavoriteClubs(updated);
      localStorage.setItem("favoriteClubs", JSON.stringify(updated));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("favoritesUpdated"));
      toast.success("Removed from favorites");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const handleClubClick = (club: Club) => {
    navigate(`/clubs/${club.id}`, { state: { club } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <h1 className="text-[40px] font-bold px-4 mt-6 text-center">Saved</h1>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : favoriteClubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Saved Clubs</h2>
            <p className="text-gray-500 mb-6">
              Clubs you favorite will appear here. Start exploring clubs and add them to your favorites!
            </p>
            <button
              onClick={() => navigate("/welcome")}
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Browse Clubs
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 mt-8">
          {favoriteClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col border border-gray-100"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={club.image_url || "/card-img.png"}
                  alt={club.name || club.title}
                  className="w-full h-44 object-cover cursor-pointer"
                  onClick={() => handleClubClick(club)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/card-img.png";
                  }}
                />
                {/* Remove Favorite Button */}
                <button
                  onClick={() => handleRemoveFavorite(club.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition"
                  title="Remove from favorites"
                >
                  <Heart className="w-5 h-5 fill-[#2563EB] text-[#2563EB]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1">
                <h3
                  className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
                  onClick={() => handleClubClick(club)}
                >
                  {club.name || club.title}
                </h3>
                {club.location && (
                  <p className="text-sm text-gray-500 mt-1">{club.location}</p>
                )}
                <p className="text-sm text-[#4880FF] font-medium mt-2">
                  ₹{club.price_per_day}/Day
                </p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">
                  {club.description}
                </p>
                {club.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm text-gray-600">{club.rating}</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleClubClick(club)}
                  className="w-full bg-[#2563EB] text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navbar */}
      <div className="flex justify-between items-center fixed bottom-0 w-full bg-white py-3 shadow-md px-8 border-t">
        {/* Home */}
        <button
          onClick={() => navigate("/welcome")}
          className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition"
        >
          <AiFillHome size={22} />
          <span className="text-xs mt-1">Home</span>
        </button>

        {/* My Booking */}
        <button
          onClick={() => navigate("/bookings")}
          className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition"
        >
          <AiOutlineBook size={22} />
          <span className="text-xs mt-1">My Booking</span>
        </button>

        {/* Saved (Active) */}
        <button className="flex flex-col items-center text-[#4880FF] border-b-2 border-[#4880FF] pb-1">
          <AiOutlineHeart size={22} />
          <span className="text-xs mt-1">Saved</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/wellness/settings")}
          className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition"
        >
          <AiOutlineUser size={22} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Saved;
