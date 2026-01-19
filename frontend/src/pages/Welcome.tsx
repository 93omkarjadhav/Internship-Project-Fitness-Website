// // src/pages/Welcome.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useNutritionProfile } from "../context/NutritionProfileContext";
import { getUserProfile, getStreakData } from "../teamd/api/api"; // ✅ same helper used in Settings/ProfileSettings
import { useRef } from "react";
import OnboardingTour from "../components/OnboardingTour";
import { Step } from "react-joyride";
import { preloadClubImages, preloadCommonClubImages } from "../utils/imagePreloader";
import ImagePreloader from "../components/ImagePreloader";
import { cycleAPI } from "@/lib/api";
import { parseISO } from "date-fns";
// import Hamburger from 'hamburger-react'
// import { SiBitcoin } from "react-icons/si";
import { GiTwoCoins } from "react-icons/gi";
// import { useNavigate } from "react-router-dom";


/* ========================= TYPES ======================= */

interface User {
  id: number;
  email: string;
  full_name?: string;          // from users table
  profile_image_url?: string;  // from users table
  gender?: string | null;      // from users table
}

interface ProfileData {
  food_preference?: string;
  common_allergies?: string[];
  snack_frequency?: string;
  calorie_intake?: number;
  other_notes?: string;
}

/* ========================= PAGE ======================= */

const Welcome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [streakDays, setStreakDays] = useState<number>(0);
  const [clubsLoading, setClubsLoading] = useState(false); // Start as false for instant display


  // controls desktop layout (and is toggled by the fixed hamburger)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOpen, setOpen] = useState(false)

  // ✅ name + avatar shown in both headers (mobile/desktop)
  const [displayName, setDisplayName] = useState<string>("User");
  const [avatarUrl, setAvatarUrl] = useState<string>("/Avatar-1.png");

  const { updateProfile } = useNutritionProfile();
  const [city, setCity] = useState("Locating...");

  const [cityModalOpen, setCityModalOpen] = useState(false);
  // const allowedCities = ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi"];


  const [manualCity, setManualCity] = useState(
    localStorage.getItem("manual_city") || ""
  );

  const allowedCities = ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi"];
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [activities, setActivities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Set welcomeData on window for components that need it
  useEffect(() => {
    (window as any).welcomeData = {
      activities,
      clubs,
      clubsLoading
    };
    console.log('[Welcome] Updated window.welcomeData:', {
      clubsCount: clubs.length,
      clubsLoading,
      clubs: clubs.slice(0, 2) // Log first 2 clubs
    });
  }, [activities, clubs, clubsLoading]);
  // const [showCityPicker, setShowCityPicker] = useState(false);

  // Onboarding state
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showWelcomeClubsTour, setShowWelcomeClubsTour] = useState(false);







  // Check if user has seen welcome onboarding
  useEffect(() => {
    const hasSeenWelcomeTour = localStorage.getItem("hasSeenWelcomeTour");
    const hasSeenWelcomeClubsTour = localStorage.getItem("hasSeenWelcomeClubsTour");
    if (!hasSeenWelcomeTour) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        setShowWelcomeTour(true);
      }, 1000);
    }
    // Show clubs tour after navigation tour completes
    if (hasSeenWelcomeTour && !hasSeenWelcomeClubsTour) {
      // Wait for elements to be rendered
      const checkAndStartTour = () => {
        const citySelector = document.querySelector('[data-tour="city-selector"]');
        const clubsSection = document.querySelector('[data-tour="clubs-section"]');
        if (citySelector && clubsSection) {
          setTimeout(() => {
            setShowWelcomeClubsTour(true);
          }, 2000);
        } else {
          // Retry after a short delay
          setTimeout(checkAndStartTour, 500);
        }
      };
      setTimeout(checkAndStartTour, 1000);
    }
  }, [clubs.length]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      navigate("/");
      return;
    }

    const fetchStreak = async () => {
      try {
        const response = await getStreakData();
        setStreakDays(response.data?.current_streak || 0);
      } catch (err) {
        console.error("Error fetching streak:", err);
      }
    };

    fetchStreak();

    const fetchUserDataAndProfile = async () => {
      try {
        // 1) Basic identity (often email-only)
        const userRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const me: User = userRes.data.user;
        setUser(me);
        setUserGender(me?.gender || null);

        // provisional fallback until we get full profile
        setDisplayName(me?.full_name || me?.email?.split("@")?.[0] || "User");
        setAvatarUrl(me?.profile_image_url || "/Avatar-1.png");

        // 2) Pull full profile (same API used in Settings/ProfileSettings)
        try {
          const { data } = await getUserProfile();
          if (data?.full_name) setDisplayName(data.full_name);
          if (data?.profile_image_url) setAvatarUrl(data.profile_image_url);
        } catch (e) {
          // keep fallbacks from /auth/me
          console.warn("getUserProfile() failed, using fallback name/avatar:", e);
        }

        // 3) Nutrition profile (unchanged)
        try {
          const profileRes = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (profileRes.data && Object.keys(profileRes.data).length > 0) {
            setHasProfile(true);
            updateProfile(profileRes.data);
          } else {
            setHasProfile(false);
          }
        } catch (profileErr: any) {
          if (profileErr.response?.status === 404) {
            setHasProfile(false);
          } else {
            console.error("Profile fetch error:", profileErr);
            setHasProfile(false);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("auth_token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndProfile();
  }, [navigate, updateProfile]);


  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setActivities(res.data.activities || []);
      })
      .catch((err) => {
        console.error("ACTIVITIES FETCH ERROR:", err);
        setActivities([]);
      });
  }, []);

  // Load cached clubs immediately on mount (INSTANT DISPLAY)
  useEffect(() => {
    // Load cached clubs from localStorage immediately
    const cachedClubs = localStorage.getItem('cached_clubs');
    const cachedCity = localStorage.getItem('cached_clubs_city');
    
    if (cachedClubs && cachedCity) {
      try {
        const clubsData = JSON.parse(cachedClubs);
        console.log(`[INSTANT] Loading ${clubsData.length} cached clubs for ${cachedCity}`);
        setClubs(clubsData);
        setClubsLoading(false);
        
        // Preload images immediately
        preloadClubImages(clubsData);
        
        // Update window data immediately
        (window as any).welcomeData = {
          ...((window as any).welcomeData || {}),
          clubs: clubsData,
          clubsLoading: false
        };
      } catch (e) {
        console.warn('[INSTANT] Failed to parse cached clubs:', e);
      }
    }
    
    // Preload common images immediately when component mounts
    preloadCommonClubImages();
  }, []);

  // Fetch clubs immediately - don't wait for city location
  useEffect(() => {
    const fetchClubs = async () => {
      // Use cached city or default to Pune for instant fetch
      const cityToUse = 
        city && city !== "Locating..." && city !== "Unable to fetch" 
          ? (city === "Pune city" ? "Pune" : city)
          : localStorage.getItem("manual_city") || "Pune"; // Default to Pune for instant load
      
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      try {
        // Fetch clubs immediately without waiting
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=${encodeURIComponent(cityToUse)}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000 // Increased timeout for reliability
          }
        );

        const clubsData = res.data.clubs || res.data.data || [];
        console.log(`[FETCH] Loaded ${clubsData.length} clubs for ${cityToUse}`);
        
        // Update state immediately
        setClubs(clubsData);
        setClubsLoading(false);
        
        // Cache clubs for instant loading on next visit
        localStorage.setItem('cached_clubs', JSON.stringify(clubsData));
        localStorage.setItem('cached_clubs_city', cityToUse);
        
        // Preload all club images immediately for zero load delay
        preloadClubImages(clubsData);
        
        // Force update window.welcomeData immediately
        (window as any).welcomeData = {
          ...((window as any).welcomeData || {}),
          clubs: clubsData,
          clubsLoading: false
        };
      } catch (err: any) {
        console.error("CLUB FETCH ERROR:", err);
        // Keep cached clubs if fetch fails
        const cachedClubs = localStorage.getItem('cached_clubs');
        if (cachedClubs) {
          try {
            const clubsData = JSON.parse(cachedClubs);
            setClubs(clubsData);
            preloadClubImages(clubsData);
          } catch (e) {
            // If cache is invalid, keep empty array
          }
        }
        setClubsLoading(false);
      }
    };

    // Fetch immediately on mount, then refetch when city changes
    fetchClubs();
  }, [city]);


  // useEffect(() => {
  //   const token = localStorage.getItem("auth_token");

  //   axios
  //     .get(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=Mumbai`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     )
  //     .then((res) => {
  //       console.log("CLUBS RESPONSE:", res.data);
  //       setClubs(res.data.clubs || []);
  //     })
  //     .catch((err) => {
  //       console.error("CLUBS FETCH ERROR:", err);
  //       setClubs([]);
  //     });
  // }, []);



  useEffect(() => {
    setCity("Locating..."); // reset before fetching

    if (!navigator.geolocation) {
      setCity("Unable to fetch");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const token = localStorage.getItem("auth_token");

          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await res.json();
          if (!data) return setCity("Unable to fetch");

          let location =
            data?.address?.city ||
            data?.address?.state_district ||
            data?.address?.county ||
            data?.address?.state ||
            null;

          if (!location) return setCity("Unable to fetch");

          // Force Pune city merge
          if (
            data?.address?.state_district?.toLowerCase().includes("pune city") ||
            data?.address?.city?.toLowerCase().includes("pune city") ||
            data?.address?.county?.toLowerCase().includes("pune city")
          ) {
            location = "Pune";
          }

          const manual = localStorage.getItem("manual_city");

          if (manual) {
            setCity(manual); // user override
          } else {
            setCity(location); // auto-location
          }

        } catch (err) {
          console.error("Location error:", err);
          setCity("Unable to fetch");
        }
      },
      () => setCity("Unable to fetch"),
      { enableHighAccuracy: true }
    );
  }, []);








  const handleSignOut = () => {
    setSigningOut(true);
    setTimeout(() => {
      localStorage.removeItem("auth_token");
      toast.success("Signed out successfully");
      navigate("/", { replace: true });
    }, 1500);
  };
  const handleBookNow = (club: any) => {
    try {
      // Get existing cart from localStorage
      const existingCart = localStorage.getItem("cartClubs");
      const cartClubs = existingCart ? JSON.parse(existingCart) : [];

      // Check if club already exists in cart
      const existingIndex = cartClubs.findIndex((c: any) => c.id === club.id);
      
      if (existingIndex === -1) {
        // Add club to cart with proper format for /bookings page
        const cartClub = {
          id: club.id,
          title: club.title || club.name || "Unknown Club",
          subtitle: club.subtitle || getSubtitleForClub(club),
          description: club.description || "",
          image: club.image_url || "/card-img.png",
          price_per_day: club.price_per_day || 40,
        };
        
        cartClubs.push(cartClub);
        localStorage.setItem("cartClubs", JSON.stringify(cartClubs));
        toast.success("Added to cart!");
      } else {
        toast.info("Club already in cart");
      }

      // Navigate to bookings page
      navigate("/bookings");
    } catch (err: any) {
      console.error("CART ERROR:", err);
      toast.error("Could not add to cart. Try again.");
    }
  };

  // Helper function to get subtitle based on club name
  const getSubtitleForClub = (club: any) => {
    const name = (club.title || club.name || "").toLowerCase();
    if (name.includes("gold")) return "Premium Fitness Training";
    if (name.includes("multifit")) return "Functional & Group Training";
    if (name.includes("anytime")) return "24×7 Personalized Training";
    return "Fitness Training";
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  /* ---------------- ONBOARDING STEPS ---------------- */
  const welcomeTourSteps: Step[] = [
    // Step 1: Track Your Period (only for female users)
    ...(userGender === 'Female' || userGender === null ? [{
      target: '[data-tour="periods-cycle"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Track Your Period</h3>
          <p className="text-sm text-gray-600">
            Click here to log your period and keep track of your cycle. Get personalized insights and predictions!
          </p>
        </div>
      ),
      placement: 'right' as const,
      disableBeacon: true,
    }] : []),
    // Step 2: Track Your Nutrition (always)
    {
      target: '[data-tour="nutrition"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Track Your Nutrition</h3>
          <p className="text-sm text-gray-600">
            Click here to manage your nutrition, set calorie goals, log meals, and see your progress. Keep your health on track!
          </p>
        </div>
      ),
      placement: 'right' as const,
    },
    // Step 3: Ask Queries to Our AI Assistant (always)
    {
      target: '[data-tour="ai-assistant"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Ask Queries to Our AI Assistant</h3>
          <p className="text-sm text-gray-600">
            Get instant answers to your health, fitness, and nutrition questions from our AI assistant. Ask anything!
          </p>
        </div>
      ),
      placement: 'right' as const,
    },
  ];

  const handleWelcomeTourComplete = () => {
    localStorage.setItem('hasSeenWelcomeTour', 'true');
    setShowWelcomeTour(false);
    // Trigger clubs tour after navigation tour with delay
    // Ensure all required elements exist before starting, especially the FIRST step target
    const startClubsTour = () => {
      const clubsSection = document.querySelector('[data-tour="clubs-section"]');
      const addToCart = document.querySelector('[data-tour="add-to-cart"]');

      console.log('🔍 Checking tour elements:', {
        clubsSection: !!clubsSection,
        addToCart: !!addToCart
      });

      // CRITICAL: First step target (clubs-section) MUST exist
      if (!clubsSection) {
        console.error('❌ CRITICAL: clubs-section element NOT FOUND! Cannot start tour at step 1.');
        console.error('Retrying in 500ms...');
        setTimeout(startClubsTour, 500);
        return;
      }

      // Log element details for debugging
      if (clubsSection) {
        console.log('✅ clubs-section found:', {
          tagName: clubsSection.tagName,
          isVisible: (clubsSection as HTMLElement).offsetParent !== null
        });
        // Ensure it's visible
        clubsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (clubsSection) {
        console.log('✅ Required tour elements found, starting clubs tour from STEP 1 (Browse Fitness Clubs)');
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          setShowWelcomeClubsTour(true);
        }, 300);
      } else {
        console.warn('⚠️ Tour elements not found, retrying...', {
          clubsSection: !!clubsSection
        });
        // Retry after a short delay if elements not found
        setTimeout(startClubsTour, 500);
      }
    };

    // Start checking after a delay to ensure page is fully rendered
    setTimeout(startClubsTour, 2000);
  };

  // Welcome Clubs Tour Steps
  const welcomeClubsTourSteps: Step[] = [
    {
      target: '[data-tour="clubs-section"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Browse Fitness Clubs</h3>
          <p className="text-sm text-gray-600">
            Explore fitness clubs near you! Each club shows price, location, and facilities. Click on a club to see more details.
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableOverlayClose: true,
    },
    {
      target: '[data-tour="add-to-cart"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Add to Cart</h3>
          <p className="text-sm text-gray-600">
            Click "Add to cart" to book a fitness club. You can manage all your bookings in the "My Bookings" section!
          </p>
        </div>
      ),
      placement: 'top' as const,
      disableOverlayClose: true,
    },
  ];

  const handleWelcomeClubsTourComplete = () => {
    localStorage.setItem('hasSeenWelcomeClubsTour', 'true');
    setShowWelcomeClubsTour(false);
  };

  /* ---------------- LAYOUT ---------------- */

  const lowerSearch = searchTerm.trim().toLowerCase();
  const baseClubs = clubs.map((c) => ({
    ...c,
    name: c.name || c.title || "",
  }));
  const filteredClubs = lowerSearch
    ? baseClubs.filter(
      (c: any) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        (c.location || "").toLowerCase().includes(lowerSearch)
    )
    : baseClubs;

  (window as any).welcomeData = {
    activities,
    clubs: filteredClubs,
    clubsLoading,
  };

  {/* ========= CITY PICKER MODAL ========= */ }



  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {/* Preload images immediately */}
      <ImagePreloader clubs={clubs} />
      {/* ========= CITY PICKER MODAL ========= */}
      {showCityPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={() => setShowCityPicker(false)}
          />

          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-4 md:p-6 z-[210] max-h-[80vh] overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Select Your City
            </h2>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {allowedCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      localStorage.setItem("manual_city", c);
                      setCity(c);
                      setShowCityPicker(false);
                      // Trigger clubs fetch for new city
                      const token = localStorage.getItem("auth_token");
                      const fixedCity = c === "Pune city" ? "Pune" : c;
                      axios
                        .get(
                          `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=${encodeURIComponent(fixedCity)}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        )
                        .then((res) => {
                          setClubs(res.data.clubs || []);
                        })
                        .catch((err) => {
                          console.error("CLUB FETCH ERROR:", err);
                          setClubs([]);
                        });
                    }}
                    className="w-full py-3 md:py-2 rounded-lg border border-gray-300
                         hover:bg-blue-50 hover:border-blue-600 transition text-left px-4 text-sm md:text-base"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowCityPicker(false)}
              className="mt-4 text-center w-full text-gray-600 underline"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ===== FIXED HAMBURGER (does NOT move with sidebar) ===== */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed w-5 h-5 top-5 left-6 z-[400] bg-white p-2  md:flex hidden transition"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar (controls desktop width) */}
      <Sidebar sidebarOpen={sidebarOpen} userGender={userGender} />

      {/* Welcome Onboarding Tour */}
      <OnboardingTour
        steps={welcomeTourSteps}
        run={showWelcomeTour}
        onComplete={handleWelcomeTourComplete}
        onSkip={handleWelcomeTourComplete}
      />

      {/* Welcome Clubs Onboarding Tour */}
      <OnboardingTour
        key={`clubs-tour-${showWelcomeClubsTour}`}
        steps={welcomeClubsTourSteps}
        run={showWelcomeClubsTour}
        onComplete={handleWelcomeClubsTourComplete}
        onSkip={handleWelcomeClubsTourComplete}
        spotlightClicks={false}
      />

      {/* ======= MOBILE VIEW ======= */}
      <div className="block md:hidden w-full h-full overflow-y-auto">
        <div className="px-0">
          <HomeContentMobile
            user={user}
            onLogout={handleSignOut}
            displayName={displayName}
            avatarUrl={avatarUrl}
            city={city}
            userGender={userGender}
            onCityClick={() => setShowCityPicker(true)}
            setShowCityPicker={setShowCityPicker}
            streakDays={streakDays}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            setCity={setCity}
            allowedCities={allowedCities}
            setClubs={setClubs}
            clubs={clubs}
            clubsLoading={clubsLoading}
            handleBookNow={handleBookNow} 
          />
          {/* <HomeContentMobile
  user={user}
  onLogout={handleSignOut}
  displayName={displayName}
  avatarUrl={avatarUrl}
  city={city}
  setShowCityPicker={setShowCityPicker}
/> */}

        </div>
      </div>

      {/* ======= DESKTOP VIEW ======= */}
      <div
        className={`hidden md:flex md:flex-col h-full transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-20"
          }`}
      >
        {/* Top bar (non-scrolling) */}
        <DesktopTopBar
          user={user}
          displayName={displayName}
          city={city}
          streakDays={streakDays}
          onCityClick={() => setShowCityPicker(true)}
          setShowCityPicker={setShowCityPicker}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-24">
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT COLUMN */}
            <div className="col-span-7 space-y-6">
              <ActivitySectionDesktop />
              <ClubsBlock handleBookNow={handleBookNow} clubs={clubs} clubsLoading={clubsLoading} />

            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-5 space-y-6">
              {/* 👉 Desktop nutrition card */}
              <NutritionSection variant="desktop" />
              {userGender === 'Female' || userGender === null ? <CycleSection /> : null}
            </div>

            {/* FULL WIDTH ROWS */}
            <div className="col-span-12">
              <DoctorAppointmentCard />
            </div>
            <div className="col-span-12">
              <FAQsCard />
            </div>
            <div className="col-span-12">
              <TestimonialsSection />
            </div>
            {/* <div className="col-span-12"><AIHealthAssistantCard /></div> */}
            <div className="col-span-12">
              <RateAppCard />
            </div>
            <div className="col-span-12">
              {/* <SupportCard /> */}
              <div className="block mt-4 justify-center flex gap-2 items-center"
              >
                contact us at
                <a
                  href="mailto:fitfaresupport@gmail.com"
                  className="flex gap-1 text-blue-600"
                >
                  fitfaresupport@gmail.com
                  <img src="arrow right.png" className="h-5 mt-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-out overlay */}
      {signingOut && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center z-[90]">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl font-semibold mt-4">Signing out...</p>
        </div>
      )}
    </div>
  );
};

export default Welcome;

/* ========================= MOBILE CONTENT ======================= */

const HomeContentMobile = ({
  user,
  onLogout,
  displayName,
  avatarUrl,
  city,
  userGender,
  onCityClick,
  setShowCityPicker,
  streakDays,
  searchTerm,
  onSearchChange,
  setCity,
  allowedCities,
  setClubs,
  clubs,
  clubsLoading,
  handleBookNow
}: {
  user: User;
  onLogout: () => void;
  displayName: string;
  avatarUrl: string;
  city: string;
  userGender: string | null;
  onCityClick: () => void;
  setShowCityPicker: (value: boolean) => void;
  streakDays: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  setCity: (city: string) => void;
  allowedCities: string[];
  setClubs: (clubs: any[]) => void;
  clubs: any[];
  clubsLoading: boolean;
  handleBookNow: (club: any) => void; 
}) => {
  return (
    <div className="w-full">
      {/* Mobile header */}

      <Header
        displayName={displayName}
        avatarUrl={avatarUrl}
        city={city}
        onCityClick={onCityClick}
        setShowCityPicker={setShowCityPicker}
        streakDays={streakDays}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        setCity={setCity}
        allowedCities={allowedCities}
        setClubs={setClubs}
      />

      {/* Mobile Wallet - Add below header */}
      {/* <div className="md:hidden px-4 mt-4 mb-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
          <GiTwoCoins size={24} color="gold" />
          <span className="font-semibold text-gray-900 text-sm">0</span>
        </div>
      </div> */}

      <div className="px-4 mt-6 pb-28">
        {/* pb avoids overlap with fixed bottom nav */}
        <ActivitySectionMobile />
        <div className="mb-6"></div>
        <DynamicClubSectionMobile
  clubs={clubs}
  clubsLoading={clubsLoading}
  handleBookNow={handleBookNow}
/>
        <div className="mb-6"></div>

        {/* 👉 Mobile nutrition card */}
        <NutritionSection variant="mobile" />
        <div className="mb-4"></div>
        {userGender === 'Female' || userGender === null ? <CycleSection /> : null}
        <DoctorAppointmentCard />
        <div className="mt-4"></div>
        <FAQsCard />
        <TestimonialsSection />
        {/* <AIHealthAssistantCard /> */}
        <div className="mt-10"></div>
        <RateAppCard />
        <div className="mt-10">
          <SupportCard />
        </div>
      </div>
    </div>
  );
};

/* ========================= MOBILE HEADER ======================= */

const Header = ({
  displayName,
  avatarUrl,
  city,
  onCityClick,
  setShowCityPicker,
  streakDays,
  searchTerm,
  onSearchChange,
  setCity,
  allowedCities,
  setClubs
}: {
  displayName: string;
  avatarUrl: string;
  city: string;
  onCityClick: () => void;
  setShowCityPicker: (value: boolean) => void;
  streakDays: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  setCity: (city: string) => void;
  allowedCities: string[];
  setClubs: (clubs: any[]) => void;
}) => (
  <div className="bg-[#2563EB] rounded-b-[50px] p-5 pb-10 text-white">
    {/* Top row: avatar • Hi, Name • bell */}
    <div className="flex items-center justify-between mb-6">
      <img
        src={avatarUrl}
        className="w-10 h-10 rounded-full object-cover"
        alt="avatar"
      />
      <p className="text-white text-lg font-semibold truncate max-w-[55%] text-center">
        Hi, {displayName}
      </p>
      {/* <Link to="/notification">
        <img src="/bell-w.png" className="w-6 h-6" />
      </Link> */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.location.href = "/wellness/settings/streak"}
          className="bg-white/20 rounded-full px-3 py-2 flex items-center gap-1.5 shadow"
        >
          <img src="/yellow-tick.png" className="w-4 h-4 md:w-5 md:h-6" />
          <span className="text-white font-semibold text-[12px] md:text-[13px]">
            {streakDays === 0 ? (
              <span className="flex items-center gap-1">
                <span className="text-red-500 text-lg">✕</span>
                <span>0</span>
              </span>
            ) : (
              `${streakDays} day${streakDays !== 1 ? "s" : ""}`
            )}
          </span>
        </button>

      </div>
    </div>

    {/* FitFare card */}
    {/* <div className="p-4 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold">
          <img src="k-icon.png" />
        </div>
        <div>
          <p className="font-semibold mb-1 text-lg">FitFare Score</p>
          <div className="flex items-center gap-2">
            <img src="heart.png" />
            <p className="opacity-90 text-sm">Healthy</p>
            <img src="magic-sparkle.png" />
            <p className="opacity-90 text-sm">Plus Member</p>
          </div>
        </div>
      </div>
      <img src="/chevron-right.png" />
    </div> */}
    {/* Coins + Streak for mobile */}

    {/* Coins */}
    {/* <div className="flex items-center gap-2">
    <img src="/coin.png" className="w-6 h-6" />
    <span className="text-white font-semibold text-sm">0</span>
  </div> */}

    {/* Streak */}
    {/* <button
    onClick={() => window.location.href = "/wellness/settings/streak"}
    className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-xl shadow text-orange-700"
  >
    <img src="/yellow-tick.png" className="w-4 h-4" />
    <span className="font-semibold text-sm">  {JSON.parse(localStorage.getItem("streak") || "0")} day</span>
  </button> */}



    {/* Search */}
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between border border-gray-200 dark:border-gray-600">
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
          <img src="/search-Icon.png" className="w-5 h-5 opacity-70 dark:opacity-90 dark:invert flex-shrink-0" />
        </div>
        <input
          type="text"
          placeholder="Search fitness clubs..."
          className="ml-3 w-full outline-none text-black dark:text-white bg-transparent placeholder-gray-500 dark:placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-xs font-medium flex-shrink-0 ml-2">
        <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
          <img src="/mapIcon.jpg" className="w-3.5 h-4 mt-0.5 dark:invert" />
        </div>

        <button
          onClick={() => setShowCityPicker(true)}
          data-tour="city-selector"
          className="underline text-blue-600 dark:text-blue-400 whitespace-nowrap"
        >
          {city}
        </button>
      </div>

    </div>

  </div>
);

/* ========================= DESKTOP TOP BAR ======================= */

const DesktopTopBar = ({
  user,
  displayName,
  city,
  streakDays,
  onCityClick,
  setShowCityPicker,
  searchTerm,
  onSearchChange
}: {
  user: User;
  displayName: string;
  city: string;
  streakDays: number;
  onCityClick: () => void;
  setShowCityPicker: (value: boolean) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="
        sticky top-0 z-30 
        bg-white/40 dark:bg-gray-800/90
        backdrop-blur-md 
        supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-gray-800/90
        border-b border-white/20 dark:border-gray-700
      "
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 w-[650px] backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-white dark:border-gray-600">

              <div className="flex items-center flex-1 min-w-0">
                <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
                  <img src="/search-Icon.png" className="w-5 h-5 opacity-70 dark:opacity-90 dark:invert flex-shrink-0" />
                </div>
                <input
                  type="text"
                  placeholder="Search for Clubs and Events..."
                  className="ml-3 flex-1 min-w-0 outline-none text-gray-900 dark:text-white placeholder:text-gray-700 dark:placeholder:text-gray-400 bg-transparent"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>


              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
                  <img src="/mapIcon.jpg" className="w-3.5 h-4 mt-0.5 dark:invert" />
                </div>

                <button
                  onClick={() => setShowCityPicker(true)}
                  data-tour="city-selector"
                  className="underline text-blue-700 dark:text-blue-400"
                >
                  {city}
                </button>
              </div>

            </div>

          </div>

          <div></div>
          {/* Right side: greeting + bell */}
          <div className="ml-6 flex items-center gap-6 flex-nowrap flex-shrink-0">

            {/* ⭐ Subscription / Wallet Block with Streak */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* <button
                onClick={() => navigate("/subscription")}
                className="flex items-center gap-2 border border-blue-600 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition"
              >
                <img src="/sub-icon.png" className="w-5 h-5" />
                <SiBitcoin size={32} />
                <GiTwoCoins size={32} color="gold" />
                <span className="font-semibold text-gray-900 text-sm"> 0</span>
              </button> */}

              {/* ⭐ Streak Fire Icon - Beside coin */}
              <button
                onClick={() => navigate("/wellness/settings/streak")}
                className="flex items-center gap-2 border border-orange-500 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition bg-orange-50 whitespace-nowrap"
              >
                <span className="h-4 w-4 -mt-1"><img src="/yellow-tick.png" alt="" /></span>
                <span className="font-semibold text-orange-600 text-sm">{streakDays} day{streakDays !== 1 ? 's' : ''}</span>
              </button>
            </div>


            {/* Existing greeting + bell */}
            <div className="flex items-center gap-3 whitespace-nowrap ">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                Hi, <span className="font-semibold">{displayName}</span>
              </span>

              {/* <Link
                to="/notification"
                className="w-10 h-10 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow flex items-center justify-center"
              >
                <img src="/bell.png" className="w-5 h-5" />
              </Link> */}
              <Link
                to="/wellness/settings"
                className="w-10 h-10 rounded-full overflow-hidden border border-white/40 dark:border-gray-600 shadow"
              >
                <img
                  src={user.profile_image_url || "/Avatar-1.png"}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/Avatar-1.png";
                  }}
                />
              </Link>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

/* ========================= BLOCKS ======================= */

/* ----- Activity: mobile (unchanged) ----- */
const ActivitySectionMobile = () => {
  const { activities } = (window as any).welcomeData;

  const loopList = [...activities, ...activities];
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg text-gray-900">Activity</h2>
        <Link to="/activities" className="text-blue-600 text-sm font-medium">
          See All
        </Link>
      </div>

      <div
        className={`relative overflow-x-auto ${autoScroll ? "scrollbar-none" : ""}`}
        onClick={() => setAutoScroll(false)}
      >
        <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite" : ""}`}>
          {loopList.map((a: any, i: number) => (
            <ActivityCard
              key={i}
              title={a.title}
              image={a.image_url}
            />
          ))}
        </div>
      </div>
    </>
  );
};


