import UserPreference from '../../models/periodTracker/UserPreference.js';

export const savePreferences = async (req, res) => {
  try {
    const { cycle_length, period_length } = req.body;
    const userId = req.user?.id || 1;

    if (cycle_length === undefined && period_length === undefined) {
      return res.status(400).json({ success: false, message: 'No preferences provided' });
    }

    const pref = await UserPreference.upsert({ 
      user_id: userId, 
      user_guid: req.user?.guid,
      cycle_length, 
      period_length 
    });

    res.json({ success: true, data: pref });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getPreferences = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const pref = await UserPreference.getByUser(userId);
    res.json({ success: true, data: pref });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


