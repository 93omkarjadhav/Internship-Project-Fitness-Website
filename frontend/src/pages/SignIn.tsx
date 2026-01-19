import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import AuthInput from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { preloadImage } from "../utils/imagePreloader";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  keepSignedIn: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Preload the left side image immediately when component mounts
  useEffect(() => {
    // Preload the main image for Sign In page
    preloadImage("/image-2.webp");
    
    // Also preload other images used in the form
    preloadImage("/logo.png");
    preloadImage("/image.png");
    preloadImage("/sign-up.png");
    
    // Force immediate loading with Image object
    const images = ["/image-2.webp", "/logo.png", "/image.png", "/sign-up.png"];
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
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInForm) => {
    console.log("Sign in form submitted!", data);
    try {
      setError("");
      setIsLoading(true);

      console.log("Calling backend API...");
      const res = await axios.post("http://localhost:3001/api/auth/signin", {
        email: data.email,
        password: data.password,
        keepSignedIn: data.keepSignedIn,
      });

      console.log("Sign in successful:", res.data);
      toast.success("Signed in successfully!");
      localStorage.setItem("auth_token", res.data.token);
      console.log("Token stored in localStorage:", localStorage.getItem("auth_token"));
      navigate("/welcome");
    } catch (err: any) {
      console.error("Sign in error:", err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.error || "Incorrect email or password!";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Redirecting to Google OAuth...");
    // Redirect to backend Google OAuth endpoint
    window.location.href = "http://localhost:3001/api/auth/google";
  };

  return (
    <AuthLayout leftImageSrc="/image-2.webp">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <img 
                src="/image.png" 
                alt="Email icon" 
                className="w-5 h-5" 
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <AuthInput
            label="Password"
            icon={Lock}
            type="password"
            placeholder="•••••••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="keep-signed-in" {...register("keepSignedIn")} />
            <label
              htmlFor="keep-signed-in"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Keep me signed in
            </label>
          </div>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot Password
          </button>
        </div>

        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("=== BUTTON CLICKED ===");
            
            const form = e.currentTarget.closest('form');
            if (form) {
              const formData = new FormData(form);
              const email = formData.get('email') as string;
              const password = formData.get('password') as string;
              const keepSignedIn = (formData.get('keepSignedIn') === 'on');
              
              if (!email || !password) {
                toast.error("Please enter email and password");
                return;
              }
              
              console.log("Email:", email, "Password:", password);
              
              try {
                setIsLoading(true);
                setError("");
                
                console.log("Calling backend...");
                const res = await axios.post("http://localhost:3001/api/auth/signin", {
                  email,
                  password,
                  keepSignedIn,
                });
                
                console.log("SUCCESS:", res.data);
                toast.success("Signed in successfully!");
                localStorage.setItem("auth_token", res.data.token);
                console.log("Token stored in localStorage:", localStorage.getItem("auth_token"));
                navigate("/welcome");
              } catch (err: any) {
                console.error("ERROR:", err);
                const errorMessage = err.response?.data?.error || "Sign in failed!";
                setError(errorMessage);
                toast.error(errorMessage);
              } finally {
                setIsLoading(false);
              }
            }
          }}
          disabled={isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 10 }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
          {/* <ArrowRight className="ml-2 w-5 h-5 text-white" /> */}
          <img 
            src="/sign-up.png" 
            className="ml-2" 
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">OR</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-12 bg-black hover:bg-black/90 text-white border-0 font-medium rounded-xl"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign In With Google
        </Button>

        <p className="text-center text-sm text-foreground mt-10 mb-20">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-medium text-primary hover:underline"
          >
            Sign Up
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default SignIn;
