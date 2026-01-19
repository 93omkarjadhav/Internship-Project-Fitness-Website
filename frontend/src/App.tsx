import React, { Suspense, lazy } from "react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteImagePreloader from "@/components/RouteImagePreloader";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordEmail from "./pages/ResetPasswordEmail";
import PasswordResetSent from "./pages/PasswordResetSent";
import ResetPassword from "./pages/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
// import Dashboard from "./pages/Dashboard";
import Dashboard from "./pages/Nutrition/Dashboard";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import ForgotPasswordSMS from "./pages/ForgotPasswordSMS";
import GoogleCallback from "./pages/GoogleCallback";
import AddPhone from "./pages/AddPhone";
import PrivateRoutes from "@/components/PrivateRoutes";
import ClubsActivities from "./pages/ClubsActivities";
import Activities from "./pages/Activities";
import MyBookings from "./pages/MyBookings";
import AppointmentDetails from "./pages/AppointmentDetails";
import Saved from "./pages/Saved";

// Error Pages
import {
  FeatureLocked,
  Maintenance,
  NoInternet,
  NotAllowed,
  NotFoundPage,
  NothingToShow,
  ServerError,
  UpdateRequired,
} from "./pages/Error_pages";

// Nutrition App Components
import Home from "./components/home/Home";
import SetupIntro from "./components/SetupIntro/SetupIntro";
import FoodPreferences from "./components/FoodPreference/FoodPreferences";
import Allergies from "./components/Allergies/Allergies";
import SnackFrequency from "./components/SnackFrequency/SnackFrequency";
import CalorieIntake from "./components/callories/CalorieIntake";
import FoodAllergies from "./components/food/FoodAllergies";
import NutritionSummary from "./pages/NutritionSummary";
import { NutritionProfileProvider } from "./context/NutritionProfileContext";
// Nutrition Flow UI pages
import NutritionDashboard from "./pages/Nutrition/NutritionDashboard";
import NutritionInsights from "./pages/Nutrition/NutritionInsights";
import NutritionHistoryPage from "./pages/Nutrition/NutritionHistoryPage";
import NutritionSchedule from "./pages/Nutrition/NutritionSchedule";
import NutritionGoalPage from "./pages/Nutrition/NutritionGoalPage";
import EditCalorieGoalPage from "./pages/Nutrition/EditCalorieGoalPage";
import AddMealPage from "./pages/Nutrition/AddMealPage";
import MealDetails from "./pages/Nutrition/MealDetails";
// import FilterNutritionPage from "./pages/Nutrition/FilterNutritionPage";
import DeleteMeal from "./pages/Nutrition/DeleteMeal";
import CalorieGoalReachedPage from "./pages/Nutrition/CalorieGoalReachedPage";
// import NutritionAIRecommendationsPage from "./pages/Nutrition/NutritionAIRecommendationsPage";
// Period tracker pages copied into Team-A
import PeriodCalendarCard from "./period_tracker/pages/CalendarCard";
import PeriodSetupIntro from "./period_tracker/pages/SetupIntro";
import PeriodCycleSelector from "./period_tracker/pages/CycleSelector";
import PeriodTreatments from "./period_tracker/pages/Treatments";
import PeriodPeriodSelector from "./period_tracker/pages/PeriodSelector";
import PeriodSymptoms from "./period_tracker/pages/Symptoms";
import PeriodAnalyze from "./period_tracker/pages/Analyze";
import PeriodNextPeriod from "./period_tracker/pages/NextPeriod";
import PeriodDashboard from "./period_tracker/pages/Dashboard";
import PeriodLogCycle from "./period_tracker/pages/LogCycle";
import PeriodCycleHistory from "./period_tracker/pages/CycleHistory";
import PeriodCycleCalendar from "./period_tracker/pages/CycleCalendar";
import PeriodCycleInsight from "./period_tracker/pages/CycleInsight";
import PeriodRestricted from "./pages/PeriodRestricted";
import PeriodTrackerGuard from "./components/PeriodTrackerGuard";
import ClubDetails from "./pages/ClubDetails";
const TeamDApp = lazy(() => import("./teamd/TeamDApp"));

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteImagePreloader />
        <NutritionProfileProvider>
        <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password-sms" element={<ForgotPasswordSMS />} />
            <Route path="/add-phone" element={<AddPhone />} />
            <Route path="/reset-password-email" element={<ResetPasswordEmail />} />
            <Route path="/password-reset-sent" element={<PasswordResetSent />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Profile Setup Account Routes - Commented out due to path alias dependencies
            These pages use @/ aliases from Profile_setup_account project which won't resolve here.
            To enable: Copy the pages to Team-A/frontend/src/pages/ and update imports.
            <Route path="/profile-setup" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/ProfileSetup")))}
              </Suspense>
            } />
            <Route path="/profile-details" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/ProfileDetails")))}
              </Suspense>
            } />
            <Route path="/phone-otp-setup" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/PhoneOtpSetup")))}
              </Suspense>
            } />
            <Route path="/verify-passcode" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/VerifyPasscode")))}
              </Suspense>
            } />
            <Route path="/identity-verified" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/IdentityVerified")))}
              </Suspense>
            } />
            <Route path="/enable-notifications" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/EnableNotifications")))}
              </Suspense>
            } />
            <Route path="/personalized-recommendation" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("../../Profile_setup_account/frontend/src/pages/PersonalizedRecommendation")))}
              </Suspense>
            } />
            */}
            <Route element={<PrivateRoutes />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/appointment-details" element={<AppointmentDetails />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/clubs/:id" element={<ClubDetails />} />

              
              {/* Clubs & Activities Routes */}
              <Route path="/clubs" element={<ClubsActivities />} />
              <Route path="/activities" element={<Activities />} />
              
              {/* Nutrition App Routes */}
              <Route path="/nutrition/home" element={<Home />} />
              <Route path="/nutrition/setup" element={<SetupIntro />} />
              <Route path="/nutrition/food-preferences" element={<FoodPreferences />} />
              <Route path="/nutrition/allergies" element={<Allergies />} />
              <Route path="/nutrition/snack-frequency" element={<SnackFrequency />} />
              <Route path="/nutrition/calorie-intake" element={<CalorieIntake />} />
              <Route path="/nutrition/food-allergies" element={<FoodAllergies />} />
              <Route path="/nutrition/summary" element={<NutritionSummary />} />
              {/* Nutrition Flow UI routes */}
              <Route path="/nutrition-dashboard" element={<NutritionDashboard />} />
              <Route path="/nutrition-insight" element={<NutritionInsights />} />
              <Route path="/nutrition-history" element={<NutritionHistoryPage />} />
              <Route path="/nutrition-schedule" element={<NutritionSchedule />} />
              <Route path="/nutrition-goal" element={<NutritionGoalPage />} />
              <Route path="/edit-goal" element={<EditCalorieGoalPage />} />
              <Route path="/goal-reached" element={<CalorieGoalReachedPage />} />
              <Route path="/add-meal-manually" element={<AddMealPage />} />
              {/* Support both /meal/:id and /meal-details?id=... for existing links */}
              <Route path="/meal/:id" element={<MealDetails />} />
              <Route path="/meal-details" element={<MealDetails />} />
              {/* <Route path="/filter-nutrition" element={<FilterNutritionPage />} /> */}
              <Route path="/delete-meal" element={<DeleteMeal />} />
              {/* <Route path="/nutrition-ai-recommendations" element={<NutritionAIRecommendationsPage />} /> */}
              {/* Period Tracker routes (all from period_tracking_2 frontend) */}
              <Route path="/period-tracker" element={<PeriodTrackerGuard><PeriodCalendarCard /></PeriodTrackerGuard>} />
              <Route path="/cycles" element={<PeriodTrackerGuard><PeriodCalendarCard /></PeriodTrackerGuard>} />
              <Route path="/period-restricted" element={<PeriodRestricted />} />
              <Route path="/period/setup-intro" element={<PeriodTrackerGuard><PeriodSetupIntro /></PeriodTrackerGuard>} />
              <Route path="/period/cycle" element={<PeriodTrackerGuard><PeriodCycleSelector /></PeriodTrackerGuard>} />
              <Route path="/period/treatment" element={<PeriodTrackerGuard><PeriodTreatments /></PeriodTrackerGuard>} />
              <Route path="/period/period-start" element={<PeriodTrackerGuard><PeriodPeriodSelector /></PeriodTrackerGuard>} />
              {/* alias for older links using /period-start without prefix */}
              <Route path="/period-start" element={<PeriodTrackerGuard><PeriodPeriodSelector /></PeriodTrackerGuard>} />
              <Route path="/period/symptoms" element={<PeriodTrackerGuard><PeriodSymptoms /></PeriodTrackerGuard>} />
              <Route path="/period/analyzing" element={<PeriodTrackerGuard><PeriodAnalyze /></PeriodTrackerGuard>} />
              <Route path="/period/next-period" element={<PeriodTrackerGuard><PeriodNextPeriod /></PeriodTrackerGuard>} />
              <Route path="/period/dashboard" element={<PeriodTrackerGuard><PeriodDashboard /></PeriodTrackerGuard>} />
              <Route path="/period/log-cycle" element={<PeriodTrackerGuard><PeriodLogCycle /></PeriodTrackerGuard>} />
              <Route path="/period/cycle-history" element={<PeriodTrackerGuard><PeriodCycleHistory /></PeriodTrackerGuard>} />
              {/* aliases for older non-prefixed period routes */}
              <Route path="/cycle-history" element={<PeriodTrackerGuard><PeriodCycleHistory /></PeriodTrackerGuard>} />
              <Route path="/cycle-insight" element={<PeriodTrackerGuard><PeriodCycleInsight /></PeriodTrackerGuard>} />
              <Route path="/period/cycle-calendar" element={<PeriodTrackerGuard><PeriodCycleCalendar /></PeriodTrackerGuard>} />
              <Route path="/period/cycle-insight" element={<PeriodTrackerGuard><PeriodCycleInsight /></PeriodTrackerGuard>} />
              <Route
                path="/wellness/*"
                element={
                  <Suspense
                    fallback={
                      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
                        Loading FitFare Wellness...
                      </div>
                    }
                  >
                    <TeamDApp />
                  </Suspense>
                }
              />
            </Route>
            <Route path="/auth/google/success" element={<GoogleCallback />} />
            
            {/* Error Pages Routes - Public routes, accessible without authentication */}
            <Route path="/error/feature-locked" element={<FeatureLocked />} />
            <Route path="/error/maintenance" element={<Maintenance />} />
            <Route path="/error/no-internet" element={<NoInternet />} />
            <Route path="/error/not-allowed" element={<NotAllowed />} />
            <Route path="/error/nothing-to-show" element={<NothingToShow />} />
            <Route path="/error/server-error" element={<ServerError />} />
            <Route path="/error/update-required" element={<UpdateRequired />} />
            <Route path="/error/not-found" element={<NotFoundPage />} />
            
            {/* Error Pages Demo (Development Only) */}
            <Route path="/error-pages-demo" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                {React.createElement(lazy(() => import("./pages/Error_pages/ErrorPagesDemo")))}
              </Suspense>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
        </NutritionProfileProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );

export default App;


