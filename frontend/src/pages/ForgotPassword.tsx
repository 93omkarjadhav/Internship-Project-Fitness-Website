import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Smartphone, Key, ArrowLeft, ChevronRight } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { preloadImage } from "../utils/imagePreloader";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Preload the left side image immediately when component mounts
  useEffect(() => {
    // Preload the main image for Forgot Password page
    preloadImage("/forget-pass.webp");
    
    // Also preload logo and other images
    preloadImage("/logo.png");
    
    // Force immediate loading with Image object
    const images = ["/forget-pass.webp", "/logo.png"];
    images.forEach(src => {
      const img = new Image();
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = 'high';
      }
      img.src = src;
    });
  }, []);

  const options = [
    {
      id: "email",
      icon: Mail,
      label: "Send via Email",
      action: () => navigate("/reset-password-email"),
    },
    {
      id: "sms",
      icon: Smartphone,
      label: "Send via SMS",
      action: () => navigate("/forgot-password-sms"),
    },
  ];

  return (
    <AuthLayout hideLogo={true} hideTitleAndSubtitle={true} disableCentering={true} leftImageSrc="/forget-pass.webp">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Please select the following options to reset your password.
      </p>

      <div className="space-y-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={option.action}
              className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="font-medium text-foreground">{option.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
