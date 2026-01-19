import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const PasswordResetSent = () => {
  return (
    <AuthLayout hideLogo={true} hideTitleAndSubtitle={true} disableCentering={true} leftImageSrc="/openmailpage.png">
      <div className="md:hidden flex justify-center mb-6">
        <img src="/openmailpage.png" alt="Email Sent" className="w-4/5 max-w-sm" />
      </div>
      
      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-2xl font-bold mb-4 text-center md:text-left w-full">Password Reset Sent</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center md:text-left w-full">
          Please check your email in a few minutes - we've sent you an email containing password recovery link.
        </p>

        <Button
          onClick={() => window.open("https://mail.google.com", "_blank")}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl mb-6"
        >
          Open My Email
          <Mail className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-sm text-foreground text-center md:text-left w-full">
          <span className="block md:inline">Didn't receive the email? </span>
          <a
            href="mailto:help@fitfare.fit"
            className="font-medium text-primary hover:underline"
          >
            Contact us at help@fitfare.fit
          </a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default PasswordResetSent;
