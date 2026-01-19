import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Smartphone, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const smsSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number is required"),
});

type SMSForm = z.infer<typeof smsSchema>;

const ForgotPasswordSMS = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SMSForm>({
    resolver: zodResolver(smsSchema),
  });

  const onSubmit = async (data: SMSForm) => {
    try {
      setIsLoading(true);
      
      // Send the SMS with reset link
      await axios.post("http://localhost:3001/api/auth/forgot-password-sms", {
        phoneNumber: data.phoneNumber,
      });

      toast.success("Password reset link sent via SMS! Check your phone.");
      // Don't navigate away so user can see the message
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to send SMS";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout hideLogo={true} hideTitleAndSubtitle={true} disableCentering={true} leftImageSrc="/ladki - Edited.png">
      <div className="md:hidden flex justify-center mb-6">
        <img src="/ladki - Edited.png" alt="Forgot Password SMS" className="w-4/5 max-w-sm" />
      </div>
      <button
        onClick={() => navigate("/forgot-password")}
        className="mb-6 text-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-2xl font-bold mb-2">Forgot Password via SMS</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your phone number to receive a password reset link via SMS.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send SMS"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-center text-sm text-foreground">
          Don't remember your phone?{" "}
          <a
            href="mailto:help@fitfare.fit"
            className="font-medium text-primary hover:underline"
          >
            Contact us at help@fitfare.fit
          </a>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordSMS;

