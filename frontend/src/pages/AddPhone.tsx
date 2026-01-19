import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const addPhoneSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type AddPhoneForm = z.infer<typeof addPhoneSchema>;

const AddPhone = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddPhoneForm>({
    resolver: zodResolver(addPhoneSchema),
  });

  const onSubmit = async (data: AddPhoneForm) => {
    try {
      setIsLoading(true);
      
      await axios.post("http://localhost:3001/api/auth/update-phone", {
        email: data.email,
        phoneNumber: data.phoneNumber,
      });

      toast.success("Phone number added successfully!");
      toast.info("You can now use SMS password reset!");
      
      // Redirect to SMS reset page after 2 seconds
      setTimeout(() => {
        navigate("/forgot-password-sms");
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to add phone number";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <button
          onClick={() => navigate("/")}
          className="mb-6 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Add Phone Number</h1>
          <p className="text-gray-600">
            Link your phone number to enable SMS password reset
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="9325835557"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Enter with country code (e.g., +919325835557) or without
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Phone Number"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>✨ After adding:</strong> You'll be able to reset your password using SMS instead of email!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPhone;

