const ActivityStore = require('../models/activities');

exports.getMyDashboardFeed = async (req, res) => {
  try {
    const currentUserId = req.user; 

    // Find the single master document for this user and populate the actor data
    const store = await ActivityStore.findOne({ userId: currentUserId })
      .populate('activities.actor', 'name email');

    // If they have no document yet (e.g., brand new user), send an empty array
    if (!store) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Send the activities array directly to the frontend
    res.status(200).json({ 
      success: true, 
      data: store.activities 
    });
    
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities' });
  }
};