/* ----- Activity: desktop (safer widths; no overflow) ----- */
const ActivitySectionDesktop = () => {
  const { activities } = (window as any).welcomeData;
  const loopList = [...activities, ...activities];
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-lg text-gray-900">Activity</h2>
      </div>

      <div className="relative overflow-x-auto scrollbar-none"
        onClick={() => setAutoScroll(false)}>
        <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite" : ""}`}>
          {loopList.map((a: any, i: number) => (
            <ActivityCard
              key={i}
              title={a.title}
              image={a.image_url}
            />
          ))}
        </div>
      </div>
    </>
  );
};





const ActivityCard = ({
  title,
  mobile = false,
  image,
}: {
  title: string;
  mobile?: boolean;
  image?: string;
}) => {
  // Fallback for Calisthenics image
  const getImageSrc = () => {
    if (title.toLowerCase() === "calisthenics") {
      return "/fitness_calesthenics.jpeg";
    }
    return image || "/strength-img.png";
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-700 rounded-2xl shadow-sm p-4 flex items-center gap-4 
        border-2 border-white dark:border-white
        ${mobile ? "min-w-[85%]" : "min-w-[380px]"} 
        overflow-hidden
      `}
    >
      <div className="flex-1 min-w-0 h-40">
        <p className="text-[16px] mt-14 text-blue-700 dark:text-blue-400 font-semibold leading-tight truncate">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 truncate">
          Let's start tracking your activity for better health.
        </p>
      </div>

      <div className="w-36 h-32 flex-shrink-0 rounded-xl overflow-hidden">
        <img
          src={getImageSrc()}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    </div>
  );
};


const ClubSection = ({ title, handleBookNow }: { title: string; handleBookNow: (club: any) => void }) => {
  const { clubs } = (window as any).welcomeData;
  const navigate = useNavigate();
  return (
    <div className="mb-8" data-tour="clubs-section">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Link to="/clubs">
          <p className="text-[#2563EB] text-sm font-medium">See All</p>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        {clubs.slice(0, 2).map((c: any, index: number) => (
          <div
            key={c.id}
            onClick={() => navigate(`/clubs/${c.id}`, { state: { club: c } })}
            className="
            bg-white rounded-2xl shadow p-3 border border-gray-100
            cursor-pointer hover:shadow-lg transition
          "
          >
            <img
              src={c.image_url || "/card-img.png"}
              className="w-full h-28 rounded-xl object-cover"
              style={{ 
                filter: 'none',
                imageRendering: 'auto' as const
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            <p className="font-semibold text-[12px] mt-2 text-blue-500">
              {c.title}
            </p>

            <p className="text-[11px] mb-2 line-clamp-2">
              {c.description}
            </p>

            <div className="text-[12px] flex items-center justify-between">
              <span className="font-semibold">
                Rs.{c.price_per_day}/Day
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 IMPORTANT
                  handleBookNow(c);
                }}
                data-tour={index === 0 ? "add-to-cart" : undefined}
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700"
              >
                Add to cart
              </button>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

/* A condensed clubs block for desktop left column */
const ClubsBlock = ({ handleBookNow, clubs: propsClubs, clubsLoading: propsClubsLoading }: { 
  handleBookNow: (club: any) => void;
  clubs?: any[];
  clubsLoading?: boolean;
}) => {
  // Use props first, fallback to window.welcomeData
  const welcomeData = (window as any).welcomeData || {};
  const clubs = propsClubs || welcomeData.clubs || [];
  const clubsLoading = propsClubsLoading !== undefined ? propsClubsLoading : (welcomeData.clubsLoading || false);
  
  console.log('[ClubsBlock] Rendering with:', { 
    clubsCount: clubs.length, 
    clubsLoading, 
    hasProps: !!propsClubs,
    clubs: clubs.slice(0, 2) 
  });

  if (clubsLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {/* Spinner */}
        <div className="h-8 w-8 mt-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        {/* Text */}
        <p className="text-gray-600 font-medium text-sm text-center">
          📍 Fetching nearby clubs & events...
        </p>
      </div>

    );
  }
  if (!clubs || clubs.length === 0) {
    return (
      <div className="text-center text-lg">
        <p className="text-gray-700 mt-14">
          Sorry...!  No clubs or eventst available for this locaion.
        </p>
      </div>
    );
  }

  // Group clubs by price
  const grouped = clubs.reduce((acc: any, c: any) => {
    const price = c.price_per_day;
    if (!acc[price]) acc[price] = [];
    acc[price].push(c);
    return acc;
  }, {});

  // Sort price groups like 30, 40, 50, 70...
  const sortedPrices = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-8" data-tour="clubs-section">
      {sortedPrices.map((price, priceIndex) => (
        <DynamicClubSection
          key={price}
          price={price}
          clubs={grouped[price].slice(0, 2)}   // show only 2
          fullClubs={grouped[price]}
          handleBookNow={handleBookNow}          // pass full list
          isFirstSection={priceIndex === 0}
        />

      ))}
    </div>
  );
};
const DynamicClubSection = ({
  price,
  clubs,
  fullClubs,
  handleBookNow,
  isFirstSection
}: {
  price: string;
  clubs: any[];
  fullClubs: any[];
  handleBookNow: (club: any) => void;
  isFirstSection?: boolean;
}) => {
  const navigate = useNavigate(); // ✅ ADD THIS

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          Clubs at Rs. {price}/Day
        </h3>

        <Link
          to={`/clubs?price=${price}`}
          state={{ clubs: fullClubs }}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {clubs.map((c: any, index: number) => (
          <div
            key={c.id}
            onClick={() => navigate(`/clubs/${c.id}`, { state: { club: c } })} // ✅ ADD THIS
            className="
              bg-white rounded-2xl shadow p-3 border border-gray-100
              cursor-pointer hover:shadow-lg transition
            "
          >
            <img
              src={c.image_url || "/card-img.png"}
              className="w-full h-28 rounded-xl object-cover"
              style={{ 
                filter: 'none',
                imageRendering: 'auto' as const
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />

            <p className="font-semibold text-[12px] mt-2 text-blue-500">
              {c.title}
            </p>

            <p className="text-[11px] mb-2 line-clamp-2">
              {c.description}
            </p>

            <div className="text-[12px] flex items-center justify-between">
              <span className="font-semibold">
                Rs.{c.price_per_day}/Day
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // ✅ VERY IMPORTANT
                  handleBookNow(c);
                }}
                data-tour={isFirstSection && index === 0 ? "add-to-cart" : undefined}
                className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-700"
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


/* ================= MOBILE: DYNAMIC CLUB SECTION ================= */

const DynamicClubSectionMobile = ({
  clubs,
  clubsLoading,
  handleBookNow
}: {
  clubs: any[];
  clubsLoading: boolean;
  handleBookNow: (club: any) => void;
}) => {

  const navigate = useNavigate();
  console.log('[DynamicClubSectionMobile] Rendering with:', { clubsCount: clubs?.length || 0, clubsLoading, clubs: clubs?.slice(0, 2) });

  // Don't show loading spinner - just show clubs or empty message
  if (!clubs || clubs.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-700 mt-14">
          Sorry...! No clubs available for this location.
        </p>
      </div>
    )
  }
  // group by price
  const grouped = clubs.reduce((acc: any, c: any) => {
    const price = c.price_per_day;
    if (!acc[price]) acc[price] = [];
    acc[price].push(c);
    return acc;
  }, {});

  const sortedPrices = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6 mt-6" data-tour="clubs-section">

      {sortedPrices.map((price) => (
        <div key={price}>

          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              Clubs at Rs. {price}/Day
            </h3>
            <Link
              to={`/clubs?price=${price}`}
              state={{ clubs: grouped[price] }}
              className="text-blue-600 text-xs font-medium"
            >
              See All
            </Link>
          </div>

          {/* MOBILE GRID */}
          <div className="grid grid-cols-2 gap-4">
            {grouped[price].slice(0, 3).map((c: any) => (
              <div
                key={c.id}
                onClick={() => navigate(`/clubs/${c.id}`, { state: { club: c } })}
                className="bg-white rounded-2xl shadow p-3 border border-gray-100 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
              >
                <img 
                  src={c.image_url || "/card-img.png"} 
                  className="w-full h-24 rounded-xl object-cover" 
                  style={{ 
                    filter: 'none',
                    imageRendering: 'auto' as const,
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden' as const
                  }}
                  loading="lazy"
                  decoding="async"
                />
                <p className="font-semibold text-[12px] mt-2 text-blue-500">{c.title || c.name}</p>
                <p className="text-[11px] mb-1 line-clamp-2">{c.description}</p>

                <div className="flex items-center justify-between mt-1 text-[11px]">
  <span className="font-semibold">
    Rs {c.price_per_day}/Day
  </span>

  <button
    onClick={(e) => {
      e.stopPropagation(); // 🔥 VERY IMPORTANT
      handleBookNow(c);
    }}
    className="bg-blue-600 text-white text-[10px] font-semibold px-2 py-1 rounded-xl hover:bg-blue-700 active:scale-95"
  >
    Add to cart
  </button>
</div>


                <div className="flex gap-1 mt-1">
                  {Array(Math.round(c.rating)).fill(0).map((_, i) => (
                    <img key={i} src="/Star.png" className="w-3 h-3" />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}

    </div>
  );
};


/* ---------------- NUTRITION (REAL DB) ---------------- */

/** Fetch once per instance; we render different UIs via variant */
const NutritionSection = ({ variant }: { variant: "mobile" | "desktop" }) => {
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/insight`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setInsight(res.data))
      .catch(() =>
        setInsight({
          consumedCalories: 0,
          targetCalories: 0,
          protein: { consumed: 0, target: 0 },
          fat: { consumed: 0, target: 0 },
          carbs: { consumed: 0, target: 0 },
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow">
        Loading nutrition...
      </div>
    );
  }

  if (!insight) return null;

  // keep a single geometry; we scale via viewBox + width/height per variant
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = insight.targetCalories
    ? Math.min((insight.consumedCalories / insight.targetCalories) * 100, 100)
    : 0;
  const offset = circumference - (progress / 100) * circumference;

  const noInsight =
    insight.consumedCalories === 0 &&
    insight.protein?.consumed === 0 &&
    insight.fat?.consumed === 0 &&
    insight.carbs?.consumed === 0;

  if (noInsight) {
    return (
      <div className="mt-3 text-lg font-semibold">
        Nutrition
        <div className="bg-white mt-2 rounded-2xl shadow-md p-4 md:p-6">

          <div className="text-center text-gray-500 text-sm">
            No nutrition data available yet.
            <Link
              to="/add-meal-manually"
              className="text-blue-500 font-semibold block mt-2"
            >
              Log Your First Meal →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // sizes per your choice B: Mobile w-36/h-36, Desktop w-48/h-48
  const svgSizeClass = variant === "mobile" ? "w-36 h-36" : "w-48 h-48";

  return (
    <div className="mt-2 md:mt-0 min-w-0">
      {variant === "mobile" && (
        <>
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Nutrition</h2>
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center px-1">
              <div className="text-center flex-1">
                <p className="text-gray-700 font-semibold text-base">
                  {insight.consumedCalories}
                </p>
                <p className="text-gray-500 text-xs">consumed</p>
              </div>

              <div className="relative flex items-center justify-center flex-1">
                <svg viewBox="0 0 144 144" className={`${svgSizeClass} -rotate-90`}>
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#2563EB"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {insight.consumedCalories}
                    </p>
                    <p className="text-gray-500 text-xs">kcal total</p>
                  </div>
                </div>
              </div>

              <div className="text-center flex-1">
                <p className="text-gray-700 font-semibold text-base">
                  {insight.targetCalories}
                </p>
                <p className="text-gray-500 text-xs">target</p>
              </div>
            </div>

            {/* MACROS */}
            <div className="flex justify-between px-2 mt-6 text-gray-700 font-medium text-sm">
              <span>Protein</span>
              <span>Fat</span>
              <span>Carbs</span>
            </div>

            <div className="flex justify-between px-2 mt-3 gap-3">
              <MacroBar
                colorClass="bg-red-500"
                consumed={insight.protein.consumed}
                target={insight.protein.target}
                label="Protein"
              />
              <MacroBar
                colorClass="bg-green-600"
                consumed={insight.fat.consumed}
                target={insight.fat.target}
                label="Fat"
              />
              <MacroBar
                colorClass="bg-yellow-400"
                consumed={insight.carbs.consumed}
                target={insight.carbs.target}
                label="Carbs"
              />
            </div>

            <Link
              to="/nutrition/home"
              className="text-blue-600 flex font-semibold text-sm mt-4 justify-center gap-2"
            >
              See Nutrition Dashboard
              <img src="/arrow right.png" className="w-4 h-4 mt-0.5" />
            </Link>
          </div>
        </>
      )}

      {variant === "desktop" && (
        <>
          <h2 className="font-semibold text-lg text-gray-900 mb-3">Nutrition</h2>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="grid grid-cols-3 items-center gap-4 px-2">
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">
                  {insight.consumedCalories}
                </p>
                <p className="text-gray-500 text-sm">consumed</p>
              </div>

              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 144 144" className={`${svgSizeClass} -rotate-90`}>
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    stroke="#2563EB"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {insight.consumedCalories}
                  </p>
                  <p className="text-gray-500 text-sm">kcal total</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">
                  {insight.targetCalories}
                </p>
                <p className="text-gray-500 text-sm">target</p>
              </div>
            </div>

            {/* MACROS */}
            <div className="flex justify-between px-2 mt-6 text-gray-700 font-medium text-sm">
              <span>Protein</span>
              <span>Fat</span>
              <span>Carbs</span>
            </div>

            <div className="flex justify-between px-2 mt-3 gap-3">
              <MacroBar
                colorClass="bg-red-500"
                consumed={insight.protein.consumed}
                target={insight.protein.target}
                label="Protein"
              />
              <MacroBar
                colorClass="bg-green-600"
                consumed={insight.fat.consumed}
                target={insight.fat.target}
                label="Fat"
              />
              <MacroBar
                colorClass="bg-yellow-400"
                consumed={insight.carbs.consumed}
                target={insight.carbs.target}
                label="Carbs"
              />
            </div>

            <Link
              to="/nutrition-dashboard"
              className="text-blue-600 flex font-semibold text-sm mt-4 justify-center gap-2"
            >
              See Nutrition Dashboard
              <img src="/arrow right.png" className="w-4 h-4 mt-0.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

const MacroBar = ({
  colorClass,
  consumed,
  target,
  label,
}: {
  colorClass: string;
  consumed: number;
  target: number;
  label: string;
}) => (
  <div className="flex-1">
    <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
      <div
        className={`h-full ${colorClass} rounded-full`}
        style={{
          width: `${target ? Math.min((consumed / target) * 100, 100) : 0}%`,
        }}
      />
    </div>
    <p className="text-gray-700 text-xs font-bold text-center">
      {consumed}/{target}g
    </p>
  </div>
);

const CycleSection = () => {
  const [recentCycles, setRecentCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await cycleAPI.getAll();
        const cycles = response.data || [];
        // Use all cycles for period date calculation (not just recent 3 months)
        // This ensures we show all logged period days
        setRecentCycles(cycles);
      } catch (error) {
        console.error("Error fetching cycles:", error);
        setRecentCycles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCycles();
  }, []);

  // Helper functions
  const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) => {
    const nd = new Date(d);
    nd.setDate(nd.getDate() + days);
    return nd;
  };

  const today = dateOnly(new Date());

  // Get actual period dates from recent cycles
  const actualPeriodDates = useMemo(() => {
    const dates: Date[] = [];
    recentCycles.forEach((cycle) => {
      if (cycle.period_start_date) {
        try {
          const start = parseISO(cycle.period_start_date);
          const startDate = dateOnly(start);
          
          // Determine period length: use period_length if available, otherwise use period_end_date, otherwise default to 5
          let periodLength = 5; // default
          if (cycle.period_length && cycle.period_length > 0 && cycle.period_length <= 14) {
            periodLength = cycle.period_length;
          } else if (cycle.period_end_date) {
            // Calculate from end date
            const end = parseISO(cycle.period_end_date);
            const endDate = dateOnly(end);
            const diffTime = endDate.getTime() - startDate.getTime();
            periodLength = Math.max(1, Math.min(14, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1));
          }
          
          // Add all days in the period
          for (let i = 0; i < periodLength; i++) {
            const periodDay = addDays(startDate, i);
            dates.push(dateOnly(periodDay));
          }
        } catch (error) {
          console.error("Error processing cycle date:", error, cycle);
        }
      }
    });
    return dates;
  }, [recentCycles]);

  // Get 7 days starting from 3 days before today
  const mini7 = useMemo(() => {
    const arr: Date[] = [];
    const startBase = addDays(today, -3);
    for (let i = 0; i < 7; i++) arr.push(addDays(startBase, i));
    return arr;
  }, [today]);

  // Determine period status text
  const getPeriodStatus = () => {
    const hasActivePeriod = actualPeriodDates.some(
      (pd) => pd.getTime() === today.getTime()
    );
    if (hasActivePeriod) {
      return "Started today";
    }
    // Check if period started recently (within last 7 days)
    const sevenDaysAgo = addDays(today, -7);
    const recentPeriod = actualPeriodDates.some(
      (pd) => pd >= sevenDaysAgo && pd < today
    );
    if (recentPeriod) {
      return "Recent period";
    }
    return "Track your cycle";
  };

  return (
    <div className="mb-8 mt-4 md:mt-0 min-w-0">
      <h2 className="font-semibold text-lg text-gray-900 mb-3">Cycles</h2>

      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-bold text-xl text-gray-900">Period</p>
            <p className="text-gray-500 text-sm">{loading ? "Loading..." : getPeriodStatus()}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <img src="/calendar-blue.png" className="w-5 h-5" />
          </div>
        </div>

        <div className="flex justify-between mt-4 mb-4">
          {mini7.map((d, i) => {
            // Normalize the date for comparison
            const normalizedDate = dateOnly(d);
            const isActualPeriodDay = actualPeriodDates.some(
              (pd) => {
                const normalizedPd = dateOnly(pd);
                return normalizedPd.getTime() === normalizedDate.getTime();
              }
            );
            // Day labels: M T W Th F Sa Su (matching the order of mini7 which starts from 3 days ago)
            // mini7 is ordered chronologically, so we just use the index
            const dayLabels = ["M", "T", "W", "Th", "F", "Sa", "Su"];
            // Get the actual day of week and map to our labels
            const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
            // Map: Sunday=0 -> Su, Monday=1 -> M, Tuesday=2 -> T, Wednesday=3 -> W, Thursday=4 -> Th, Friday=5 -> F, Saturday=6 -> Sa
            const dayMap: { [key: number]: string } = {
              0: "Su", 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F", 6: "Sa"
            };
            const label = dayMap[dayOfWeek] || dayLabels[i];
            return (
              <div key={i} className="flex flex-col items-center">
                <div className="relative w-4 h-4">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isActualPeriodDay ? "bg-[#F43F5E]" : "bg-red-500"
                    }`}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">{label}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-3">
          <Link
            to="/period/dashboard"
            data-tour="period-tracker-link"
            className="text-blue-600 font-semibold text-sm flex justify-center items-center gap-2 cursor-pointer"
          >
            Period Tracker <img src="arrow right.png" alt="" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const DoctorAppointmentCard = () => (
  <div className="bg-white rounded-2xl shadow p-5">
    <h3 className="text-gray-900 font-semibold text-lg mb-3">
      Doctor Appointment
    </h3>

    <div className="flex justify-center gap-4 mb-4">
      <img src="/Avatar-DR.png" className="w-10 h-10 rounded-full" />
      <img src="/centre-ava.png" className="w-11 h-11 rounded-full" />
      {/* <img src="/" className="w-11 h-11 rounded-full" /> */}
      <img src="/maledr2.ico" className="w-11 h-11 rounded-full" />
      <img src="/maledr1.ico" className="w-11 h-11 rounded-full" />
      <img src="/maledr3.ico" className="w-10 h-10 rounded-full" />
    </div>

    <p className="text-center text-gray-600 text-sm mb-3">
      You don't have any doctor appointment.
    </p>

    {/* ⭐ Blinking / Pulsing Button */}
    <p className="text-blue-600 text-md font-semibold flex justify-center items-center gap-1 cursor-pointer animate-blink">
      Explore Doctor – coming soon <img src="/blue-search.png" />
    </p>
  </div>
);


const FAQsCard = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a fitness club session?",
      answer: "You can browse available clubs on the welcome page, filter by price, and click on any club to view details and book a session. Most clubs offer daily passes starting from Rs. 30/day."
    },
    {
      question: "How does the nutrition tracking work?",
      answer: "Log your meals through the Nutrition section. Our AI assistant helps track calories, macros (protein, carbs, fats), and provides personalized insights based on your goals and preferences."
    },
    {
      question: "Can I track my period cycle on FitFare?",
      answer: "Yes! Female users can access the Period Tracker feature to log cycles, track symptoms, and get predictions for upcoming periods. Navigate to 'Periods Cycle' in the sidebar to get started."
    },
    {
      question: "What is the FitFare Score?",
      answer: "Your FitFare Score reflects your overall health and fitness engagement. It's calculated based on your activity tracking, nutrition logging, and consistent app usage. Higher scores unlock premium features!"
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team at fitfaresupport@gmail.com or use the Contact Support option in the app. We typically respond within 24 hours."
    },
    {
      question: "Are there membership plans available?",
      answer: "Yes! We offer various membership tiers including Plus Member benefits. Check your profile settings or contact support to learn more about available plans and pricing."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white dark:bg-gray-700 rounded-2xl shadow p-5">
      <div className="flex items-center justify-center  mb-4">
        <h3 className="text-gray-900 dark:text-white font-semibold text-2xl ">
          Frequently Asked Questions
        </h3>
        {/* <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div> */}
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-3 last:pb-0">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left flex items-center justify-between gap-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg px-2 -mx-2 transition-colors active:scale-[0.99]"
            >
              <span className="text-gray-800 dark:text-white font-medium text-sm flex-1">
                {faq.question}
              </span>
              <span className={`text-blue-600 dark:text-blue-400 text-xl font-bold transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            {openIndex === index && (
              <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-0 pr-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ========================= TESTIMONIALS SECTION ======================= */

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "As a college student, I love that I can hit the gym without any monthly commitment. FitFare gives me the flexibility to work out wherever and whenever I want!",
      name: "Shubhangi Wakad",
      role: "Collegian",
      image: "/wakad.jpg"
    },
    {
      quote: "With my hectic work schedule, FitFare pay-per-use model fits perfectly into my lifestyle. I've discovered new gyms nearby and only pay when I actually go!",
      name: "Jai Kaushik",
      role: "Software Engineer",
      image: "/kaushik.jpg"
    },
    {
      quote: "Staying fit was hard with my travel-packed job, but FitFare made it seamless. I now explore different gyms without locking into long-term plans or wasting money.",
      name: "Rohit Mote",
      role: "Business Owner",
      image: "/RohitMote.jpg"
    },
    {
      quote: "As a freelancer, my income varies monthly. FitFare's flexible payment system is perfect - I work out when I can afford it, without any pressure or hidden fees.",
      name: "Omkar Jadhav",
      role: "Student",
      image: "/omkar.jpeg"
    },
    {
      quote: "I moved to a new city and didn't want to commit to a gym. FitFare helped me explore multiple fitness centers and find the perfect one for my workout style!",
      name: "Pratap Majge",
      role: "Student",
      image: "/Pratap.jpeg"
    },
    {
      quote: "The best part about FitFare is trying different gyms. I've discovered amazing facilities I never knew existed in my area. It's like a fitness adventure!",
      name: "Arshia Chandarki",
      role: "Student",
      image: "/arshia.jpeg"
    },
    {
      quote: "I'm a fitness enthusiast who loves variety. FitFare lets me do yoga one day, hit the weights the next, and try a new Zumba class - all without multiple memberships!",
      name: "Prerna Biradar",
      role: "Student",
      image: "/prerna.jpeg"
    },
    {
      quote: "Working night shifts made traditional gym memberships useless. With FitFare, I can work out at any time that suits my schedule. Game changer!",
      name: "Meera Joshi",
      role: "Nurse",
      image: "/meerajoshi.jfif"
    },
    {
      quote: "I was skeptical about pay-per-use, but FitFare proved me wrong. I'm actually saving money and working out more consistently than ever before!",
      name: "Vikram Singh",
      role: "Teacher",
      image: "/vikramsingh.jfif"
    },
    {
      quote: "The app is so user-friendly! Booking a session takes seconds, and I love seeing all available gyms nearby. FitFare has made fitness accessible and affordable.",
      name: "Ananya Desai",
      role: "Student",
      image: "/ananyadesai.jfif"
    },
    {
      quote: "As a mom of two, I have limited time. FitFare lets me squeeze in quick workouts at different locations without the commitment of a full membership.",
      name: "Kavita Nair",
      role: "Homemaker",
      image: "/kavitanair.jfif"
    }
  ];

  const loopList = [...testimonials, ...testimonials];
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <div className="mb-8 mt-4 md:mt-0 min-w-0">
      <h2 className="font-semibold text-2xl text-center text-gray-900 mb-3">Testimonials</h2>
      <div
        className={`relative overflow-x-auto ${autoScroll ? "scrollbar-none" : ""}`}
        onClick={() => setAutoScroll(false)}
      >
        <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite-slow" : ""}`}>
          {loopList.map((testimonial, i) => (
            <TestimonialCard
              key={i}
              quote={testimonial.quote}
              name={testimonial.name}
              role={testimonial.role}
              image={testimonial.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TestimonialCard = ({
  quote,
  name,
  role,
  image,
}: {
  quote: string;
  name: string;
  role: string;
  image: string;
}) => {
  return (
<div className="bg-white rounded-2xl shadow-lg 
  p-4 sm:p-6 
  w-[260px] sm:w-[400px] 
  h-[320px] sm:h-[400px] 
  flex flex-col justify-between flex-shrink-0">
      {/* Stars */}
      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-sm sm:text-base flex-grow leading-relaxed">
        "{quote}"
      </p>

      {/* User Info */}
      <div className="flex items-center gap-3 mt-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
      <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/Avatar-1.png";
            }}
          />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm sm:text-base">
            {name}
          </p>
          <p className="text-gray-600 text-xs sm:text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};


const RateAppCard = () => (
  <div className="bg-white rounded-2xl shadow p-5">
    <h3 className="text-center font-semibold text-gray-900 text-lg mb-3">
      Rate Our App
    </h3>

    <p className="text-center text-gray-600 text-sm mb-4">
      Help us improve our platform by giving your feedback.
    </p>

    <div className="flex justify-center gap-4 my-3">
      <Link to="/wellness/feedback">
        <img src="depressed.png" />
      </Link>
      <Link to="/wellness/feedback">
        <img src="sad.png" />
      </Link>
      <Link to="/wellness/feedback">
        <img src="neutral.png" />
      </Link>
      <Link to="/wellness/feedback">
        <img src="happy.png" />
      </Link>
      <Link to="/wellness/feedback">
        <img src="overjoyed.png" />
      </Link>
    </div>
  </div>
);

const SupportCard = () => (

  <div className="col-span-12">
    {/* <SupportCard /> */}
    <div className="block mt-4 justify-center flex gap-2 items-center"
    >
      contact us at
      <a
        href="mailto:fitfaresupport@gmail.com"
        className="flex gap-1 text-blue-600"
      >
        fitfaresupport@gmail.com
        <img src="arrow right.png" className="h-5 mt-1" />
      </a>
    </div>
  </div>

);

/* ========================= SIDEBAR ======================= */

const Sidebar = ({ sidebarOpen, userGender }: { sidebarOpen: boolean; userGender: string | null }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* ========= MOBILE: bottom nav (unchanged) ========= */}
      <div
        className="
          md:hidden
          fixed bottom-0 left-0 right-0 z-50
          bg-white border-t shadow-md
          flex items-center justify-between px-8 py-4
        "
      >
        <Link to="/welcome" className="flex flex-col items-center text-gray-600">
          <img src="/home-gray.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">Home</span>
        </Link>

        <Link
          to="/wellness/ai-chat"
          className="flex flex-col items-center text-gray-600"
        >
          <img src="/ai-pic.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">AI Assistant</span>
        </Link>

        {/* center add button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="w-14 h-14 flex items-center justify-center active:scale-95 transition"
          title="Quick actions"
        >
          <img src="/Button Icon (1).png" className="w-16 h-16 mt-5" />
        </button>

        <Link to="/bookings" className="flex flex-col items-center text-gray-600">
          <img src="/resources.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">My Bookings</span>
        </Link>

        <Link
          to="/wellness/settings"
          className="flex flex-col items-center text-gray-600"
        >
          <img src="/profile.png" className="w-6 h-6" />
          <span className="text-[11px] mt-1">Profile</span>
        </Link>
      </div>

      {/* Quick actions popup (mobile & desktop) */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="
              fixed bottom-24 left-0 right-0 mx-auto w-[90%] max-w-xs
              bg-white rounded-3xl shadow-xl p-6 flex justify-around z-[70]
            "
          >
            <PopupItem icon="/leaf.png" label="Nutrition" link="/nutrition/home" />
            {userGender === 'Female' || userGender === null ? (
              <PopupItem icon="/cycle.png" label="Cycles" link="/cycles" />
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/period-restricted");
                }}
                className="flex flex-col items-center gap-1"
              >
                <img src="/cycle.png" className="w-8 h-8 opacity-50" />
                <span className="text-[10px] text-gray-500">Cycles</span>
              </button>
            )}
            {/* <PopupItem icon="/dr.png" label="Doctor App" /> */}
          </div>
        </>
      )}

      {/* ========= DESKTOP: left sidebar ========= */}
      <div
        className={`
          hidden md:flex md:flex-col md:justify-start
          md:fixed md:top-0 md:left-0 md:h-full
          bg-white border-r shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "md:w-60" : "md:w-20"}
        `}
      >
        {/* NOTE: Hamburger removed from inside. It is now fixed at top-left outside. */}
        <div className="mt-[100px] flex flex-col gap-8 px-3">
          <Link to="/welcome">
            <NavItem
              icon="/home-gray.png"
              label="Home"
              sidebarOpen={sidebarOpen}
            />
          </Link>

          <Link to="/wellness/ai-chat" data-tour="ai-assistant">
            <NavItem
              icon="/ai-pic.png"
              label="AI Assistant"
              sidebarOpen={sidebarOpen}
            />
          </Link>

          <Link to="/bookings">
            <NavItem
              icon="/resources.png"
              label="My Bookings"
              sidebarOpen={sidebarOpen}
            />
          </Link>

          {userGender === 'Female' || userGender === null ? (
            <Link to="/cycles" data-tour="periods-cycle">
              <NavItem
                icon="/cycle-1.png"
                label="Periods Cycle"
                sidebarOpen={sidebarOpen}
              />
            </Link>
          ) : null}

          <Link to="/nutrition/home" data-tour="nutrition">
            <NavItem
              icon="/leaf-1.png"
              label="Nutrition"
              sidebarOpen={sidebarOpen}
            />
          </Link>

          <Link to="/wellness/settings">
            <NavItem
              icon="/Monotone add (6).png"
              label="Profile"
              sidebarOpen={sidebarOpen}
            />
          </Link>
        </div>
      </div>
    </>
  );
};

/* aligned desktop nav item */
const NavItem = ({
  icon,
  label,
  sidebarOpen,
}: {
  icon: string;
  label: string;
  sidebarOpen: boolean;
}) => {
  const isNutrition = icon.includes('Vector (17)');
  return (
    <div
      className={`
        flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
        text-gray-700 hover:bg-blue-50 hover:text-blue-600
        transition-all
        ${sidebarOpen ? "justify-start" : "justify-center"}
      `}
    >
      <img
        src={icon}
        className="w-6 h-6"
        style={isNutrition ? { filter: 'grayscale(100%) brightness(0.5) opacity(0.7)' } : {}}
      />
      {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

const PopupItem = ({
  icon,
  label,
  link = "#",
}: {
  icon: string;
  label: string;
  link?: string;
}) => (
  <Link to={link} className="flex flex-col items-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
      <img src={icon} />
    </div>
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

// ______________________________________________backup code end_____________________________________________________________________________________________

// // src/pages/Welcome.tsx
// import { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import axios from "axios";
// import { useNutritionProfile } from "../context/NutritionProfileContext";
// import { getUserProfile, getStreakData } from "../teamd/api/api"; // ✅ same helper used in Settings/ProfileSettings
// import { useRef } from "react";
// import OnboardingTour from "../components/OnboardingTour";
// import { Step } from "react-joyride";
// // import Hamburger from 'hamburger-react'
// // import { SiBitcoin } from "react-icons/si";
// import { GiTwoCoins } from "react-icons/gi";
// // import { useNavigate } from "react-router-dom";


// /* ========================= TYPES ======================= */

// interface User {
//   id: number;
//   email: string;
//   full_name?: string;          // from users table
//   profile_image_url?: string;  // from users table
//   gender?: string | null;      // from users table
// }

// interface ProfileData {
//   food_preference?: string;
//   common_allergies?: string[];
//   snack_frequency?: string;
//   calorie_intake?: number;
//   other_notes?: string;
// }

// /* ========================= PAGE ======================= */

// const Welcome = () => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [signingOut, setSigningOut] = useState(false);
//   const [hasProfile, setHasProfile] = useState(false);
//   const [userGender, setUserGender] = useState<string | null>(null);
//   const [streakDays, setStreakDays] = useState<number>(0);
//   const [clubsLoading, setClubsLoading] = useState(true);


//   // controls desktop layout (and is toggled by the fixed hamburger)
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [isOpen, setOpen] = useState(false)

//   // ✅ name + avatar shown in both headers (mobile/desktop)
//   const [displayName, setDisplayName] = useState<string>("User");
//   const [avatarUrl, setAvatarUrl] = useState<string>("/Avatar-1.png");

//   const { updateProfile } = useNutritionProfile();
//   const [city, setCity] = useState("Locating...");

//   const [cityModalOpen, setCityModalOpen] = useState(false);
//   // const allowedCities = ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi"];


//   const [manualCity, setManualCity] = useState(
//     localStorage.getItem("manual_city") || ""
//   );

//   const allowedCities = ["Pune", "Mumbai", "Bengaluru", "Hyderabad", "Delhi"];
//   const [showCityPicker, setShowCityPicker] = useState(false);

//   const [activities, setActivities] = useState([]);
//   const [clubs, setClubs] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   // const [showCityPicker, setShowCityPicker] = useState(false);

//   // Onboarding state
//   const [showWelcomeTour, setShowWelcomeTour] = useState(false);
//   const [showWelcomeClubsTour, setShowWelcomeClubsTour] = useState(false);


//   const SUPPORTED_CITIES = [
//     "Pune",
//     "Mumbai",
//     "Bengaluru",
//     "Hyderabad",
//     "Delhi",
//   ];

//   const extractActualCity = (address: any): string | null => {
//     return (
//       address.city ||
//       address.town ||
//       address.village ||
//       address.hamlet ||
//       null
//     );
//   };
  
//   const normalizeCity = (address: any): string | null => {
//     if (!address) return null;
  
//     // 1️⃣ Try to match supported cities ONLY
//     const searchFields = [
//       address.city,
//       address.state_district,
//       address.county,
//     ];
  
//     for (const field of searchFields) {
//       if (!field) continue;
  
//       for (const supported of SUPPORTED_CITIES) {
//         if (field.toLowerCase().includes(supported.toLowerCase())) {
//           return supported;
//         }
//       }
//     }
  
//     // 2️⃣ If NOT supported → return actual city (Latur)
//     return extractActualCity(address);
//   };
  
   




//   // Check if user has seen welcome onboarding
//   useEffect(() => {
//     const hasSeenWelcomeTour = localStorage.getItem("hasSeenWelcomeTour");
//     const hasSeenWelcomeClubsTour = localStorage.getItem("hasSeenWelcomeClubsTour");
//     if (!hasSeenWelcomeTour) {
//       // Small delay to ensure page is fully rendered
//       setTimeout(() => {
//         setShowWelcomeTour(true);
//       }, 1000);
//     }
//     // Show clubs tour after navigation tour completes
//     if (hasSeenWelcomeTour && !hasSeenWelcomeClubsTour) {
//       // Wait for elements to be rendered
//       const checkAndStartTour = () => {
//         const citySelector = document.querySelector('[data-tour="city-selector"]');
//         const clubsSection = document.querySelector('[data-tour="clubs-section"]');
//         if (citySelector && clubsSection) {
//           setTimeout(() => {
//             setShowWelcomeClubsTour(true);
//           }, 2000);
//         } else {
//           // Retry after a short delay
//           setTimeout(checkAndStartTour, 500);
//         }
//       };
//       setTimeout(checkAndStartTour, 1000);
//     }
//   }, [clubs.length]);

//   useEffect(() => {
//     const token = localStorage.getItem("auth_token");

//     if (!token) {
//       navigate("/");
//       return;
//     }

//     const fetchStreak = async () => {
//       try {
//         const response = await getStreakData();
//         setStreakDays(response.data?.current_streak || 0);
//       } catch (err) {
//         console.error("Error fetching streak:", err);
//       }
//     };

//     fetchStreak();

//     const fetchUserDataAndProfile = async () => {
//       try {
//         // 1) Basic identity (often email-only)
//         const userRes = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const me: User = userRes.data.user;
//         setUser(me);
//         setUserGender(me?.gender || null);

//         // provisional fallback until we get full profile
//         setDisplayName(me?.full_name || me?.email?.split("@")?.[0] || "User");
//         setAvatarUrl(me?.profile_image_url || "/Avatar-1.png");

//         // 2) Pull full profile (same API used in Settings/ProfileSettings)
//         try {
//           const { data } = await getUserProfile();
//           if (data?.full_name) setDisplayName(data.full_name);
//           if (data?.profile_image_url) setAvatarUrl(data.profile_image_url);
//         } catch (e) {
//           // keep fallbacks from /auth/me
//           console.warn("getUserProfile() failed, using fallback name/avatar:", e);
//         }

//         // 3) Nutrition profile (unchanged)
//         try {
//           const profileRes = await axios.get(
//             `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );

//           if (profileRes.data && Object.keys(profileRes.data).length > 0) {
//             setHasProfile(true);
//             updateProfile(profileRes.data);
//           } else {
//             setHasProfile(false);
//           }
//         } catch (profileErr: any) {
//           if (profileErr.response?.status === 404) {
//             setHasProfile(false);
//           } else {
//             console.error("Profile fetch error:", profileErr);
//             setHasProfile(false);
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching user:", err);
//         localStorage.removeItem("auth_token");
//         navigate("/");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserDataAndProfile();
//   }, [navigate, updateProfile]);


//   useEffect(() => {
//     const token = localStorage.getItem("auth_token");

//     axios
//       .get(`${import.meta.env.VITE_BACKEND_URL}/api/activities`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         setActivities(res.data.activities || []);
//       })
//       .catch((err) => {
//         console.error("ACTIVITIES FETCH ERROR:", err);
//         setActivities([]);
//       });
//   }, []);

//   useEffect(() => {
//     if (!city) return;
  
//     // 🚫 If city not supported → no clubs
//     if (!SUPPORTED_CITIES.includes(city)) {
//       setClubs([]);
//       setClubsLoading(false);
//       return;
//     }
  
//     setClubsLoading(true);
  
//     const token = localStorage.getItem("auth_token");
  
//     axios
//       .get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=${encodeURIComponent(city)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       .then((res) => {
//         setClubs(res.data.clubs || []);
//       })
//       .catch((err) => {
//         console.error("CLUB FETCH ERROR:", err);
//         setClubs([]);
//       })
//       .finally(() => {
//         setClubsLoading(false);
//       });
//   }, [city]);
  


//   // useEffect(() => {
//   //   const token = localStorage.getItem("auth_token");

//   //   axios
//   //     .get(
//   //       `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=Mumbai`,
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     )
//   //     .then((res) => {
//   //       console.log("CLUBS RESPONSE:", res.data);
//   //       setClubs(res.data.clubs || []);
//   //     })
//   //     .catch((err) => {
//   //       console.error("CLUBS FETCH ERROR:", err);
//   //       setClubs([]);
//   //     });
//   // }, []);



//   useEffect(() => {
//     setCity("Locating..."); // reset before fetching

//     if (!navigator.geolocation) {
//       setCity("Unable to fetch");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (pos) => {
//         const { latitude, longitude } = pos.coords;
    
//         try {
//           const token = localStorage.getItem("auth_token");
    
//           const res = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
    
//           const data = await res.json();
//           if (!data?.address) {
//             setCity("Unknown");
//             return;
//           }
    
//           const normalizedCity = normalizeCity(data.address);
//           const manualCity = sessionStorage.getItem("manual_city");
    
//           console.log("📍 City Debug:", {
//             rawCity: data.address.city,
//             normalizedCity,
//             manualCity,
//           });
    
//           // ✅ Priority order:
//           // 1️⃣ Manual city
//           // 2️⃣ Normalized GPS city
//           // 3️⃣ Raw city
//           if (manualCity) {
//             setCity(manualCity);
//           } else if (normalizedCity) {
//             setCity(normalizedCity);
//           } else {
//             setCity(data.address.city || "Unknown");
//           }
//         } catch (err) {
//           console.error("Location error:", err);
//           setCity("Unknown");
//         }
//       },
//       () => setCity("Location denied"),
//       { enableHighAccuracy: true }
//     );
    
//   }, []);








//   const handleSignOut = () => {
//     setSigningOut(true);
//     setTimeout(() => {
//       localStorage.removeItem("auth_token");
//       toast.success("Signed out successfully");
//       navigate("/", { replace: true });
//     }, 1500);
//   };
//   const handleBookNow = async (club: any) => {
//     const token = localStorage.getItem("auth_token");

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_BACKEND_URL}/api/bookings`,
//         { club_id: club.id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast.success("Booking Added!");
//       navigate("/bookings");
//     } catch (err) {
//       console.error("BOOK ERROR:", err);
//       toast.error("Could not book. Try again.");
//     }
//   };


//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   /* ---------------- ONBOARDING STEPS ---------------- */
//   const welcomeTourSteps: Step[] = [
//     // Step 1: Track Your Period (only for female users)
//     ...(userGender === 'Female' || userGender === null ? [{
//       target: '[data-tour="periods-cycle"]',
//       content: (
//         <div>
//           <h3 className="text-lg font-bold mb-2">Track Your Period</h3>
//           <p className="text-sm text-gray-600">
//             Click here to log your period and keep track of your cycle. Get personalized insights and predictions!
//           </p>
//         </div>
//       ),
//       placement: 'right',
//       disableBeacon: true,
//     }] : []),
//     // Step 2: Track Your Nutrition (always)
//     {
//       target: '[data-tour="nutrition"]',
//       content: (
//         <div>
//           <h3 className="text-lg font-bold mb-2">Track Your Nutrition</h3>
//           <p className="text-sm text-gray-600">
//             Click here to manage your nutrition, set calorie goals, log meals, and see your progress. Keep your health on track!
//           </p>
//         </div>
//       ),
//       placement: 'right',
//     },
//     // Step 3: Ask Queries to Our AI Assistant (always)
//     {
//       target: '[data-tour="ai-assistant"]',
//       content: (
//         <div>
//           <h3 className="text-lg font-bold mb-2">Ask Queries to Our AI Assistant</h3>
//           <p className="text-sm text-gray-600">
//             Get instant answers to your health, fitness, and nutrition questions from our AI assistant. Ask anything!
//           </p>
//         </div>
//       ),
//       placement: 'right',
//     },
//   ];

//   const handleWelcomeTourComplete = () => {
//     localStorage.setItem('hasSeenWelcomeTour', 'true');
//     setShowWelcomeTour(false);
//     // Trigger clubs tour after navigation tour with delay
//     // Ensure all required elements exist before starting, especially the FIRST step target
//     const startClubsTour = () => {
//       const clubsSection = document.querySelector('[data-tour="clubs-section"]');
//       const addToCart = document.querySelector('[data-tour="add-to-cart"]');

//       console.log('🔍 Checking tour elements:', {
//         clubsSection: !!clubsSection,
//         addToCart: !!addToCart
//       });

//       // CRITICAL: First step target (clubs-section) MUST exist
//       if (!clubsSection) {
//         console.error('❌ CRITICAL: clubs-section element NOT FOUND! Cannot start tour at step 1.');
//         console.error('Retrying in 500ms...');
//         setTimeout(startClubsTour, 500);
//         return;
//       }

//       // Log element details for debugging
//       if (clubsSection) {
//         console.log('✅ clubs-section found:', {
//           tagName: clubsSection.tagName,
//           isVisible: clubsSection.offsetParent !== null
//         });
//         // Ensure it's visible
//         clubsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
//       }

//       if (clubsSection) {
//         console.log('✅ Required tour elements found, starting clubs tour from STEP 1 (Browse Fitness Clubs)');
//         // Add a small delay to ensure DOM is ready
//         setTimeout(() => {
//           setShowWelcomeClubsTour(true);
//         }, 300);
//       } else {
//         console.warn('⚠️ Tour elements not found, retrying...', {
//           clubsSection: !!clubsSection
//         });
//         // Retry after a short delay if elements not found
//         setTimeout(startClubsTour, 500);
//       }
//     };

//     // Start checking after a delay to ensure page is fully rendered
//     setTimeout(startClubsTour, 2000);
//   };

//   // Welcome Clubs Tour Steps
//   const welcomeClubsTourSteps: Step[] = [
//     {
//       target: '[data-tour="clubs-section"]',
//       content: (
//         <div>
//           <h3 className="text-lg font-bold mb-2">Browse Fitness Clubs</h3>
//           <p className="text-sm text-gray-600">
//             Explore fitness clubs near you! Each club shows price, location, and facilities. Click on a club to see more details.
//           </p>
//         </div>
//       ),
//       placement: 'top',
//       disableOverlayClose: true,
//     },
//     {
//       target: '[data-tour="add-to-cart"]',
//       content: (
//         <div>
//           <h3 className="text-lg font-bold mb-2">Add to Cart</h3>
//           <p className="text-sm text-gray-600">
//             Click "Add to cart" to book a fitness club. You can manage all your bookings in the "My Bookings" section!
//           </p>
//         </div>
//       ),
//       placement: 'top',
//       disableOverlayClose: true,
//     },
//   ];

//   const handleWelcomeClubsTourComplete = () => {
//     localStorage.setItem('hasSeenWelcomeClubsTour', 'true');
//     setShowWelcomeClubsTour(false);
//   };

//   /* ---------------- LAYOUT ---------------- */

//   const lowerSearch = searchTerm.trim().toLowerCase();
//   const baseClubs = clubs.map((c) => ({
//     ...c,
//     name: c.name || c.title || "",
//   }));
//   const filteredClubs = lowerSearch
//     ? baseClubs.filter(
//       (c: any) =>
//         c.name.toLowerCase().includes(lowerSearch) ||
//         (c.location || "").toLowerCase().includes(lowerSearch)
//     )
//     : baseClubs;

//   (window as any).welcomeData = {
//     activities,
//     clubs: filteredClubs,
//     clubsLoading,
//   };

//   {/* ========= CITY PICKER MODAL ========= */ }



//   return (
//     <div className="h-screen overflow-hidden bg-gray-100">
//       {/* ========= CITY PICKER MODAL ========= */}
//       {showCityPicker && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
//             onClick={() => setShowCityPicker(false)}
//           />

//           <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
//                     bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-4 md:p-6 z-[210] max-h-[80vh] overflow-hidden flex flex-col">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
//               Select Your City
//             </h2>

//             <div className="flex-1 overflow-y-auto">
//               <div className="grid grid-cols-1 gap-2 md:gap-3">
//                 {allowedCities.map((c) => (
//                   <button
//                     key={c}
//                     onClick={() => {
//                       sessionStorage.setItem("manual_city", c);
//                       setCity(c);
//                       setShowCityPicker(false);
//                       // Trigger clubs fetch for new city
//                       const token = localStorage.getItem("auth_token");
//                       const fixedCity = c === "Pune city" ? "Pune" : c;
//                       axios
//                         .get(
//                           `${import.meta.env.VITE_BACKEND_URL}/api/club-section?city=${encodeURIComponent(fixedCity)}`,
//                           { headers: { Authorization: `Bearer ${token}` } }
//                         )
//                         .then((res) => {
//                           setClubs(res.data.clubs || []);
//                         })
//                         .catch((err) => {
//                           console.error("CLUB FETCH ERROR:", err);
//                           setClubs([]);
//                         });
//                     }}
//                     className="w-full py-3 md:py-2 rounded-lg border border-gray-300
//                          hover:bg-blue-50 hover:border-blue-600 transition text-left px-4 text-sm md:text-base"
//                   >
//                     {c}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <button
//               onClick={() => setShowCityPicker(false)}
//               className="mt-4 text-center w-full text-gray-600 underline"
//             >
//               Cancel
//             </button>
//           </div>
//         </>
//       )}

//       {/* ===== FIXED HAMBURGER (does NOT move with sidebar) ===== */}
//       <button
//         onClick={() => setSidebarOpen(!sidebarOpen)}
//         className="fixed w-5 h-5 top-5 left-6 z-[400] bg-white p-2  md:flex hidden transition"
//         aria-label="Toggle sidebar"
//         title="Toggle sidebar"
//       >
//         ☰
//       </button>

//       {/* Sidebar (controls desktop width) */}
//       <Sidebar sidebarOpen={sidebarOpen} userGender={userGender} />

//       {/* Welcome Onboarding Tour */}
//       <OnboardingTour
//         steps={welcomeTourSteps}
//         run={showWelcomeTour}
//         onComplete={handleWelcomeTourComplete}
//         onSkip={handleWelcomeTourComplete}
//       />

//       {/* Welcome Clubs Onboarding Tour */}
//       <OnboardingTour
//         key={`clubs-tour-${showWelcomeClubsTour}`}
//         steps={welcomeClubsTourSteps}
//         run={showWelcomeClubsTour}
//         onComplete={handleWelcomeClubsTourComplete}
//         onSkip={handleWelcomeClubsTourComplete}
//         spotlightClicks={false}
//       />

//       {/* ======= MOBILE VIEW ======= */}
//       <div className="block md:hidden w-full h-full overflow-y-auto">
//         <div className="px-0">
//           <HomeContentMobile
//             user={user}
//             onLogout={handleSignOut}
//             displayName={displayName}
//             avatarUrl={avatarUrl}
//             city={city}
//             userGender={userGender}
//             onCityClick={() => setShowCityPicker(true)}
//             setShowCityPicker={setShowCityPicker}
//             streakDays={streakDays}
//             searchTerm={searchTerm}
//             onSearchChange={setSearchTerm}
//             setCity={setCity}
//             allowedCities={allowedCities}
//             setClubs={setClubs}
//           />
//           {/* <HomeContentMobile
//   user={user}
//   onLogout={handleSignOut}
//   displayName={displayName}
//   avatarUrl={avatarUrl}
//   city={city}
//   setShowCityPicker={setShowCityPicker}
// /> */}

//         </div>
//       </div>

//       {/* ======= DESKTOP VIEW ======= */}
//       <div
//         className={`hidden md:flex md:flex-col h-full transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-20"
//           }`}
//       >
//         {/* Top bar (non-scrolling) */}
//         <DesktopTopBar
//           user={user}
//           displayName={displayName}
//           city={city}
//           streakDays={streakDays}
//           setShowCityPicker={setShowCityPicker}
//           searchTerm={searchTerm}
//           onSearchChange={setSearchTerm}
//         />

//         {/* Scrollable content */}
//         <div className="flex-1 overflow-y-auto px-6 pb-24">
//           <div className="grid grid-cols-12 gap-6">
//             {/* LEFT COLUMN */}
//             <div className="col-span-7 space-y-6">
//               <ActivitySectionDesktop />
//               <ClubsBlock handleBookNow={handleBookNow} />

//             </div>

//             {/* RIGHT COLUMN */}
//             <div className="col-span-5 space-y-6">
//               {/* 👉 Desktop nutrition card */}
//               <NutritionSection variant="desktop" />
//               {userGender === 'Female' || userGender === null ? <CycleSection /> : null}
//             </div>

//             {/* FULL WIDTH ROWS */}
//             <div className="col-span-12">
//               <DoctorAppointmentCard />
//             </div>
//             <div className="col-span-12">
//               <FAQsCard />
//             </div>
//             <div className="col-span-12">
//               <TestimonialsSection />
//             </div>
//             {/* <div className="col-span-12"><AIHealthAssistantCard /></div> */}
//             <div className="col-span-12">
//               <RateAppCard />
//             </div>
//             <div className="col-span-12">
//               {/* <SupportCard /> */}
//               <div className="block mt-4 justify-center flex gap-2 items-center"
//               >
//                 contact us at
//                 <a
//                   href="mailto:fitfaresupport@gmail.com"
//                   className="flex gap-1 text-blue-600"
//                 >
//                   fitfaresupport@gmail.com
//                   <img src="arrow right.png" className="h-5 mt-1" />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Sign-out overlay */}
//       {signingOut && (
//         <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex flex-col items-center justify-center z-[90]">
//           <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-white text-xl font-semibold mt-4">Signing out...</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Welcome;

// /* ========================= MOBILE CONTENT ======================= */

// const HomeContentMobile = ({
//   user,
//   onLogout,
//   displayName,
//   avatarUrl,
//   city,
//   userGender,
//   onCityClick,
//   setShowCityPicker,
//   streakDays,
//   searchTerm,
//   onSearchChange,
//   setCity,
//   allowedCities,
//   setClubs
// }: {
//   user: User;
//   onLogout: () => void;
//   displayName: string;
//   avatarUrl: string;
//   city: string;
//   userGender: string | null;
//   onCityClick: () => void;
//   setShowCityPicker: (value: boolean) => void;
//   streakDays: number;
//   searchTerm: string;
//   onSearchChange: (value: string) => void;
//   setCity: (city: string) => void;
//   allowedCities: string[];
//   setClubs: (clubs: any[]) => void;
// }) => {
//   return (
//     <div className="w-full">
//       {/* Mobile header */}

//       <Header
//         displayName={displayName}
//         avatarUrl={avatarUrl}
//         city={city}
//         setShowCityPicker={setShowCityPicker}
//         streakDays={streakDays}
//         searchTerm={searchTerm}
//         onSearchChange={onSearchChange}
//         setCity={setCity}
//         allowedCities={allowedCities}
//         setClubs={setClubs}
//       />

//       {/* Mobile Wallet - Add below header */}
//       {/* <div className="md:hidden px-4 mt-4 mb-2">
//         <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
//           <GiTwoCoins size={24} color="gold" />
//           <span className="font-semibold text-gray-900 text-sm">0</span>
//         </div>
//       </div> */}

//       <div className="px-4 mt-6 pb-28">
//         {/* pb avoids overlap with fixed bottom nav */}
//         <ActivitySectionMobile />
//         <div className="mb-6"></div>
//         <DynamicClubSectionMobile />
//         <div className="mb-6"></div>

//         {/* 👉 Mobile nutrition card */}
//         <NutritionSection variant="mobile" />
//         <div className="mb-4"></div>
//         {userGender === 'Female' || userGender === null ? <CycleSection /> : null}
//         <DoctorAppointmentCard />
//         <div className="mt-4"></div>
//         <FAQsCard />
//         <TestimonialsSection />
//         {/* <AIHealthAssistantCard /> */}
//         <div className="mt-10"></div>
//         <RateAppCard />
//         <div className="mt-10">
//           <SupportCard />
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ========================= MOBILE HEADER ======================= */

// const Header = ({
//   displayName,
//   avatarUrl,
//   city,
//   onCityClick,
//   setShowCityPicker,
//   streakDays,
//   searchTerm,
//   onSearchChange,
//   setCity,
//   allowedCities,
//   setClubs
// }: {
//   displayName: string;
//   avatarUrl: string;
//   city: string;
//   onCityClick: () => void;
//   setShowCityPicker: (value: boolean) => void;
//   streakDays: number;
//   searchTerm: string;
//   onSearchChange: (value: string) => void;
//   setCity: (city: string) => void;
//   allowedCities: string[];
//   setClubs: (clubs: any[]) => void;
// }) => (
//   <div className="bg-[#2563EB] rounded-b-[50px] p-5 pb-10 text-white">
//     {/* Top row: avatar • Hi, Name • bell */}
//     <div className="flex items-center justify-between mb-6">
//       <img
//         src={avatarUrl}
//         className="w-10 h-10 rounded-full object-cover"
//         alt="avatar"
//       />
//       <p className="text-white text-lg font-semibold truncate max-w-[55%] text-center">
//         Hi, {displayName}
//       </p>
//       {/* <Link to="/notification">
//         <img src="/bell-w.png" className="w-6 h-6" />
//       </Link> */}
//       <button
//         onClick={() => window.location.href = "/wellness/settings/streak"}
//         className="bg-white/20 rounded-full px-3 py-2 flex items-center gap-1.5 shadow"
//       >
//         <img src="/yellow-tick.png" className="w-4 h-4 md:w-5 md:h-6" />
//         <span className="text-white font-semibold text-[12px] md:text-[13px]">
//           {streakDays === 0 ? (
//             <span className="flex items-center gap-1">
//               <span className="text-red-500 text-lg">✕</span>
//               <span>0</span>
//             </span>
//           ) : (
//             `${streakDays} day${streakDays !== 1 ? "s" : ""}`
//           )}
//         </span>
//       </button>


//     </div>

//     {/* FitFare card */}
//     {/* <div className="p-4 flex items-center justify-between backdrop-blur-sm">
//       <div className="flex items-center gap-4">
//         <div className="w-16 h-16 rounded-xl flex items-center justify-center text-lg font-bold">
//           <img src="k-icon.png" />
//         </div>
//         <div>
//           <p className="font-semibold mb-1 text-lg">FitFare Score</p>
//           <div className="flex items-center gap-2">
//             <img src="heart.png" />
//             <p className="opacity-90 text-sm">Healthy</p>
//             <img src="magic-sparkle.png" />
//             <p className="opacity-90 text-sm">Plus Member</p>
//           </div>
//         </div>
//       </div>
//       <img src="/chevron-right.png" />
//     </div> */}
//     {/* Coins + Streak for mobile */}

//     {/* Coins */}
//     {/* <div className="flex items-center gap-2">
//     <img src="/coin.png" className="w-6 h-6" />
//     <span className="text-white font-semibold text-sm">0</span>
//   </div> */}

//     {/* Streak */}
//     {/* <button
//     onClick={() => window.location.href = "/wellness/settings/streak"}
//     className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-xl shadow text-orange-700"
//   >
//     <img src="/yellow-tick.png" className="w-4 h-4" />
//     <span className="font-semibold text-sm">  {JSON.parse(localStorage.getItem("streak") || "0")} day</span>
//   </button> */}



//     {/* Search */}
//     <div className="mt-4 bg-white rounded-xl px-4 py-3 flex items-center justify-between">
//       <div className="flex items-center flex-1 min-w-0">
//         <img src="/search-Icon.png" className="w-5 h-5 opacity-70 flex-shrink-0" />
//         <input
//           type="text"
//           placeholder="Search fitness clubs..."
//           className="ml-3 w-full outline-none text-black bg-transparent"
//           value={searchTerm}
//           onChange={(e) => onSearchChange(e.target.value)}
//         />
//       </div>

//       <div className="flex items-center gap-1 text-gray-600 text-xs font-medium flex-shrink-0 ml-2">
//         <img src="/mapIcon.jpg" className="w-3.5 h-4 mt-0.5" />

//         <button
//           onClick={() => setShowCityPicker(true)}
//           data-tour="city-selector"
//           className="underline text-blue-600 whitespace-nowrap"
//         >
//           {city}
//         </button>
//       </div>

//     </div>

//   </div>
// );

// /* ========================= DESKTOP TOP BAR ======================= */

// const DesktopTopBar = ({
//   user,
//   displayName,
//   city,
//   streakDays,
//   onCityClick,
//   setShowCityPicker,
//   searchTerm,
//   onSearchChange
// }: {
//   user: User;
//   displayName: string;
//   city: string;
//   streakDays: number;
//   onCityClick: () => void;
//   setShowCityPicker: (value: boolean) => void;
//   searchTerm: string;
//   onSearchChange: (value: string) => void;
// }) => {
//   const navigate = useNavigate();
//   return (
//     <div
//       className="
//         sticky top-0 z-30 
//         bg-white/40 
//         backdrop-blur-md 
//         supports-[backdrop-filter]:bg-white/30 
//         border-b border-white/20
//       "
//     >
//       <div className="px-6 py-4">
//         <div className="flex items-center justify-between">
//           {/* Search */}
//           <div className="flex-1">
//             <div className="bg-white w-[650px] backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-white">

//               <div className="flex items-center flex-1 min-w-0">
//                 <img src="/search-Icon.png" className="w-5 h-5 opacity-70 flex-shrink-0" />
//                 <input
//                   type="text"
//                   placeholder="Search for Clubs and Events..."
//                   className="ml-3 flex-1 min-w-0 outline-none text-gray-900 placeholder:text-gray-700 bg-transparent"
//                   value={searchTerm}
//                   onChange={(e) => onSearchChange(e.target.value)}
//                 />
//               </div>


//               <div className="flex items-center gap-2 text-sm font-medium">
//                 <img src="/mapIcon.jpg" className="w-3.5 h-4 mt-0.5" />

//                 <button
//                   onClick={() => setShowCityPicker(true)}
//                   data-tour="city-selector"
//                   className="underline text-blue-700"
//                 >
//                   {city}
//                 </button>
//               </div>

//             </div>

//           </div>

//           <div></div>
//           {/* Right side: greeting + bell */}
//           <div className="ml-6 flex items-center gap-6 flex-nowrap flex-shrink-0">

//             {/* ⭐ Subscription / Wallet Block with Streak */}
//             <div className="flex items-center gap-4 flex-shrink-0">
//               {/* <button
//                 onClick={() => navigate("/subscription")}
//                 className="flex items-center gap-2 border border-blue-600 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition"
//               >
//                 <img src="/sub-icon.png" className="w-5 h-5" />
//                 <SiBitcoin size={32} />
//                 <GiTwoCoins size={32} color="gold" />
//                 <span className="font-semibold text-gray-900 text-sm"> 0</span>
//               </button> */}

//               {/* ⭐ Streak Fire Icon - Beside coin */}
//               <button
//                 onClick={() => navigate("/wellness/settings/streak")}
//                 className="flex items-center gap-2 border border-orange-500 rounded-xl px-4 py-2 shadow-sm hover:shadow-md transition bg-orange-50 whitespace-nowrap"
//               >
//                 <span className="h-4 w-4 -mt-1"><img src="/yellow-tick.png" alt="" /></span>
//                 <span className="font-semibold text-orange-600 text-sm">{streakDays} day{streakDays !== 1 ? 's' : ''}</span>
//               </button>
//             </div>

//             {/* Existing greeting + bell */}
//             <div className="flex items-center gap-3 whitespace-nowrap ">
//               <span className="text-sm text-gray-700 flex items-center gap-1">
//                 Hi, <span className="font-semibold">{displayName}</span>
//               </span>

//               {/* <Link
//                 to="/notification"
//                 className="w-10 h-10 rounded-full bg-white/70 backdrop-blur border border-white/40 shadow flex items-center justify-center"
//               >
//                 <img src="/bell.png" className="w-5 h-5" />
//               </Link> */}
//               <Link
//                 to="/wellness/settings"
//                 className="w-10 h-10 rounded-full overflow-hidden border border-white/40 shadow"
//               >
//                 <img
//                   src={user.profile_image_url || "/Avatar-1.png"}
//                   alt="User Avatar"
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     (e.target as HTMLImageElement).src = "/Avatar-1.png";
//                   }}
//                 />
//               </Link>

//             </div>

//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// /* ========================= BLOCKS ======================= */

// /* ----- Activity: mobile (unchanged) ----- */
// const ActivitySectionMobile = () => {
//   const { activities } = (window as any).welcomeData;

//   const loopList = [...activities, ...activities];
//   const [autoScroll, setAutoScroll] = useState(true);

//   return (
//     <>
//       <div className="flex items-center justify-between mb-2">
//         <h2 className="font-semibold text-lg text-gray-900">Activity</h2>
//         <Link to="/activities" className="text-blue-600 text-sm font-medium">
//           See All
//         </Link>
//       </div>

//       <div
//         className={`relative overflow-x-auto ${autoScroll ? "scrollbar-none" : ""}`}
//         onClick={() => setAutoScroll(false)}
//       >
//         <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite" : ""}`}>
//           {loopList.map((a: any, i: number) => (
//             <ActivityCard
//               key={i}
//               title={a.title}
//               image={a.image_url}
//             />
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };


// /* ----- Activity: desktop (safer widths; no overflow) ----- */
// const ActivitySectionDesktop = () => {
//   const { activities } = (window as any).welcomeData;
//   const loopList = [...activities, ...activities];
//   const [autoScroll, setAutoScroll] = useState(true);

//   return (
//     <>
//       <div className="flex items-center justify-between mb-2">
//         <h2 className="font-semibold text-lg text-gray-900">Activity</h2>
//       </div>

//       <div className="relative overflow-x-auto scrollbar-none"
//         onClick={() => setAutoScroll(false)}>
//         <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite" : ""}`}>
//           {loopList.map((a: any, i: number) => (
//             <ActivityCard
//               key={i}
//               title={a.title}
//               image={a.image_url}
//             />
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };





// const ActivityCard = ({
//   title,
//   mobile = false,
//   image,
// }: {
//   title: string;
//   mobile?: boolean;
//   image?: string;
// }) => {
//   // Fallback for Calisthenics image
//   const getImageSrc = () => {
//     if (title.toLowerCase() === "calisthenics") {
//       return "/fitness_calesthenics.jpeg";
//     }
//     return image || "/strength-img.png";
//   };

//   return (
//     <div
//       className={`
//         bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 
//         ${mobile ? "min-w-[85%]" : "min-w-[380px]"} 
//         overflow-hidden
//       `}
//     >
//       <div className="flex-1 min-w-0 h-40">
//         <p className="text-[16px] mt-14 text-blue-700 font-semibold leading-tight truncate">
//           {title}
//         </p>
//         <p className="text-sm text-gray-500 mt-1 truncate">
//           Let's start tracking your activity for better health.
//         </p>
//       </div>

//       <div className="w-36 h-32 flex-shrink-0">
//         <img
//           src={getImageSrc()}
//           className="w-full h-full object-contain"
//         />
//       </div>
//     </div>
//   );
// };


// const ClubSection = ({ title }: { title: string }) => {
//   const { clubs } = (window as any).welcomeData;
//   const navigate = useNavigate();
//   return (
//     <div className="mb-8" data-tour="clubs-section">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold text-gray-900">{title}</h3>
//         <Link to="/clubs">
//           <p className="text-[#2563EB] text-sm font-medium">See All</p>
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
//         {clubs.slice(0, 2).map((c: any, index: number) => (
//           <div
//             key={c.id}
//             onClick={() => navigate(`/clubs/${c.id}`, { state: { club: c } })}
//             className="
//             bg-white rounded-2xl shadow p-3 border border-gray-100
//             cursor-pointer hover:shadow-lg transition
//           "
//           >
//             <img
//               src={c.image_url}
//               className="w-full h-28 rounded-xl object-cover"
//             />

//             <p className="font-semibold text-[12px] mt-2 text-blue-500">
//               {c.title}
//             </p>

//             <p className="text-[11px] mb-2 line-clamp-2">
//               {c.description}
//             </p>

//             <div className="text-[12px] flex items-center justify-between">
//               <span className="font-semibold">
//                 Rs.{c.price_per_day}/Day
//               </span>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); // 🔥 IMPORTANT
//                   handleBookNow(c);
//                 }}
//                 data-tour={index === 0 ? "add-to-cart" : undefined}
//                 className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700"
//               >
//                 Add to cart
//               </button>
//             </div>
//           </div>

//         ))}
//       </div>
//     </div>
//   );
// };

// /* A condensed clubs block for desktop left column */
// const ClubsBlock = ({ handleBookNow }) => {
//   const { clubs, clubsLoading } = (window as any).welcomeData;

//   if (clubsLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-3">
//         {/* Spinner */}
//         <div className="h-8 w-8 mt-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

//         {/* Text */}
//         <p className="text-gray-600 font-medium text-sm text-center">
//           📍 Fetching nearby clubs & events...
//         </p>
//       </div>

//     );
//   }
//   if (!clubs || clubs.length === 0) {
//     return (
//       <div className="text-center text-lg">
//         <p className="text-gray-700 mt-14">
//           Sorry...!  No clubs or eventst available for this locaion.
//         </p>
//       </div>
//     );
//   }

//   // Group clubs by price
//   const grouped = clubs.reduce((acc: any, c: any) => {
//     const price = c.price_per_day;
//     if (!acc[price]) acc[price] = [];
//     acc[price].push(c);
//     return acc;
//   }, {});

//   // Sort price groups like 30, 40, 50, 70...
//   const sortedPrices = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

//   return (
//     <div className="space-y-8" data-tour="clubs-section">
//       {sortedPrices.map((price, priceIndex) => (
//         <DynamicClubSection
//           key={price}
//           price={price}
//           clubs={grouped[price].slice(0, 2)}   // show only 2
//           fullClubs={grouped[price]}
//           handleBookNow={handleBookNow}          // pass full list
//           isFirstSection={priceIndex === 0}
//         />

//       ))}
//     </div>
//   );
// };
// const DynamicClubSection = ({
//   price,
//   clubs,
//   fullClubs,
//   handleBookNow,
//   isFirstSection
// }: {
//   price: string;
//   clubs: any[];
//   fullClubs: any[];
//   handleBookNow: (club: any) => void;
//   isFirstSection?: boolean;
// }) => {
//   const navigate = useNavigate(); // ✅ ADD THIS

//   return (
//     <div className="mb-8">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold text-gray-900">
//           Clubs at Rs. {price}/Day
//         </h3>

//         <Link
//           to={`/clubs?price=${price}`}
//           state={{ clubs: fullClubs }}
//           className="text-blue-600 text-sm font-medium hover:underline"
//         >
//           See All
//         </Link>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         {clubs.map((c: any, index: number) => (
//           <div
//             key={c.id}
//             onClick={() => navigate(`/clubs/${c.id}`, { state: { club: c } })} // ✅ ADD THIS
//             className="
//               bg-white rounded-2xl shadow p-3 border border-gray-100
//               cursor-pointer hover:shadow-lg transition
//             "
//           >
//             <img
//               src={c.image_url}
//               className="w-full h-28 rounded-xl object-cover"
//             />

//             <p className="font-semibold text-[12px] mt-2 text-blue-500">
//               {c.title}
//             </p>

//             <p className="text-[11px] mb-2 line-clamp-2">
//               {c.description}
//             </p>

//             <div className="text-[12px] flex items-center justify-between">
//               <span className="font-semibold">
//                 Rs.{c.price_per_day}/Day
//               </span>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); // ✅ VERY IMPORTANT
//                   handleBookNow(c);
//                 }}
//                 data-tour={isFirstSection && index === 0 ? "add-to-cart" : undefined}
//                 className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
//               >
//                 Add to cart
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


// /* ================= MOBILE: DYNAMIC CLUB SECTION ================= */

// const DynamicClubSectionMobile = () => {
//   const { clubs, clubsLoading } = (window as any).welcomeData;

//   if (clubsLoading) {
//     return (
//       <div className="mt-10 flex flex-col items-center justify-center gap-3">
//         {/* Spinner */}
//         <div className="h-8 w-8 mt-5 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

//         {/* Text */}
//         <p className="text-gray-600 font-medium text-sm text-center">
//           📍 Fetching nearby clubs & events...
//         </p>
//       </div>

//     );
//   }
//   if (!clubs || clubs.length === 0) {
//     return (
//       <div className="text-center">
//         <p className="text-gray-700 mt-14">
//           Sorry...! No clubs available for this location.
//         </p>
//       </div>
//     )
//   }
//   // group by price
//   const grouped = clubs.reduce((acc: any, c: any) => {
//     const price = c.price_per_day;
//     if (!acc[price]) acc[price] = [];
//     acc[price].push(c);
//     return acc;
//   }, {});

//   const sortedPrices = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

//   return (
//     <div className="space-y-6 mt-6">

//       {sortedPrices.map((price) => (
//         <div key={price}>

//           <div className="flex items-center justify-between mb-2">
//             <h3 className="font-semibold text-gray-900">
//               Clubs at Rs. {price}/Day
//             </h3>
//             <Link
//               to={`/clubs?price=${price}`}
//               state={{ clubs: grouped[price] }}
//               className="text-blue-600 text-xs font-medium"
//             >
//               See All
//             </Link>
//           </div>

//           {/* MOBILE GRID */}
//           <div className="grid grid-cols-2 gap-4">
//             {grouped[price].slice(0, 3).map((c: any) => (
//               <div
//                 key={c.id}
//                 className="bg-white rounded-2xl shadow p-3 border border-gray-100"
//               >
//                 <img 
//                   src={c.image_url || "/card-img.png"} 
//                   className="w-full h-24 rounded-xl object-cover" 
//                   style={{ 
//                     filter: 'none',
//                     imageRendering: 'auto',
//                     WebkitImageRendering: 'auto',
//                     transform: 'translateZ(0)',
//                     backfaceVisibility: 'hidden'
//                   }}
//                   loading="lazy"
//                   decoding="async"
//                 />
//                 <p className="font-semibold text-[12px] mt-2 text-blue-500">{c.title}</p>
//                 <p className="text-[11px] mb-1 line-clamp-2">{c.description}</p>

//                 <div className="text-[11px]">
//                   <span className="font-semibold">Rs {c.price_per_day}/Day</span>
//                 </div>

//                 <div className="flex gap-1 mt-1">
//                   {Array(Math.round(c.rating)).fill(0).map((_, i) => (
//                     <img key={i} src="/Star.png" className="w-3 h-3" />
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>

//         </div>
//       ))}

//     </div>
//   );
// };


// /* ---------------- NUTRITION (REAL DB) ---------------- */

// /** Fetch once per instance; we render different UIs via variant */
// const NutritionSection = ({ variant }: { variant: "mobile" | "desktop" }) => {
//   const [insight, setInsight] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("auth_token");

//     axios
//       .get(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/insight`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setInsight(res.data))
//       .catch(() =>
//         setInsight({
//           consumedCalories: 0,
//           targetCalories: 0,
//           protein: { consumed: 0, target: 0 },
//           fat: { consumed: 0, target: 0 },
//           carbs: { consumed: 0, target: 0 },
//         })
//       )
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="bg-white rounded-2xl p-6 text-center shadow">
//         Loading nutrition...
//       </div>
//     );
//   }

//   if (!insight) return null;

//   // keep a single geometry; we scale via viewBox + width/height per variant
//   const radius = 56;
//   const circumference = 2 * Math.PI * radius;
//   const progress = insight.targetCalories
//     ? Math.min((insight.consumedCalories / insight.targetCalories) * 100, 100)
//     : 0;
//   const offset = circumference - (progress / 100) * circumference;

//   const noInsight =
//     insight.consumedCalories === 0 &&
//     insight.protein?.consumed === 0 &&
//     insight.fat?.consumed === 0 &&
//     insight.carbs?.consumed === 0;

//   if (noInsight) {
//     return (
//       <div className="mt-3 text-lg font-semibold">
//         Nutrition
//         <div className="bg-white mt-2 rounded-2xl shadow-md p-4 md:p-6">

//           <div className="text-center text-gray-500 text-sm">
//             No nutrition data available yet.
//             <Link
//               to="/add-meal-manually"
//               className="text-blue-500 font-semibold block mt-2"
//             >
//               Log Your First Meal →
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // sizes per your choice B: Mobile w-36/h-36, Desktop w-48/h-48
//   const svgSizeClass = variant === "mobile" ? "w-36 h-36" : "w-48 h-48";

//   return (
//     <div className="mt-2 md:mt-0 min-w-0">
//       {variant === "mobile" && (
//         <>
//           <h2 className="font-semibold text-lg text-gray-900 mb-3">Nutrition</h2>
//           <div className="bg-white rounded-2xl shadow-md p-5">
//             <div className="flex justify-between items-center px-1">
//               <div className="text-center flex-1">
//                 <p className="text-gray-700 font-semibold text-base">
//                   {insight.consumedCalories}
//                 </p>
//                 <p className="text-gray-500 text-xs">consumed</p>
//               </div>

//               <div className="relative flex items-center justify-center flex-1">
//                 <svg viewBox="0 0 144 144" className={`${svgSizeClass} -rotate-90`}>
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r={radius}
//                     stroke="#E5E7EB"
//                     strokeWidth="8"
//                     fill="none"
//                   />
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r={radius}
//                     stroke="#2563EB"
//                     strokeWidth="8"
//                     fill="none"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={offset}
//                     strokeLinecap="round"
//                   />
//                 </svg>
//                 <div className="absolute inset-0 flex items-center justify-center text-center">
//                   <div>
//                     <p className="text-xl font-bold text-gray-900">
//                       {insight.consumedCalories}
//                     </p>
//                     <p className="text-gray-500 text-xs">kcal total</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="text-center flex-1">
//                 <p className="text-gray-700 font-semibold text-base">
//                   {insight.targetCalories}
//                 </p>
//                 <p className="text-gray-500 text-xs">target</p>
//               </div>
//             </div>

//             {/* MACROS */}
//             <div className="flex justify-between px-2 mt-6 text-gray-700 font-medium text-sm">
//               <span>Protein</span>
//               <span>Fat</span>
//               <span>Carbs</span>
//             </div>

//             <div className="flex justify-between px-2 mt-3 gap-3">
//               <MacroBar
//                 colorClass="bg-red-500"
//                 consumed={insight.protein.consumed}
//                 target={insight.protein.target}
//                 label="Protein"
//               />
//               <MacroBar
//                 colorClass="bg-green-600"
//                 consumed={insight.fat.consumed}
//                 target={insight.fat.target}
//                 label="Fat"
//               />
//               <MacroBar
//                 colorClass="bg-yellow-400"
//                 consumed={insight.carbs.consumed}
//                 target={insight.carbs.target}
//                 label="Carbs"
//               />
//             </div>

//             <Link
//               to="/nutrition/home"
//               className="text-blue-600 flex font-semibold text-sm mt-4 justify-center gap-2"
//             >
//               See Nutrition Dashboard
//               <img src="/arrow right.png" className="w-4 h-4 mt-0.5" />
//             </Link>
//           </div>
//         </>
//       )}

//       {variant === "desktop" && (
//         <>
//           <h2 className="font-semibold text-lg text-gray-900 mb-3">Nutrition</h2>
//           <div className="bg-white rounded-2xl shadow-md p-6">
//             <div className="grid grid-cols-3 items-center gap-4 px-2">
//               <div className="text-center">
//                 <p className="text-gray-700 font-semibold text-lg">
//                   {insight.consumedCalories}
//                 </p>
//                 <p className="text-gray-500 text-sm">consumed</p>
//               </div>

//               <div className="relative flex items-center justify-center">
//                 <svg viewBox="0 0 144 144" className={`${svgSizeClass} -rotate-90`}>
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r={radius}
//                     stroke="#E5E7EB"
//                     strokeWidth="8"
//                     fill="none"
//                   />
//                   <circle
//                     cx="72"
//                     cy="72"
//                     r={radius}
//                     stroke="#2563EB"
//                     strokeWidth="8"
//                     fill="none"
//                     strokeDasharray={circumference}
//                     strokeDashoffset={offset}
//                     strokeLinecap="round"
//                   />
//                 </svg>

//                 <div className="absolute text-center">
//                   <p className="text-3xl font-bold text-gray-900">
//                     {insight.consumedCalories}
//                   </p>
//                   <p className="text-gray-500 text-sm">kcal total</p>
//                 </div>
//               </div>

//               <div className="text-center">
//                 <p className="text-gray-700 font-semibold text-lg">
//                   {insight.targetCalories}
//                 </p>
//                 <p className="text-gray-500 text-sm">target</p>
//               </div>
//             </div>

//             {/* MACROS */}
//             <div className="flex justify-between px-2 mt-6 text-gray-700 font-medium text-sm">
//               <span>Protein</span>
//               <span>Fat</span>
//               <span>Carbs</span>
//             </div>

//             <div className="flex justify-between px-2 mt-3 gap-3">
//               <MacroBar
//                 colorClass="bg-red-500"
//                 consumed={insight.protein.consumed}
//                 target={insight.protein.target}
//                 label="Protein"
//               />
//               <MacroBar
//                 colorClass="bg-green-600"
//                 consumed={insight.fat.consumed}
//                 target={insight.fat.target}
//                 label="Fat"
//               />
//               <MacroBar
//                 colorClass="bg-yellow-400"
//                 consumed={insight.carbs.consumed}
//                 target={insight.carbs.target}
//                 label="Carbs"
//               />
//             </div>

//             <Link
//               to="/nutrition-dashboard"
//               className="text-blue-600 flex font-semibold text-sm mt-4 justify-center gap-2"
//             >
//               See Nutrition Dashboard
//               <img src="/arrow right.png" className="w-4 h-4 mt-0.5" />
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// const MacroBar = ({
//   colorClass,
//   consumed,
//   target,
//   label,
// }: {
//   colorClass: string;
//   consumed: number;
//   target: number;
//   label: string;
// }) => (
//   <div className="flex-1">
//     <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1">
//       <div
//         className={`h-full ${colorClass} rounded-full`}
//         style={{
//           width: `${target ? Math.min((consumed / target) * 100, 100) : 0}%`,
//         }}
//       />
//     </div>
//     <p className="text-gray-700 text-xs font-bold text-center">
//       {consumed}/{target}g
//     </p>
//   </div>
// );

// const CycleSection = () => (
//   <div className="mb-8 mt-4 md:mt-0 min-w-0">
//     <h2 className="font-semibold text-lg text-gray-900 mb-3">Cycles</h2>

//     <div className="bg-white rounded-2xl shadow p-5">
//       <div className="flex items-center justify-between mb-2">
//         <div>
//           <p className="font-bold text-xl text-gray-900">Period</p>
//           <p className="text-gray-500 text-sm">Started today</p>
//         </div>
//         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//           <img src="/calendar-blue.png" className="w-5 h-5" />
//         </div>
//       </div>

//       <div className="flex justify-between mt-4 mb-4">
//         {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
//           <div key={i} className="flex flex-col items-center">
//             <div
//               className={`w-4 h-4 rounded-full ${i < 4 ? "bg-red-400" : "bg-gray-300"
//                 }`}
//             />
//             <p className="text-gray-500 text-xs mt-2">{d}</p>
//           </div>
//         ))}
//       </div>

//       <div className="text-center mt-3">
//         <Link
//           to="/period/dashboard"
//           data-tour="period-tracker-link"
//           className="text-blue-600 font-semibold text-sm flex justify-center items-center gap-2 cursor-pointer"
//         >
//           Period Tracker <img src="arrow right.png" alt="" />
//         </Link>
//       </div>
//     </div>
//   </div>
// );

// const DoctorAppointmentCard = () => (
//   <div className="bg-white rounded-2xl shadow p-5">
//     <h3 className="text-gray-900 font-semibold text-lg mb-3">
//       Doctor Appointment
//     </h3>

//     <div className="flex justify-center gap-4 mb-4">
//       <img src="/Avatar-DR.png" className="w-10 h-10 rounded-full" />
//       <img src="/Avatar-2.png" className="w-11 h-11 rounded-full" />
//       <img src="/centre-ava.png" className="w-13 h-13 rounded-full" />
//       <img src="/Avatar-4.png" className="w-11 h-11 rounded-full" />
//       <img src="/Avatar-5.png" className="w-10 h-10 rounded-full" />
//     </div>

//     <p className="text-center text-gray-600 text-sm mb-3">
//       You don't have any doctor appointment.
//     </p>

//     {/* ⭐ Blinking / Pulsing Button */}
//     <p className="text-blue-600 text-md font-semibold flex justify-center items-center gap-1 cursor-pointer animate-blink">
//       Explore Doctor – coming soon <img src="/blue-search.png" />
//     </p>
//   </div>
// );


// const FAQsCard = () => {
//   const [openIndex, setOpenIndex] = useState<number | null>(null);

//   const faqs = [
//     {
//       question: "How do I book a fitness club session?",
//       answer: "You can browse available clubs on the welcome page, filter by price, and click on any club to view details and book a session. Most clubs offer daily passes starting from Rs. 30/day."
//     },
//     {
//       question: "How does the nutrition tracking work?",
//       answer: "Log your meals through the Nutrition section. Our AI assistant helps track calories, macros (protein, carbs, fats), and provides personalized insights based on your goals and preferences."
//     },
//     {
//       question: "Can I track my period cycle on FitFare?",
//       answer: "Yes! Female users can access the Period Tracker feature to log cycles, track symptoms, and get predictions for upcoming periods. Navigate to 'Periods Cycle' in the sidebar to get started."
//     },
//     {
//       question: "What is the FitFare Score?",
//       answer: "Your FitFare Score reflects your overall health and fitness engagement. It's calculated based on your activity tracking, nutrition logging, and consistent app usage. Higher scores unlock premium features!"
//     },
//     {
//       question: "How do I contact support?",
//       answer: "You can reach our support team at fitfaresupport@gmail.com or use the Contact Support option in the app. We typically respond within 24 hours."
//     },
//     {
//       question: "Are there membership plans available?",
//       answer: "Yes! We offer various membership tiers including Plus Member benefits. Check your profile settings or contact support to learn more about available plans and pricing."
//     }
//   ];

//   const toggleFAQ = (index: number) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <div className="bg-white rounded-2xl shadow p-5">
//       <div className="flex items-center justify-center  mb-4">
//         <h3 className="text-gray-900  font-semibold text-2xl ">
//           Frequently Asked Questions
//         </h3>
//         {/* <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//         </div> */}
//       </div>

//       <div className="space-y-3">
//         {faqs.map((faq, index) => (
//           <div key={index} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
//             <button
//               onClick={() => toggleFAQ(index)}
//               className="w-full text-left flex items-center justify-between gap-4 py-2"
//             >
//               <span className="text-gray-800 font-medium text-sm flex-1">
//                 {faq.question}
//               </span>
//               <span className={`text-blue-600 text-xl font-bold transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>
//                 {openIndex === index ? '−' : '+'}
//               </span>
//             </button>
//             {openIndex === index && (
//               <div className="mt-2 text-gray-600 text-sm leading-relaxed pl-0 pr-4">
//                 {faq.answer}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// /* ========================= TESTIMONIALS SECTION ======================= */

// const TestimonialsSection = () => {
//   const testimonials = [
//     {
//       quote: "As a college student, I love that I can hit the gym without any monthly commitment. FitFare gives me the flexibility to work out wherever and whenever I want!",
//       name: "Shubhangi Wakad",
//       role: "Collegian",
//       image: "/wakad.jpg"
//     },
//     {
//       quote: "With my hectic work schedule, FitFare pay-per-use model fits perfectly into my lifestyle. I've discovered new gyms nearby and only pay when I actually go!",
//       name: "Jai Kaushik",
//       role: "Software Engineer",
//       image: "/kaushik.jpg"
//     },
//     {
//       quote: "Staying fit was hard with my travel-packed job, but FitFare made it seamless. I now explore different gyms without locking into long-term plans or wasting money.",
//       name: "Rohit Mote",
//       role: "Business Owner",
//       image: "/RohitMote.jpg"
//     },
//     {
//       quote: "As a freelancer, my income varies monthly. FitFare's flexible payment system is perfect - I work out when I can afford it, without any pressure or hidden fees.",
//       name: "Omkar Jadhav",
//       role: "Student",
//       image: "/omkar.jpeg"
//     },
//     {
//       quote: "I moved to a new city and didn't want to commit to a gym. FitFare helped me explore multiple fitness centers and find the perfect one for my workout style!",
//       name: "Pratap Majge",
//       role: "Student",
//       image: "/Pratap.jpeg"
//     },
//     {
//       quote: "The best part about FitFare is trying different gyms. I've discovered amazing facilities I never knew existed in my area. It's like a fitness adventure!",
//       name: "Arshia Chandarki",
//       role: "Student",
//       image: "/arshia.jpeg"
//     },
//     {
//       quote: "I'm a fitness enthusiast who loves variety. FitFare lets me do yoga one day, hit the weights the next, and try a new Zumba class - all without multiple memberships!",
//       name: "Prerna Biradar",
//       role: "Student",
//       image: "/prerna.jpeg"
//     },
//     {
//       quote: "Working night shifts made traditional gym memberships useless. With FitFare, I can work out at any time that suits my schedule. Game changer!",
//       name: "Meera Joshi",
//       role: "Nurse",
//       image: "/meerajoshi.jfif"
//     },
//     {
//       quote: "I was skeptical about pay-per-use, but FitFare proved me wrong. I'm actually saving money and working out more consistently than ever before!",
//       name: "Vikram Singh",
//       role: "Teacher",
//       image: "/vikramsingh.jfif"
//     },
//     {
//       quote: "The app is so user-friendly! Booking a session takes seconds, and I love seeing all available gyms nearby. FitFare has made fitness accessible and affordable.",
//       name: "Ananya Desai",
//       role: "Student",
//       image: "/ananyadesai.jfif"
//     },
//     {
//       quote: "As a mom of two, I have limited time. FitFare lets me squeeze in quick workouts at different locations without the commitment of a full membership.",
//       name: "Kavita Nair",
//       role: "Homemaker",
//       image: "/kavitanair.jfif"
//     }
//   ];

//   const loopList = [...testimonials, ...testimonials];
//   const [autoScroll, setAutoScroll] = useState(true);

//   return (
//     <div className="mb-8 mt-4 md:mt-0 min-w-0">
//       <h2 className="font-semibold text-2xl text-center text-gray-900 mb-3">Testimonials</h2>
//       <div
//         className={`relative overflow-x-auto ${autoScroll ? "scrollbar-none" : ""}`}
//         onClick={() => setAutoScroll(false)}
//       >
//         <div className={`flex gap-4 ${autoScroll ? "animate-slide-infinite-slow" : ""}`}>
//           {loopList.map((testimonial, i) => (
//             <TestimonialCard
//               key={i}
//               quote={testimonial.quote}
//               name={testimonial.name}
//               role={testimonial.role}
//               image={testimonial.image}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const TestimonialCard = ({
//   quote,
//   name,
//   role,
//   image,
// }: {
//   quote: string;
//   name: string;
//   role: string;
//   image: string;
// }) => {
//   return (
//     <div className="bg-white rounded-2xl shadow-lg p-6 w-[320px] sm:w-[400px] h-[400px] flex flex-col justify-between flex-shrink-0">
//       {/* Stars */}
//       <div className="flex gap-1 mb-2">
//         {[...Array(5)].map((_, i) => (
//           <svg
//             key={i}
//             className="w-5 h-5 text-yellow-400"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//           </svg>
//         ))}
//       </div>

//       {/* Quote */}
//       <p className="text-gray-700 text-sm sm:text-base flex-grow leading-relaxed">
//         "{quote}"
//       </p>

//       {/* User Info */}
//       <div className="flex items-center gap-3 mt-4">
//         <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
//           <img
//             src={image}
//             alt={name}
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               (e.target as HTMLImageElement).src = "/Avatar-1.png";
//             }}
//           />
//         </div>
//         <div>
//           <p className="font-semibold text-gray-900 text-sm sm:text-base">
//             {name}
//           </p>
//           <p className="text-gray-600 text-xs sm:text-sm">{role}</p>
//         </div>
//       </div>
//     </div>
//   );
// };


// const RateAppCard = () => (
//   <div className="bg-white rounded-2xl shadow p-5">
//     <h3 className="text-center font-semibold text-gray-900 text-lg mb-3">
//       Rate Our App
//     </h3>

//     <p className="text-center text-gray-600 text-sm mb-4">
//       Help us improve our platform by giving your feedback.
//     </p>

//     <div className="flex justify-center gap-4 my-3">
//       <Link to="/wellness/feedback">
//         <img src="depressed.png" />
//       </Link>
//       <Link to="/wellness/feedback">
//         <img src="sad.png" />
//       </Link>
//       <Link to="/wellness/feedback">
//         <img src="neutral.png" />
//       </Link>
//       <Link to="/wellness/feedback">
//         <img src="happy.png" />
//       </Link>
//       <Link to="/wellness/feedback">
//         <img src="overjoyed.png" />
//       </Link>
//     </div>
//   </div>
// );

// const SupportCard = () => (

//   <div className="col-span-12">
//     {/* <SupportCard /> */}
//     <div className="block mt-4 justify-center flex gap-2 items-center"
//     >
//       contact us at
//       <a
//         href="mailto:fitfaresupport@gmail.com"
//         className="flex gap-1 text-blue-600"
//       >
//         fitfaresupport@gmail.com
//         <img src="arrow right.png" className="h-5 mt-1" />
//       </a>
//     </div>
//   </div>

// );

// /* ========================= SIDEBAR ======================= */

// const Sidebar = ({ sidebarOpen, userGender }: { sidebarOpen: boolean; userGender: string | null }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const navigate = useNavigate();

//   return (
//     <>
//       {/* ========= MOBILE: bottom nav (unchanged) ========= */}
//       <div
//         className="
//           md:hidden
//           fixed bottom-0 left-0 right-0 z-50
//           bg-white border-t shadow-md
//           flex items-center justify-between px-8 py-4
//         "
//       >
//         <Link to="/welcome" className="flex flex-col items-center text-gray-600">
//           <img src="/home-gray.png" className="w-6 h-6" />
//           <span className="text-[11px] mt-1">Home</span>
//         </Link>

//         <Link
//           to="/wellness/ai-chat"
//           className="flex flex-col items-center text-gray-600"
//         >
//           <img src="/ai-pic.png" className="w-6 h-6" />
//           <span className="text-[11px] mt-1">AI Assistant</span>
//         </Link>

//         {/* center add button */}
//         <button
//           onClick={() => setMenuOpen(true)}
//           className="w-14 h-14 flex items-center justify-center active:scale-95 transition"
//           title="Quick actions"
//         >
//           <img src="/Button Icon (1).png" className="w-16 h-16 mt-5" />
//         </button>

//         <Link to="/bookings" className="flex flex-col items-center text-gray-600">
//           <img src="/resources.png" className="w-6 h-6" />
//           <span className="text-[11px] mt-1">My Bookings</span>
//         </Link>

//         <Link
//           to="/wellness/settings"
//           className="flex flex-col items-center text-gray-600"
//         >
//           <img src="/profile" className="w-6 h-6" />
//           <span className="text-[11px] mt-1">Profile</span>
//         </Link>
//       </div>

//       {/* Quick actions popup (mobile & desktop) */}
//       {menuOpen && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
//             onClick={() => setMenuOpen(false)}
//           />
//           <div
//             className="
//               fixed bottom-24 left-0 right-0 mx-auto w-[90%] max-w-xs
//               bg-white rounded-3xl shadow-xl p-6 flex justify-around z-[70]
//             "
//           >
//             <PopupItem icon="/leaf.png" label="Nutrition" link="/nutrition/home" />
//             {userGender === 'Female' || userGender === null ? (
//               <PopupItem icon="/cycle.png" label="Cycles" link="/cycles" />
//             ) : (
//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   navigate("/period-restricted");
//                 }}
//                 className="flex flex-col items-center gap-1"
//               >
//                 <img src="/cycle.png" className="w-8 h-8 opacity-50" />
//                 <span className="text-[10px] text-gray-500">Cycles</span>
//               </button>
//             )}
//             {/* <PopupItem icon="/dr.png" label="Doctor App" /> */}
//           </div>
//         </>
//       )}

//       {/* ========= DESKTOP: left sidebar ========= */}
//       <div
//         className={`
//           hidden md:flex md:flex-col md:justify-start
//           md:fixed md:top-0 md:left-0 md:h-full
//           bg-white border-r shadow-sm
//           transition-all duration-300 ease-in-out
//           ${sidebarOpen ? "md:w-60" : "md:w-20"}
//         `}
//       >
//         {/* NOTE: Hamburger removed from inside. It is now fixed at top-left outside. */}
//         <div className="mt-[100px] flex flex-col gap-8 px-3">
//           <Link to="/welcome">
//             <NavItem
//               icon="/home-gray.png"
//               label="Home"
//               sidebarOpen={sidebarOpen}
//             />
//           </Link>

//           <Link to="/wellness/ai-chat" data-tour="ai-assistant">
//             <NavItem
//               icon="/ai-pic.png"
//               label="AI Assistant"
//               sidebarOpen={sidebarOpen}
//             />
//           </Link>

//           <Link to="/bookings">
//             <NavItem
//               icon="/resources.png"
//               label="My Bookings"
//               sidebarOpen={sidebarOpen}
//             />
//           </Link>

//           {userGender === 'Female' || userGender === null ? (
//             <Link to="/cycles" data-tour="periods-cycle">
//               <NavItem
//                 icon="/cycle-1.png"
//                 label="Periods Cycle"
//                 sidebarOpen={sidebarOpen}
//               />
//             </Link>
//           ) : null}

//           <Link to="/nutrition/home" data-tour="nutrition">
//             <NavItem
//               icon="/leaf-1.png"
//               label="Nutrition"
//               sidebarOpen={sidebarOpen}
//             />
//           </Link>

//           <Link to="/wellness/settings">
//             <NavItem
//               icon="/Monotone add (6).png"
//               label="Profile"
//               sidebarOpen={sidebarOpen}
//             />
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// };

// /* aligned desktop nav item */
// const NavItem = ({
//   icon,
//   label,
//   sidebarOpen,
// }: {
//   icon: string;
//   label: string;
//   sidebarOpen: boolean;
// }) => {
//   const isNutrition = icon.includes('Vector (17)');
//   return (
//     <div
//       className={`
//         flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer
//         text-gray-700 hover:bg-blue-50 hover:text-blue-600
//         transition-all
//         ${sidebarOpen ? "justify-start" : "justify-center"}
//       `}
//     >
//       <img
//         src={icon}
//         className="w-6 h-6"
//         style={isNutrition ? { filter: 'grayscale(100%) brightness(0.5) opacity(0.7)' } : {}}
//       />
//       {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
//     </div>
//   );
// };

// const PopupItem = ({
//   icon,
//   label,
//   link = "#",
// }: {
//   icon: string;
//   label: string;
//   link?: string;
// }) => (
//   <Link to={link} className="flex flex-col items-center">
//     <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
//       <img src={icon} />
//     </div>
//     <span className="text-xs mt-1">{label}</span>
//   </Link>
// );


