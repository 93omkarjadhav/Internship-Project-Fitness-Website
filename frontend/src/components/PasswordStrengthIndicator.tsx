interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { level: strength, text: "Password strength: Weak! Add Strength!", color: "bg-destructive" };
    } else if (strength <= 4) {
      return { level: strength, text: "Password strength: Good! ", color: "bg-warning" };
    } else {
      return { level: strength, text: "Password strength: Amazing!", color: "bg-success" };
    }
  };

  const strength = getStrength();
  
  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.level / 5) * 100}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${
        strength.level <= 2 ? "text-destructive" : 
        strength.level <= 4 ? "text-warning" : 
        "text-success"
      }`}>
        {strength.text}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
