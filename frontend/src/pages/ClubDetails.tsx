import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Heart, Share2, ChevronLeft, Star, MapPin, Clock, Phone } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { preloadImage } from "../utils/imagePreloader";

interface Club {
  id: number;
  name: string;
  title?: string;
  description: string;
  location: string;
  price_per_day: number;
  rating: number;
  image_url: string | null;
  facilities?: string[] | string;
  opening_hours?: string;
  contact_number?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const ClubDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [club, setClub] = useState<Club | null>(location.state?.club || null);
  const [loading, setLoading] = useState(!club);
  const [activeTab, setActiveTab] = useState<"services" | "details" | "reviews">("services");
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartItems, setCartItems] = useState<Service[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Debug: Log club data when it changes
  useEffect(() => {
    if (club) {
      console.log("Club data:", club);
      console.log("Club image_url:", club.image_url);
    }
  }, [club]);

  // Generate services from facilities
  const generateServices = (facilities: string[] | string | undefined): Service[] => {
    if (!facilities) return [];

    const facilitiesList = Array.isArray(facilities)
      ? facilities
      : typeof facilities === 'string'
        ? JSON.parse(facilities || '[]')
        : [];

    const serviceMap: { [key: string]: { name: string; description: string; basePrice: number } } = {
      "Gym": { name: "Gym Access", description: "Full access to gym equipment and facilities", basePrice: 0 },
      "Cardio": { name: "Cardio Zone", description: "Access to cardio equipment including treadmills, bikes, and ellipticals", basePrice: 50 },
      "Weights": { name: "Weight Training", description: "Access to free weights and weight machines", basePrice: 60 },
      "Pool": { name: "Swimming Pool", description: "Access to swimming pool facilities", basePrice: 100 },
      "Sauna": { name: "Sauna & Steam", description: "Access to sauna and steam room facilities", basePrice: 80 },
      "Yoga": { name: "Yoga Classes", description: "Group yoga classes with certified instructors", basePrice: 120 },
      "Personal Training": { name: "Personal Training", description: "One-on-one training session with certified trainer", basePrice: 500 },
      "Spa": { name: "Spa Services", description: "Relaxing spa treatments and massages", basePrice: 800 },
      "Tennis": { name: "Tennis Court", description: "Access to tennis court facilities", basePrice: 200 },
      "Basketball": { name: "Basketball Court", description: "Access to basketball court", basePrice: 150 },
      "Cafe": { name: "Cafe Access", description: "Access to on-site cafe and refreshments", basePrice: 0 },
      "CrossFit": { name: "CrossFit Training", description: "High-intensity CrossFit classes", basePrice: 300 },
      "Meditation": { name: "Meditation Classes", description: "Guided meditation and mindfulness sessions", basePrice: 100 },
      "Pilates": { name: "Pilates Classes", description: "Pilates classes for strength and flexibility", basePrice: 150 },
      "Dance": { name: "Dance Classes", description: "Various dance fitness classes", basePrice: 120 },
    };

    return facilitiesList.map((facility: string, index: number) => {
      const serviceInfo = serviceMap[facility] || {
        name: facility,
        description: `Access to ${facility.toLowerCase()} facilities`,
        basePrice: 50
      };
      return {
        id: `service-${index}`,
        name: serviceInfo.name,
        description: serviceInfo.description,
        price: serviceInfo.basePrice || club?.price_per_day || 0
      };
    });
  };

  const [services, setServices] = useState<Service[]>([]);
  const [localReviews, setLocalReviews] = useState<Review[]>([
    {
      id: "1",
      name: "Sarah Thompson",
      rating: 5,
      comment: "I had an amazing experience at this fitness club! The staff was friendly and welcoming, and the facilities are top-notch. I left feeling energized and motivated.",
      date: "2 weeks ago"
    },
    {
      id: "2",
      name: "Michael Rodriguez",
      rating: 4,
      comment: "Great gym with modern equipment. The trainers are knowledgeable and helpful. The only downside is it can get crowded during peak hours.",
      date: "1 month ago"
    },
    {
      id: "3",
      name: "Emily Green",
      rating: 4,
      comment: "I've been coming here for my workouts and I absolutely love it. The facilities are clean and well-maintained, and the atmosphere is motivating.",
      date: "3 weeks ago"
    },
    {
      id: "4",
      name: "David Chen",
      rating: 5,
      comment: "Best fitness club in the area! The variety of equipment and classes is impressive. Highly recommend to anyone serious about fitness.",
      date: "1 week ago"
    }
  ]);
  // const [showReviewModal, setShowReviewModal] = useState(false);
  // const [reviewRating, setReviewRating] = useState(0);
  // const [reviewComment, setReviewComment] = useState("");

  // Initialize favorite state from localStorage
  useEffect(() => {
    if (club) {
      try {
        const favoriteClubs = JSON.parse(localStorage.getItem("favoriteClubs") || "[]");
        const isFav = favoriteClubs.some((c: Club) => c.id === club.id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error("Error reading favorites:", error);
      }
    }
  }, [club]);

  // Fetch club data if not passed via state
  useEffect(() => {
    const fetchClub = async () => {
      if (club) {
        setServices(generateServices(club.facilities));
        // Preload club image immediately if passed via state
        if (club.image_url) {
          preloadImage(club.image_url);
        }
        return;
      }

      if (!id) return;

      try {
        setLoading(true);
        const res = await api.get(`/clubs/${id}`);
        // Handle different API response structures
        const clubData = res.data?.data || res.data?.club || res.data;
        console.log("Fetched club data:", clubData); // Debug log
        console.log("Club image_url:", clubData?.image_url); // Debug image URL
        if (clubData) {
          // Ensure image_url is set, use fallback if not
          const clubWithImage = {
            ...clubData,
            image_url: clubData.image_url || "/card-img.png"
          };
          setClub(clubWithImage);
          setServices(generateServices(clubData.facilities));
          
          // Preload club image immediately for zero load delay
          if (clubWithImage.image_url) {
            preloadImage(clubWithImage.image_url);
          }
        }
      } catch (error) {
        console.error("Failed to fetch club:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id, club]);

  // Generate multiple images for carousel - show dots for multiple images feature
  // For now, we'll show dots even with single image (for future multi-image support)
  const clubImages = club?.image_url
    ? [club.image_url, club.image_url, club.image_url, club.image_url] // Show 4 dots for multi-image feature
    : ["/card-img.png", "/card-img.png", "/card-img.png", "/card-img.png"];

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => prev < clubImages.length - 1 ? prev + 1 : prev);
    }
    if (isRightSwipe) {
      setCurrentImageIndex((prev) => prev > 0 ? prev - 1 : prev);
    }
  };

  const handleAddToCart = (service: Service) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === service.id);
      if (exists) return prev;
      return [...prev, service];
    });
  };

  const handleRemoveFromCart = (serviceId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== serviceId));
  };

  const handleToggleFavorite = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Save to localStorage
    if (club) {
      try {
        const favoriteClubs = JSON.parse(localStorage.getItem("favoriteClubs") || "[]");
        if (newFavoriteState) {
          // Add to favorites if not already there
          const exists = favoriteClubs.find((c: Club) => c.id === club.id);
          if (!exists) {
            favoriteClubs.push(club);
            localStorage.setItem("favoriteClubs", JSON.stringify(favoriteClubs));
            // Dispatch custom event to notify other components
            window.dispatchEvent(new Event("favoritesUpdated"));
            toast.success("Added to favorites!");
          }
        } else {
          // Remove from favorites
          const updated = favoriteClubs.filter((c: Club) => c.id !== club.id);
          localStorage.setItem("favoriteClubs", JSON.stringify(updated));
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event("favoritesUpdated"));
          toast.success("Removed from favorites");
        }
      } catch (error) {
        console.error("Error saving favorite:", error);
      }
    }
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      alert("Please select a rating");
      return;
    }
    if (!reviewComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    // Get user name from localStorage or use a default
    const token = localStorage.getItem("auth_token");
    let userName = "Anonymous User";
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        userName = user.full_name || user.email?.split("@")[0] || "Anonymous User";
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
    }

    const newReview: Review = {
      id: Date.now().toString(),
      name: userName,
      rating: reviewRating,
      comment: reviewComment,
      date: "Just now"
    };

    setLocalReviews(prev => [newReview, ...prev]);
    setShowReviewModal(false);
    setReviewRating(0);
    setReviewComment("");
    alert("Thank you for your review!");
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0) + (club?.price_per_day || 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Club not found.</p>
            <button
              onClick={() => navigate("/welcome")}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Go Back
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition ${isFavorite ? "bg-blue-100" : "hover:bg-gray-100"
                }`}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? "fill-[#2563EB] text-[#2563EB]" : "text-gray-600"
                  }`}
              />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: club.name,
                    text: club.description,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Image - Using same image_url as welcome screen, no blur */}
      <div className="w-full">
      <div
    className="
      relative
      w-full
      lg:max-w-6xl xl:max-w-7xl
      lg:mx-auto
      h-56 sm:h-72 md:h-[420px]
      lg:h-[460px]
      overflow-hidden
    rounded-lg
    "
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onTouchEnd}
  >
        <img
          src={clubImages[currentImageIndex] || club.image_url || "/card-img.png"}
          alt={club.name || "Club"}
          className="w-full h-full object-cover select-none"
          decoding="async"
          loading="eager"
          fetchPriority="high"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/card-img.png";
          }}
        />

        {/* Carousel Dots - Pink/Gray pagination indicators */}
        {clubImages.length > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
            {clubImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? "bg-pink-500" 
                    : "bg-transparent border-[1px] border-gray-300"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* See Story */}
        {/* <button className="absolute top-4 right-4 text-[#2563EB] text-sm font-medium bg-white/90 px-3 py-1 rounded-full">
          See Story
        </button> */}
      </div>
      </div>

      {/* Club Information */}
      <div className="px-4 py-4 bg-white">
        <div className="text-green-600 text-sm font-medium mb-2">
          {club.opening_hours ? "Open Now" : "Available"}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{club.name || club.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{club.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{club.rating} ({Math.floor(Math.random() * 1000 + 100)})</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          {club.description}
        </p>
        <button className="text-blue-600 text-sm font-medium">Read More</button>

        {/* Contact Info */}
        {(club.opening_hours || club.contact_number) && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            {club.opening_hours && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{club.opening_hours}</span>
              </div>
            )}
            {club.contact_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{club.contact_number}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex px-4">
          {(["services", "details", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition ${activeTab === tab
                ? "text-[#2563EB] border-b-2 border-[#2563EB]"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
      {activeTab === "services" && (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {services.map((service) => {
      const inCart = cartItems.some(item => item.id === service.id);
      return (
        <div
          key={service.id}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600">
                {service.description}
              </p>
            </div>
            <div className="text-right ml-3">
              <div className="text-[#2563EB] font-semibold">
                ₹{service.price}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() =>
                inCart
                  ? handleRemoveFromCart(service.id)
                  : handleAddToCart(service)
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                inCart
                  ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  : "bg-blue-50 text-[#2563EB] border border-blue-300 hover:bg-blue-100"
              }`}
            >
              {inCart ? "Remove" : "Add"}
            </button>

            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Heart className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}


        {activeTab === "details" && (
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(club.facilities)
                  ? club.facilities
                  : typeof club.facilities === 'string'
                    ? JSON.parse(club.facilities || '[]')
                    : []
                ).map((facility: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
            {club.opening_hours && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Opening Hours</h3>
                <p className="text-gray-600">{club.opening_hours}</p>
              </div>
            )}
            {club.contact_number && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600">{club.contact_number}</p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
              <p className="text-gray-600">Daily Rate: ₹{club.price_per_day}/day</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {localReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
            <button 
              onClick={() => setShowReviewModal(true)}
              className="w-full md:w-auto md:max-w-xs md:mx-auto mt-4 bg-[#2563EB] text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Make a Review
            </button>
          </div>
        )}
      </div>

      {/* Bottom Cart Bar (Mobile & Desktop) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#2563EB] text-white p-4 z-40 shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex-1">
              <div className="text-sm font-medium">
                {cartItems.length} Item{cartItems.length !== 1 ? "s" : ""} Added
              </div>
              <div className="text-xs opacity-90 mt-1">
                {cartItems[0]?.name}
                {cartItems.length > 1 && ` +${cartItems.length - 1} more`}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold">₹{totalPrice}</div>
              </div>
              <button
                onClick={() => {
                  // Navigate to cart/checkout
                  navigate("/bookings", { state: { club, services: cartItems } });
                }}
                className="bg-white text-[#2563EB] px-6 py-2 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewComment("");
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setReviewRating(rating)}
                    className="p-1"
                    type="button"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={5}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setReviewComment("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-xl hover:bg-blue-700 font-medium transition"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetails;
