import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/api/client'; // Assuming supabase client is used for auth token

interface NutritionProfile {
  food_preference: string;
  common_allergies: string[];
  snack_frequency: string;
  calorie_intake: number;
  other_notes: string;
}

interface NutritionProfileContextType {
  profile: NutritionProfile;
  updateProfile: (updates: Partial<NutritionProfile>) => void;
  submitProfile: () => Promise<boolean>;
  resetProfile: () => void;
  isEditingExistingProfile: boolean;
  setIsEditingExistingProfile: (isEditing: boolean) => void;
}

const defaultProfile: NutritionProfile = {
  food_preference: "I don't have any preferences",
  common_allergies: [],
  snack_frequency: "",
  calorie_intake: 2000,
  other_notes: "",
};

const NutritionProfileContext = createContext<NutritionProfileContextType | undefined>(undefined);

export const NutritionProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<NutritionProfile>(defaultProfile);
  const [isEditingExistingProfile, setIsEditingExistingProfile] = useState(false);

  const updateProfile = useCallback((updates: Partial<NutritionProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(defaultProfile);
    setIsEditingExistingProfile(false); // Also reset this flag
  }, []);

  const submitProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('You must be logged in to update your profile.');
        return false;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      setIsEditingExistingProfile(false); // Reset after successful submission
      return true;
    } catch (error: any) {
      console.error('Error submitting profile:', error);
      toast.error(`Error: ${error.message || 'Failed to submit profile'}`);
      return false;
    }
  }, [profile]); // Depend on profile so it's always sending the latest data

  return (
    <NutritionProfileContext.Provider value={{ profile, updateProfile, submitProfile, resetProfile, isEditingExistingProfile, setIsEditingExistingProfile }}>
      {children}
    </NutritionProfileContext.Provider>
  );
};

export const useNutritionProfile = () => {
  const context = useContext(NutritionProfileContext);
  if (context === undefined) {
    throw new Error('useNutritionProfile must be used within a NutritionProfileProvider');
  }
  return context;
};
