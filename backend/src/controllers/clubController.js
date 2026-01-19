import Club from '../models/Club.js';
import { getImageUrl } from '../utils/imageUrlMapper.js';

/**
 * Get clubs with optional filters
 * Query params:
 * - maxPrice: filter clubs by maximum price per day
 * - search: search clubs by name, location, description
 * - location: filter by specific location
 */
export const getClubs = async (req, res) => {
  try {
    const { maxPrice, search, location, limit = '50', offset = '0' } = req.query;
    let clubs;

    if (search) {
      // Search functionality
      clubs = await Club.search(search);
    } else if (location) {
      // Filter by location
      clubs = await Club.findByLocation(location);
    } else if (maxPrice) {
      // Filter by price (e.g., "Clubs within Rs 40/Day")
      clubs = await Club.findByPrice(parseFloat(maxPrice));
    } else {
      // Get all clubs with pagination - ensure integers
      const limitInt = parseInt(limit, 10) || 50;
      const offsetInt = parseInt(offset, 10) || 0;
      clubs = await Club.findAll(limitInt, offsetInt);
    }

    // Map image URLs to Cloudinary CDN for instant loading
    const clubsWithCloudinaryUrls = clubs.map(club => ({
      ...club,
      image_url: getImageUrl(club.image_url)
    }));

    res.json({
      success: true,
      count: clubsWithCloudinaryUrls.length,
      data: clubsWithCloudinaryUrls
    });
  } catch (error) {
    console.error('Error in getClubs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs',
      error: error.message
    });
  }
};

/**
 * Get single club by ID
 */
export const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findById(parseInt(id));

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Map image URL to Cloudinary CDN
    const clubWithCloudinaryUrl = {
      ...club,
      image_url: getImageUrl(club.image_url)
    };

    res.json({
      success: true,
      data: clubWithCloudinaryUrl
    });
  } catch (error) {
    console.error('Error in getClubById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch club',
      error: error.message
    });
  }
};

/**
 * Create new club (admin only)
 */
export const createClub = async (req, res) => {
  try {
    const clubData = req.body;

    // Validate required fields
    if (!clubData.name || !clubData.location || !clubData.price_per_day) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, location, price_per_day'
      });
    }

    const newClub = await Club.create(clubData);

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      data: newClub
    });
  } catch (error) {
    console.error('Error in createClub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create club',
      error: error.message
    });
  }
};

/**
 * Update club by ID (admin only)
 */
export const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const clubData = req.body;

    const success = await Club.update(parseInt(id), clubData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Club not found or no changes made'
      });
    }

    res.json({
      success: true,
      message: 'Club updated successfully'
    });
  } catch (error) {
    console.error('Error in updateClub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update club',
      error: error.message
    });
  }
};

/**
 * Delete club by ID (admin only)
 */
export const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Club.delete(parseInt(id));

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteClub:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete club',
      error: error.message
    });
  }
};

/**
 * Get clubs grouped by price ranges
 * Returns clubs in categories: under 40, 40-80, 80-120, 120+
 */
export const getClubsByPriceRanges = async (req, res) => {
  try {
    const [under40, between40_80, between80_120, above120] = await Promise.all([
      Club.findByPrice(40),
      Club.findByPrice(80),
      Club.findByPrice(120),
      Club.findAll(100, 0)
    ]);

    // Filter for specific ranges
    const range40_80 = between40_80.filter(club => club.price_per_day > 40);
    const range80_120 = between80_120.filter(club => club.price_per_day > 80);
    const rangeAbove120 = above120.filter(club => club.price_per_day > 120);

    // Helper to map image URLs
    const mapClubs = (clubList) => clubList.map(club => ({
      ...club,
      image_url: getImageUrl(club.image_url)
    }));

    res.json({
      success: true,
      data: {
        under_40: {
          title: 'Clubs within Rs. 40/Day',
          count: under40.length,
          clubs: mapClubs(under40)
        },
        between_40_80: {
          title: 'Clubs within Rs. 80/Day',
          count: range40_80.length,
          clubs: mapClubs(range40_80)
        },
        between_80_120: {
          title: 'Clubs within Rs. 120/Day',
          count: range80_120.length,
          clubs: mapClubs(range80_120)
        },
        above_120: {
          title: 'Premium Clubs (Rs. 120+/Day)',
          count: rangeAbove120.length,
          clubs: mapClubs(rangeAbove120)
        }
      }
    });
  } catch (error) {
    console.error('Error in getClubsByPriceRanges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clubs by price ranges',
      error: error.message
    });
  }
};

