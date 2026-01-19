import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/api/client";
import { toast } from "sonner";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const resetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResetForm = z.infer<typeof resetSchema>;

const ResetPasswordEmail = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit: SubmitHandler<ResetForm> = async (data) => {
    try {
      setIsLoading(true);
      
      await supabase.auth.resetPasswordForEmail(data.email);

      toast.success("Password reset email sent!");
      navigate("/password-reset-sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout hideLogo={true} hideTitleAndSubtitle={true} disableCentering={true} leftImageSrc="/ladki - Edited.png">
      {/* Mobile: Back arrow above image */}
      <div className="md:hidden">
        <button
          onClick={() => navigate("/forgot-password")}
          className="mb-4 text-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex justify-center mb-6">
          <img src="/ladki - Edited.png" alt="Email Sent" className="w-4/5 max-w-sm" />
        </div>
      </div>
      
      {/* Desktop: Back arrow in normal position */}
      <button
        onClick={() => navigate("/forgot-password")}
        className="hidden md:block mb-6 text-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-2xl font-bold mb-2">Reset Password by Email</h1>
      <p className="text-sm text-muted-foreground mb-8">
        We will send a reset link to your email address.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl mb-4 md:mb-0"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-center md:text-center text-left text-sm text-foreground md:mt-0 mt-4">
          <span className="block md:inline">Don't remember your Email? </span>
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

export default ResetPasswordEmail;
