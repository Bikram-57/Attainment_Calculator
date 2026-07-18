// const ActivityStore = require('../models/activities');

// exports.getMyDashboardFeed = async (req, res) => {
//   try {
//     const currentUserId = req.user; 

//     // Find the single master document for this user and populate the actor data
//     const store = await ActivityStore.findOne({ userId: currentUserId })
//       .populate('activities.actor', 'name email');

//     // If they have no document yet (e.g., brand new user), send an empty array
//     if (!store) {
//       return res.status(200).json({ success: true, data: [] });
//     }

//     // Send the activities array directly to the frontend
//     res.status(200).json({ 
//       success: true, 
//       data: store.activities 
//     });
    
//   } catch (error) {
//     console.error("Dashboard Fetch Error:", error);
//     res.status(500).json({ success: false, message: 'Failed to fetch activities' });
//   }
// };





const ActivityStore = require('../models/activities');

exports.getMyDashboardFeed = async (req, res) => {
  try {
    const currentUserId = req.user; 

    // Find the user's activity store, heavily optimized for read-only performance
    const store = await ActivityStore.findOne(
        { userId: currentUserId }, 
        // Projection: Only fetch the 'activities' array, exclude the root '_id'
        // $slice: Limits the array to the 50 most recent items to prevent memory crashes
        { _id: 0, activities: { $slice: 50 } } 
      )
      .populate('activities.actor', 'name email')
      .lean(); // .lean() strips heavy Mongoose methods, returning a much faster plain JS object

    // If no document exists (e.g., brand new user), default to an empty feed
    if (!store) {
      return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ 
      success: true, 
      data: store.activities 
    });
    
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};