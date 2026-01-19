// src/routes/clubSection.js
import express from "express";
import { pool } from "../db/connection.js";
import { getImageUrl } from "../utils/imageUrlMapper.js";

const router = express.Router();

/**
 * Helper function to map image URLs to Cloudinary CDN
 */
function mapImageUrls(clubs) {
  return clubs.map(club => ({
    ...club,
    image_url: getImageUrl(club.image_url)
  }));
}

/**
 * Helper function to get hardcoded clubs based on city
 */
function getHardcodedClubsForCity(city) {
  const normalizedCity = (city || "").toLowerCase().trim();
  
  // Pune clubs
  if (normalizedCity.includes("pune")) {
    return [
      {
        id: 1,
        name: "FitZone Kothrud",
        title: "FitZone Kothrud",
        description: "Popular neighbourhood gym with cardio and basic strength training equipment.",
        location: "Pune",
        price_per_day: 30,
        rating: 4.1,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543210"
      },
      {
        id: 2,
        name: "MusclePoint Shivajinagar",
        title: "MusclePoint Shivajinagar",
        description: "Well-maintained gym known for budget-friendly plans and good trainers.",
        location: "Pune",
        price_per_day: 30,
        rating: 4.3,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Personal Training"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-9876543211"
      },
      {
        id: 3,
        name: "IronCore FC Road",
        title: "IronCore FC Road",
        description: "High-rated fitness club with strength training, cardio, and professional trainers.",
        location: "Pune",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543212"
      },
      {
        id: 4,
        name: "PrimeFit Viman Nagar",
        title: "PrimeFit Viman Nagar",
        description: "Modern gym with professional trainers and high-quality equipment.",
        location: "Pune",
        price_per_day: 40,
        rating: 4.4,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543213"
      }
    ];
  }
  
  // Bengaluru clubs
  if (normalizedCity.includes("bengaluru") || normalizedCity.includes("bangalore")) {
    return [
      {
        id: 101,
        name: "Play on Fitness HSR Layout",
        title: "Play on Fitness HSR Layout",
        description: "Modern fitness center in HSR Layout with state-of-the-art equipment and professional trainers.",
        location: "Bengaluru",
        price_per_day: 35,
        rating: 4.6,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights", "Yoga"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543301"
      },
      {
        id: 102,
        name: "Snap Fitness Kaggadasapura Main Road",
        title: "Snap Fitness Kaggadasapura Main Road",
        description: "Premium gym on Kaggadasapura Main Road with advanced equipment and personalized training programs.",
        location: "Bengaluru",
        price_per_day: 40,
        rating: 4.7,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Personal Training", "Group Classes"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543302"
      },
      {
        id: 103,
        name: "Power House Gym Shampura Main Road",
        title: "Power House Gym Shampura Main Road",
        description: "High-end fitness club on Shampura Main Road with comprehensive facilities and expert trainers.",
        location: "Bengaluru",
        price_per_day: 45,
        rating: 4.8,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543303"
      },
      {
        id: 104,
        name: "Fitness World Kshithija Complex",
        title: "Fitness World Kshithija Complex",
        description: "Well-equipped fitness center in Kshithija Complex with modern amenities and professional trainers.",
        location: "Bengaluru",
        price_per_day: 30,
        rating: 4.5,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights", "Group Classes"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-9876543304"
      },
      {
        id: 105,
        name: "Golden Gym RT Nagar",
        title: "Golden Gym RT Nagar",
        description: "Popular gym in RT Nagar with essential equipment and budget-friendly plans.",
        location: "Bengaluru",
        price_per_day: 30,
        rating: 4.3,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9731061772"
      },
      {
        id: 106,
        name: "Rebels Fitness One Sahakara Nagar",
        title: "Rebels Fitness One Sahakara Nagar",
        description: "Modern fitness center in Sahakara Nagar with comprehensive workout facilities.",
        location: "Bengaluru",
        price_per_day: 35,
        rating: 4.4,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9986123569"
      },
      {
        id: 107,
        name: "Life Fitness Gym Nagarbhavi",
        title: "Life Fitness Gym Nagarbhavi",
        description: "Well-maintained gym in Nagarbhavi with essential equipment for daily workouts.",
        location: "Bengaluru",
        price_per_day: 30,
        rating: 4.2,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-8431232307"
      },
      {
        id: 108,
        name: "Fitness Vitness Sahakara Nagar",
        title: "Fitness Vitness Sahakara Nagar",
        description: "Trendy fitness center in Sahakara Nagar with modern amenities and group classes.",
        location: "Bengaluru",
        price_per_day: 35,
        rating: 4.5,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Dance"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9740821019"
      },
      {
        id: 109,
        name: "cult.Fit Kalyan Nagar",
        title: "cult.Fit Kalyan Nagar",
        description: "Premium fitness club in Kalyan Nagar with comprehensive facilities and expert trainers.",
        location: "Bengaluru",
        price_per_day: 40,
        rating: 4.6,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Group Classes", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-7026570253"
      }
    ];
  }
  
  // Mumbai clubs
  if (normalizedCity.includes("mumbai")) {
    return [
      {
        id: 201,
        name: "FitZone Bandra",
        title: "FitZone Bandra",
        description: "Trendy fitness center in the heart of Bandra with modern amenities.",
        location: "Mumbai",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Dance"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543201"
      },
      {
        id: 202,
        name: "Elite Fitness Andheri",
        title: "Elite Fitness Andheri",
        description: "Premium gym with advanced equipment and expert trainers.",
        location: "Mumbai",
        price_per_day: 45,
        rating: 4.6,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Personal Training", "Spa"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543202"
      },
      {
        id: 203,
        name: "PowerHouse Gym Juhu",
        title: "PowerHouse Gym Juhu",
        description: "Well-equipped fitness center near Juhu Beach with modern facilities and professional trainers.",
        location: "Mumbai",
        price_per_day: 40,
        rating: 4.4,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543203"
      },
      {
        id: 204,
        name: "FitLife Worli",
        title: "FitLife Worli",
        description: "Modern gym in Worli with state-of-the-art equipment and group fitness classes.",
        location: "Mumbai",
        price_per_day: 45,
        rating: 4.7,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Group Classes", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543204"
      },
      {
        id: 205,
        name: "MuscleMax Powai",
        title: "MuscleMax Powai",
        description: "Popular neighborhood gym in Powai with essential equipment and budget-friendly plans.",
        location: "Mumbai",
        price_per_day: 35,
        rating: 4.3,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-9876543205"
      },
      {
        id: 206,
        name: "FlexFit Chembur",
        title: "FlexFit Chembur",
        description: "Well-maintained fitness center in Chembur with comprehensive workout facilities.",
        location: "Mumbai",
        price_per_day: 35,
        rating: 4.2,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543206"
      },
      {
        id: 207,
        name: "PrimeFit Borivali",
        title: "PrimeFit Borivali",
        description: "Modern fitness club in Borivali with advanced equipment and expert trainers.",
        location: "Mumbai",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Personal Training"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543207"
      },
      {
        id: 208,
        name: "ActiveZone Thane",
        title: "ActiveZone Thane",
        description: "Premium fitness center in Thane with comprehensive facilities and group classes.",
        location: "Mumbai",
        price_per_day: 40,
        rating: 4.4,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Dance", "Group Classes"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543208"
      }
    ];
  }
  
  // Hyderabad clubs
  if (normalizedCity.includes("hyderabad")) {
    return [
      {
        id: 301,
        name: "FitZone Hitech City",
        title: "FitZone Hitech City",
        description: "Modern fitness center near tech hub with state-of-the-art facilities.",
        location: "Hyderabad",
        price_per_day: 35,
        rating: 4.4,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543401"
      },
      {
        id: 302,
        name: "PowerFit Banjara Hills",
        title: "PowerFit Banjara Hills",
        description: "Premium gym in upscale area with comprehensive fitness programs.",
        location: "Hyderabad",
        price_per_day: 50,
        rating: 4.7,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Pool", "Sauna", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543402"
      },
      {
        id: 303,
        name: "Elite Fitness Gachibowli",
        title: "Elite Fitness Gachibowli",
        description: "Well-equipped fitness center in Gachibowli with modern amenities and professional trainers.",
        location: "Hyderabad",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training", "Yoga", "Personal Training"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543403"
      },
      {
        id: 304,
        name: "MuscleMax Secunderabad",
        title: "MuscleMax Secunderabad",
        description: "Popular neighborhood gym in Secunderabad with essential equipment and budget-friendly plans.",
        location: "Hyderabad",
        price_per_day: 30,
        rating: 4.3,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-9876543404"
      },
      {
        id: 305,
        name: "FlexFit Jubilee Hills",
        title: "FlexFit Jubilee Hills",
        description: "Modern fitness club in Jubilee Hills with advanced equipment and group fitness classes.",
        location: "Hyderabad",
        price_per_day: 45,
        rating: 4.6,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Group Classes", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543405"
      },
      {
        id: 306,
        name: "PrimeFit Kondapur",
        title: "PrimeFit Kondapur",
        description: "Well-maintained fitness center in Kondapur with comprehensive workout facilities.",
        location: "Hyderabad",
        price_per_day: 35,
        rating: 4.2,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543406"
      },
      {
        id: 307,
        name: "ActiveZone Madhapur",
        title: "ActiveZone Madhapur",
        description: "Trendy fitness center in Madhapur with modern amenities and expert trainers.",
        location: "Hyderabad",
        price_per_day: 40,
        rating: 4.4,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Dance", "Group Classes"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543407"
      },
      {
        id: 308,
        name: "FitLife Kukatpally",
        title: "FitLife Kukatpally",
        description: "Premium fitness club in Kukatpally with comprehensive facilities and group classes.",
        location: "Hyderabad",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543408"
      }
    ];
  }
  
  // Delhi clubs
  if (normalizedCity.includes("delhi")) {
    return [
      {
        id: 401,
        name: "FitZone Connaught Place",
        title: "FitZone Connaught Place",
        description: "Central Delhi gym with modern equipment and professional trainers.",
        location: "Delhi",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543501"
      },
      {
        id: 402,
        name: "Elite Fitness Saket",
        title: "Elite Fitness Saket",
        description: "Premium fitness club with comprehensive facilities and expert trainers.",
        location: "Delhi",
        price_per_day: 45,
        rating: 4.6,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Personal Training", "Spa"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543502"
      },
      {
        id: 403,
        name: "PowerHouse Gym Gurgaon",
        title: "PowerHouse Gym Gurgaon",
        description: "Well-equipped fitness center in Gurgaon with modern facilities and professional trainers.",
        location: "Delhi",
        price_per_day: 40,
        rating: 4.4,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training", "Yoga"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543503"
      },
      {
        id: 404,
        name: "MuscleMax Dwarka",
        title: "MuscleMax Dwarka",
        description: "Popular neighborhood gym in Dwarka with essential equipment and budget-friendly plans.",
        location: "Delhi",
        price_per_day: 35,
        rating: 4.3,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
        opening_hours: "6 AM - 9 PM",
        contact_number: "+91-9876543504"
      },
      {
        id: 405,
        name: "FlexFit Noida",
        title: "FlexFit Noida",
        description: "Modern fitness club in Noida with advanced equipment and group fitness classes.",
        location: "Delhi",
        price_per_day: 40,
        rating: 4.5,
        image_url: "/card-img.png",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Group Classes", "Personal Training"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543505"
      },
      {
        id: 406,
        name: "PrimeFit Rohini",
        title: "PrimeFit Rohini",
        description: "Well-maintained fitness center in Rohini with comprehensive workout facilities.",
        location: "Delhi",
        price_per_day: 35,
        rating: 4.2,
        image_url: "/gym-3.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Strength Training"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543506"
      },
      {
        id: 407,
        name: "ActiveZone Vasant Kunj",
        title: "ActiveZone Vasant Kunj",
        description: "Trendy fitness center in Vasant Kunj with modern amenities and expert trainers.",
        location: "Delhi",
        price_per_day: 45,
        rating: 4.6,
        image_url: "/gym-4.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Dance", "Group Classes"]),
        opening_hours: "6 AM - 10 PM",
        contact_number: "+91-9876543507"
      },
      {
        id: 408,
        name: "FitLife Greater Kailash",
        title: "FitLife Greater Kailash",
        description: "Premium fitness club in Greater Kailash with comprehensive facilities and group classes.",
        location: "Delhi",
        price_per_day: 45,
        rating: 4.7,
        image_url: "/gym-6.jfif",
        facilities: JSON.stringify(["Gym", "Cardio", "Yoga", "Personal Training", "Spa"]),
        opening_hours: "5 AM - 11 PM",
        contact_number: "+91-9876543508"
      }
    ];
  }
  
  // Default: return Pune clubs if city doesn't match
  return [
    {
      id: 1,
      name: "FitZone Kothrud",
      title: "FitZone Kothrud",
      description: "Popular neighbourhood gym with cardio and basic strength training equipment.",
      location: "Pune",
      price_per_day: 30,
      rating: 4.1,
      image_url: "/card-img.png",
      facilities: JSON.stringify(["Gym", "Cardio", "Weights"]),
      opening_hours: "6 AM - 10 PM",
      contact_number: "+91-9876543210"
    },
    {
      id: 2,
      name: "MusclePoint Shivajinagar",
      title: "MusclePoint Shivajinagar",
      description: "Well-maintained gym known for budget-friendly plans and good trainers.",
      location: "Pune",
      price_per_day: 30,
      rating: 4.3,
      image_url: "/gym-3.jfif",
      facilities: JSON.stringify(["Gym", "Cardio", "Personal Training"]),
      opening_hours: "6 AM - 9 PM",
      contact_number: "+91-9876543211"
    }
  ];
}

