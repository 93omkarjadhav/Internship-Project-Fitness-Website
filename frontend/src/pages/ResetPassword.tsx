import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/api/client";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPassword = watch("password");

  useEffect(() => {
    setPassword(watchedPassword || "");
  }, [watchedPassword]);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (data) => {
    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    try {
      setIsLoading(true);
      
      await supabase.auth.updateUser({
        token,
        password: data.password,
      });

      toast.success("Password updated successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout hideLogo={true} hideTitleAndSubtitle={true} disableCentering={true} leftImageSrc="/image-1.webp">
      <div className="md:hidden flex justify-center mb-6">
        <img src="/image-1.webp" alt="Reset Password" className="w-4/5 max-w-sm" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Set your new password below.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("password")}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password..."
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;
