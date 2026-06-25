const ActivityStore = require('../models/activities');
const User = require('../models/user'); 

const logActivity = async (actorId, action, target, targetRoles) => {
  try {
    // 1. Auto-BCC the Admins
    if (!targetRoles.includes('admin')) {
      targetRoles.push('admin');
    }

    // 2. Find target users based on roles
    const targetUsers = await User.find({ role: { $in: targetRoles } }).select('_id');
    const audienceIds = targetUsers.map(user => user._id.toString());

    // 3. Add the actor to the audience so they see their own actions
    if (actorId && !audienceIds.includes(actorId.toString())) {
      audienceIds.push(actorId.toString());
    }

    // 4. Prepare the new activity object
    const newActivity = {
      actor: actorId,
      action: action,
      target: target
    };

    // 5. Build bulk operations to push to arrays
    const bulkOperations = audienceIds.map(ownerId => ({
      updateOne: {
        filter: { userId: ownerId }, 
        update: {
          $push: {
            activities: {
              $each: [newActivity],
              $position: 0, // Puts the newest activity at the top
              $slice: 20    // Caps the array at the 20 most recent items!
            }
          }
        },
        upsert: true // Creates the master document if the user doesn't have one yet
      }
    }));

    // 6. Execute all updates at once
    if (bulkOperations.length > 0) {
      await ActivityStore.bulkWrite(bulkOperations);
      console.log(`✅ SUCCESS: Activity pushed to ${bulkOperations.length} user arrays!`);
    }

  } catch (error) {
    console.error('🚨 ACTIVITY LOGGING FAILED 🚨:', error.message);
  }
};

module.exports = logActivity;