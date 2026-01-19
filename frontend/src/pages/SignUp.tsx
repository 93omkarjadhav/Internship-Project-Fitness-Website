import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import AuthInput from "@/components/AuthInput";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { Button } from "@/components/ui/button";
import { preloadImage } from "../utils/imagePreloader";

// Zod schema with no terms yet (we check manually)
const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    gender: z.enum(["Female", "Male", "Other"], {
      required_error: "Please select your gender",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [agree, setAgree] = useState(false);

  // Preload the left side image immediately when component mounts
  useEffect(() => {
    // Preload the main image for Sign Up page
    preloadImage("/image-1.webp");
    
    // Also preload other images used in the form
    preloadImage("/logo.png");
    preloadImage("/image.png");
    preloadImage("/sign-up.png");
    
    // Force immediate loading with Image object
    const images = ["/image-1.webp", "/logo.png", "/image.png", "/sign-up.png"];
    images.forEach(src => {
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.src = src;
    });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpForm) => {
    // CRITICAL: Check if user agreed to Terms & Conditions
    if (!agree) {
      toast.error("You must agree to the Terms & Conditions to create an account.");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        {
          email: data.email,
          password: data.password,
          gender: data.gender,
        }
      );

      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("token", response.data.token);
      }

      toast.success("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenderSelect = (gender: "Female" | "Male" | "Other") => {
    setSelectedGender(gender);
    setValue("gender", gender, { shouldValidate: true });
  };

  return (
    <AuthLayout leftImageSrc="/image-1.webp">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AuthInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="example@gmail.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <AuthInput
            label="Password"
            icon={Lock}
            type="password"
            placeholder="•••••••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrengthIndicator password={password || ""} />
        </div>

        <AuthInput
          label="Confirm Password"
          icon={Lock}
          type="password"
          placeholder="•••••••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Gender Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Gender</label>

          <div className="grid grid-cols-3 gap-2">
            {["Female", "Male", "Other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGenderSelect(g as any)}
                className={`py-3 px-4 rounded-xl border-2 transition-all font-medium ${
                  selectedGender === g
                    ? g === "Female"
                      ? "border-pink-500 bg-pink-50 text-pink-700"
                      : g === "Male"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {errors.gender && (
            <p className="text-sm text-red-500">{errors.gender.message}</p>
          )}

          <p className="text-xs text-gray-500">
            {selectedGender === "Male" || selectedGender === "Other"
              ? "⚠️ Period tracker will not be available for this gender"
              : selectedGender === "Female"
              ? "✓ You will have access to period tracking features"
              : "Please select your gender to continue"}
          </p>
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => setAgree(!agree)}
            className={`w-5 h-5 flex items-center justify-center rounded border transition-all ${
              agree
                ? "bg-blue-600 border-blue-600"
                : "border-gray-300 bg-white"
            }`}
          >
            {agree && <span className="text-white text-sm">✔</span>}
          </button>

          <span className="text-sm text-gray-700">
            I agree to the{" "}
            <Link
              to="/privacy-policy"
              state={{ returnPath: "/signup" }}
              className="text-blue-600 underline hover:text-blue-700"
            >
              Terms & Conditions
            </Link>
          </span>
        </div>


        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl"
          disabled={isLoading}
        >
          Sign Up
          <img 
            src="/sign-up.png" 
            className="ml-2" 
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </Button>

        <p className="text-center text-sm text-foreground">
          I already have{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="font-medium text-primary hover:underline"
          >
            an account
          </button>
        </p>
      </form>

    </AuthLayout>
  );
};

export default SignUp;
