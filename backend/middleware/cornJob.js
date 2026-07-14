// File: utils/cronJobs.js (or jobs/cronJobs.js)
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
// IMPORTANT: Make sure this path correctly points to your User model!
const User = require('../models/user');

const startTokenCleanupJob = () => {
    // This schedule runs automatically at Midnight (00:00) every single day
    cron.schedule('0 0 * * *', async () => {
    // Runs every 10 seconds!
    // cron.schedule('*/10 * * * * *', async () => {
        console.log('🧹 Running background database cleanup for expired tokens...');

        try {
            // Find only users who actually have tokens in their array
            const users = await User.find({ refreshTokens: { $exists: true, $not: { $size: 0 } } });

            let usersUpdated = 0;

            for (let user of users) {
                const cleanArray = user.refreshTokens.filter(token => {
                    try {
                        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                        return true;
                    } catch (err) {
                        return false; // Token is expired, remove it!
                    }
                });

                // If the array shrank, it means we deleted expired tokens. Save the user!
                if (cleanArray.length !== user.refreshTokens.length) {
                    user.refreshTokens = cleanArray;
                    await user.save();
                    usersUpdated++;
                }
            }
            console.log(`✨ Cleanup finished! Removed expired tokens from ${usersUpdated} users.`);
        } catch (error) {
            console.error('Database background cleanup failed:', error);
        }
    });

    console.log("🕒 Background cron jobs initialized.");
};

module.exports = startTokenCleanupJob;