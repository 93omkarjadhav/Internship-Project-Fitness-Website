import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: number;
    club_title: string;
    club_city: string;
    price_per_day: number;
    booking_status?: string;
    payment_status?: string;
  };
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (!isOpen) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      alert("Payment gateway failed to load. Please try again.");
    };

    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }

    return () => {
      // Don't remove script on unmount as it might be used again
    };
  }, [isOpen]);

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      // Get user info for prefill (optional)
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Create order - api interceptor already returns data directly
      const orderData = await api.post(
        "/payment/create-order",
        {
          amount: booking.price_per_day, // Amount in rupees
          booking_id: booking.id,
        }
      );

      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      // Validate Razorpay Key
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
      if (!razorpayKey) {
        throw new Error("Razorpay Key ID is not configured. Please set VITE_RAZORPAY_KEY in your .env file.");
      }

      const options = {
        key: razorpayKey, // Razorpay Key ID from environment variable
        amount: orderData.order.amount,
        currency: "INR",
        name: "FitFare Gyms",
        description: `Booking payment for ${booking.club_title}`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: booking.id,
              amount: booking.price_per_day,
            };

            const verifyResponse = await api.post(
              "/payment/verify",
              verifyData
            );

            if (verifyResponse.success) {
              onPaymentSuccess();
              onClose();
              // Show success message
              alert("Payment Successful ✅");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.full_name || user.name || "",
          email: user.email || "",
          contact: user.phone_number || "",
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      console.error("Error details:", {
        message: error?.message,
        error: error?.error,
        response: error?.response?.data
      });
      const errorMessage = error?.message || error?.error || error?.response?.data?.message || "Failed to initiate payment. Please try again.";
      alert(errorMessage);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {booking.club_title}
            </h3>
            <p className="text-sm text-gray-600">{booking.club_city}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{booking.price_per_day}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              loading || !razorpayLoaded
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#2563EB] hover:bg-blue-700 text-white"
            }`}
          >
            {loading
              ? "Processing..."
              : !razorpayLoaded
              ? "Loading Payment Gateway..."
              : "Proceed to Payment"}
          </button>

          <p className="text-xs text-center text-gray-500">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;