/**
 * GET /api/club-section?city=Pune
 * Fetch clubs with city filter (required)
 * Public route - no authentication required for browsing clubs
 */
router.get("/club-section", async (req, res) => {
  try {
    const { city } = req.query;
    console.log(`[club-section] Received request for city: "${city}"`);

    if (!city) {
      console.log(`[club-section] No city provided`);
      return res.status(400).json({ error: "City is required" });
    }

    // Handle variations: "Pune", "Pune City", "Pune city", etc.
    const searchCity = city.trim();
    
    // ALWAYS use hardcoded clubs for city-based requests to ensure correct city-specific clubs
    // This ensures Bengaluru shows Bengaluru clubs, Pune shows Pune clubs, etc.
    console.log(`[club-section] Using hardcoded clubs for "${searchCity}"`);
    const hardcodedClubs = getHardcodedClubsForCity(searchCity);
    // Map image URLs to Cloudinary CDN for instant loading
    const clubsWithCloudinaryUrls = mapImageUrls(hardcodedClubs);
    console.log(`[club-section] Returning ${clubsWithCloudinaryUrls.length} hardcoded clubs for "${searchCity}"`);
    return res.json({ clubs: clubsWithCloudinaryUrls });
  } catch (err) {
    console.error("CLUB SECTION ERROR:", err);
    console.error("Error stack:", err.stack);
    
    // Even on error, return hardcoded clubs so user sees something
    const { city: errorCity } = req.query || {};
    console.log(`[club-section] Error occurred, returning hardcoded clubs as fallback for "${errorCity}"`);
    const hardcodedClubs = getHardcodedClubsForCity(errorCity || city);
    // Map image URLs to Cloudinary CDN
    const clubsWithCloudinaryUrls = mapImageUrls(hardcodedClubs);
    return res.json({ clubs: clubsWithCloudinaryUrls });
  }
});

export default router;
