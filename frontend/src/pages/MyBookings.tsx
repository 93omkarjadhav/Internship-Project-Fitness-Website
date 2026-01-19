import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AiFillHome, AiOutlineBook, AiOutlineHeart, AiOutlineUser } from "react-icons/ai";

interface Gym {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

const gyms: Gym[] = [
  {
    id: 1,
    title: "Gold's Gym Pune",
    subtitle: "Premium Fitness Training",
    description:
      "Gold's Gym Pune provides world-class training with certified trainers for all fitness levels.",
    image: "/gym1 (2).jpg",
  },
  {
    id: 2,
    title: "Multifit Kothrud",
    subtitle: "Functional & Group Training",
    description:
      "Multifit Kothrud offers energetic group workouts, HIIT, and functional training to improve stamina and overall fitness.",
    image: "/gym2 (2).jpg",
  },
  {
    id: 3,
    title: "Anytime Fitness Pune",
    subtitle: "24×7 Personalized Training",
    description:
      "Anytime Fitness Pune offers 24×7 access, modern equipment, and personalized training for all fitness levels.",
    image: "/gym3 (2).jpg",
  },
];

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"cart" | "finished">(
    location.state?.tab === "finished" ? "finished" : "cart"
  );
  const [cartClubs, setCartClubs] = useState<Gym[]>([]);
  const [finishedBookings, setFinishedBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart clubs from localStorage
  useEffect(() => {
    if (activeTab === "cart") {
      loadCartClubs();
    } else {
      fetchFinishedBookings();
    }
  }, [activeTab]);

  const loadCartClubs = () => {
    try {
      const savedCart = localStorage.getItem("cartClubs");
      if (savedCart) {
        const clubs = JSON.parse(savedCart);
        setCartClubs(clubs);
      } else {
        // If no cart, show default gyms
        setCartClubs(gyms);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartClubs(gyms);
    }
  };

  const fetchFinishedBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/bookings/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const bookingsData = res.data.bookings || res.data || [];
      // Filter for completed/finished bookings
      const finished = bookingsData.filter((b: any) => 
        b.payment_status === "paid" || b.booking_status === "completed"
      );
      setFinishedBookings(finished);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setFinishedBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGymClick = (club: Gym | any) => {
    // Map gym services based on ID (matching payment/gymbooking)
    const gymServices: { [key: number]: string[] } = {
      1: ["Strength Training", "Cardio Zone", "Zumba", "CrossFit"], // Gold's Gym Pune
      2: ["Functional Training", "HIIT", "Yoga", "Meditation"], // Multifit Kothrud
      3: ["Personal Training", "Cardio", "Strength Machines", "Zumba"], // Anytime Fitness Pune
    };

    // Convert club format to appointment details format
    const clubData = {
      id: club.id,
      name: club.title,
      title: club.title,
      description: club.description || "",
      image_url: club.image || club.image_url || "/card-img.png",
      price_per_day: club.price_per_day || 40,
      facilities: gymServices[club.id] || ["Gym", "Cardio", "Weights"],
    };
    navigate("/appointment-details", { state: { club: clubData } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <h1 className="text-[40px] font-bold px-4 mt-6 text-center">My Booking</h1>

      {/* Tabs */}
      <div className="flex justify-center mt-8 border-b">
        <button
          className={`pb-2 px-6 font-medium transition ${
            activeTab === "cart"
              ? "border-b-2 border-[#4880FF] text-[#4880FF]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("cart")}
        >
          Cart
        </button>
        <button
          className={`pb-2 px-6 font-medium transition ${
            activeTab === "finished"
              ? "border-b-2 border-[#4880FF] text-[#4880FF]"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("finished")}
        >
          Finished
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        </div>
      ) : activeTab === "cart" ? (
        /* Cart Tab - Club Cards (from cart or default gyms) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 mt-12">
          {cartClubs.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            cartClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Image */}
                <img
                  src={club.image || "/card-img.png"}
                  alt={club.title}
                  className="w-full h-44 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/card-img.png";
                  }}
                />

                {/* Content */}
                <div className="p-4 flex-1 text-center">
                  <h3 className="text-lg font-semibold text-gray-800">{club.title}</h3>
                  <p className="text-sm text-[#4880FF] font-medium mt-1">
                    {club.subtitle || "Fitness Training"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {club.description || "Premium fitness facility with modern equipment."}
                  </p>
                </div>

                {/* Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleGymClick(club)}
                    className="w-full bg-[#2563EB] text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Finished Tab - Previous Bookings */
        <div className="p-4 max-w-md mx-auto w-full">
          <div className="mt-6 border rounded-xl p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Previous Bookings</h2>
            
            {finishedBookings.length === 0 ? (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-500 font-medium">No previous bookings found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {finishedBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="font-semibold text-sm">{booking.club_title || booking.service_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(booking.created_at || booking.order_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ₹{booking.price_per_day || booking.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continue Booking Button */}
          <div className="mt-10 flex justify-center pb-8">
            <button
              onClick={() => setActiveTab("cart")}
              className="w-full py-3 bg-[#4880FF] text-white rounded-xl text-lg font-semibold shadow-md hover:bg-blue-600 transition"
            >
              Continue Booking
            </button>
          </div>
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

        {/* My Booking (Active) */}
        <button className="flex flex-col items-center text-[#4880FF] border-b-2 border-[#4880FF] pb-1">
          <AiOutlineBook size={22} />
          <span className="text-xs mt-1">My Booking</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => navigate("/saved")}
          className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition"
        >
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

export default MyBookings;
