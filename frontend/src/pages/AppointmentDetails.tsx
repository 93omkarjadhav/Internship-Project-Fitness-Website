import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import api from "@/lib/api";

interface Club {
  id: number;
  name: string;
  title?: string;
  facilities?: string[] | string;
  price_per_day: number;
}

const AppointmentDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const club: Club | null = location.state?.club || null;

  const [service, setService] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState(String(club?.price_per_day || ""));
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [services, setServices] = useState<string[]>([]);

  // Handle missing club data
  useEffect(() => {
    if (!club) {
      console.error("No club data found in navigation state");
      // Redirect back after a short delay
      setTimeout(() => {
        navigate("/bookings");
      }, 2000);
    }
  }, [club, navigate]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
    };

    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  // Generate services from facilities
  useEffect(() => {
    if (club?.facilities) {
      const facilitiesList = Array.isArray(club.facilities)
        ? club.facilities
        : typeof club.facilities === 'string'
          ? JSON.parse(club.facilities || '[]')
          : [];

      // Use facilities directly as services (they're already in the correct format from MyBookings)
      setServices(facilitiesList);
    }
  }, [club]);

  if (!club) {
    return (
      <div className="bg-gray-100 p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Club not found.</p>
          <button
            onClick={() => navigate("/bookings")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format date → DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const removeDate = (date: string) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  // Payment handler with Razorpay
  const handlePayment = async () => {
    if (!service || !time || selectedDates.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if Razorpay is available (either loaded dynamically or from HTML)
    if (!(window as any).Razorpay) {
      // Try to wait a bit for script to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!(window as any).Razorpay) {
        alert("Payment gateway is not available. Please refresh the page and try again.");
        return;
      }
    }

    setLoading(true);
    try {
      // Create Razorpay order
      const orderData = await api.post("/payment/create-order", {
        amount: Number(price),
      });

      // Check if order was created successfully
      if (!orderData || !orderData.success || !orderData.order) {
        console.error("Order creation failed:", orderData);
        throw new Error(orderData?.message || "Failed to create payment order");
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY || "rzp_live_Rnbzyq0lkSdPOf";
      
      if (!razorpayKey) {
        throw new Error("Razorpay key is not configured");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: "INR",
        name: "FitFare Gyms",
        description: `Booking for ${club.name || club.title}`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            // Get user data if available, otherwise use a default
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: currentUser.id || 1, // Default to 1 if no user
              gym_name: club.name || club.title,
              service_name: service,
              date: selectedDates[0],
              amount: Number(price),
            };

            // API interceptor returns response.data directly
            const verifyResponse = await api.post("/payment/verify", verifyData);

            if (verifyResponse.success) {
              alert("Payment Successful ✅");
              navigate("/bookings", { state: { tab: "finished" } });
            } else {
              alert("Verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#2563EB" },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      const errorMessage = err?.message || err?.error || err?.response?.data?.message || "Payment error. Please try again.";
      alert(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-5 max-w-md mx-auto">
        <button className="text-blue-500 mb-3" onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </button>

        <h1 className="text-2xl font-semibold text-center mb-6">
          Appointment Details
        </h1>

        {/* Gym Name */}
        <label className="font-medium">Gym Name</label>
        <input
          type="text"
          value={club.name || club.title || ""}
          readOnly
          className="w-full border rounded-lg p-3 mt-1 bg-gray-100"
        />

        {/* Service */}
        <label className="font-medium mt-4 block">Select Service</label>
        <select
          className="w-full border rounded-lg p-3 mt-1"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">Select Service</option>
          {services.map((s: string, i: number) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        {/* Dates */}
        <div className="flex items-center gap-2 mt-4">
          <label className="font-medium">Select Dates</label>
          <span className="text-xs text-gray-500">
            ( <span className="text-gray-500">*</span> You can select multiple dates . )
          </span>
        </div>

        <input
          type="date"
          className="w-full border rounded-lg p-3 mt-1"
          value={currentDate}
          onChange={(e) => {
            const date = e.target.value;
            setCurrentDate(date);
            if (date && !selectedDates.includes(date)) {
              setSelectedDates([...selectedDates, date]);
            }
          }}
        />

        <div className="flex flex-wrap gap-2 mt-2">
          {selectedDates.map((d) => (
            <div key={d} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1">
              <span>{formatDate(d)}</span>
              <button
                type="button"
                onClick={() => removeDate(d)}
                className="text-red-500 font-bold"
              >
                x
              </button>
            </div>
          ))}
        </div>

        {/* Time */}
        <label className="font-medium mt-4 block">Select Time</label>
        <input
          type="time"
          className="w-full border rounded-lg p-3 mt-1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        {/* Price */}
        <label className="font-medium mt-4 block">Price</label>
        <div className="flex items-center border rounded-lg mt-1">
          <span className="px-3 text-lg font-semibold">₹</span>
          <input
            type="number"
            className="w-full p-3 outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={!service || !time || selectedDates.length === 0 || loading || !razorpayLoaded}
          className={`mt-6 w-full py-3 text-white rounded-lg text-lg ${
            service && time && selectedDates.length && razorpayLoaded
              ? "bg-[#2563EB] hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          } transition`}
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetails;
