import { updateProfileTargets, getProfileSummary } from '../services/nutritionService.js';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private (needs token)
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const profile = await getProfileSummary(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create or update user profile
// @route   POST /api/profile
// @access  Private (needs token)
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userId = req.user.id;
    const userGuid = req.user.guid;
    const profileData = req.body;
    
    console.log("📝 updateUserProfile payload:", JSON.stringify(profileData, null, 2));

    const updatedProfile = await updateProfileTargets(userId, userGuid, profileData);

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("❌ updateUserProfile Error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

