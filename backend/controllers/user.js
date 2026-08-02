const mongoose = require('mongoose');
const User = require('../models/user');
const { deleteUploadedImage } = require('../utils/fileHelper');
const logActivity = require('../utils/activityLogger');

// ============================================================================
// HELPER: Reusable Activity Logger
// ============================================================================
/**
 * Safely fetches the actor's name and logs the activity without blocking the main thread.
 * Supports self-registration where req.user might be undefined.
 */
const logUserAction = async (req, actionType, messageContext, fallbackUserId = null, fallbackName = null) => {
    try {
        let userId = req?.user?._id || req?.user?.id || req?.user;
        let actorName = fallbackName || "System";

        if (userId) {
            const currentUser = await User.findById(userId).select('name').lean();
            actorName = currentUser?.name || "an Administrator";
        } else {
            userId = fallbackUserId; // Used when a new user registers themselves
        }

        if (userId) {
            await logActivity(userId, actionType, `${messageContext} by ${actorName}`, []);
        }
    } catch (logError) {
        console.error("⚠️ Activity Logger Failed:", logError.message);
    }
};

// ============================================================================
// 1. Create New User (Admin or Self-Registration)
// ============================================================================
async function handleGenerateNewUser(req, res) {
    try {
        const { facultyId, name, email, password } = req.body;

        // SANITIZATION: Prevents accidental duplicates
        const cleanFacultyId = facultyId.trim().toUpperCase();
        const cleanEmail = email.trim().toLowerCase();

        // 1. Determine profile image
        const profileImage = req.file ? `/uploads/${req.file.filename}` : '/images/profilePlaceholder.jpg';

        // 2. Create the user
        const newUser = await User.create({
            facultyId: cleanFacultyId,
            name: name.trim(),
            email: cleanEmail,
            password,
            role: 'faculty', // Force role
            profileImage
        });

        // 3. Log Activity
        await logUserAction(
            req, 
            'CREATED_FACULTY_ACCOUNT', 
            `Faculty account created for ${newUser.name} (${newUser.facultyId})`, 
            newUser._id, 
            newUser.name
        );

        return res.status(201).json({
            success: true,
            message: "Faculty account created successfully",
            data: {
                id: newUser._id,
                facultyId: newUser.facultyId,
                name: newUser.name,
                email: newUser.email,
                profileImage: newUser.profileImage
            }
        });

    } catch (error) {
        // Handle MongoDB Duplicate Key Error (code 11000) safely
        if (error.code === 11000) {
            const isFacultyId = Object.keys(error.keyPattern).includes('facultyId');
            return res.status(400).json({ 
                success: false, 
                message: isFacultyId ? "This Faculty ID is already registered." : "This Email address is already in use." 
            });
        }

        // Handle Schema Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }

        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 2. Edit User (Admin Action)
// ============================================================================
async function handleEditUserByFacultyId(req, res) {
    try {
        const { id } = req.params; 
        const { name, email } = req.body;
        const cleanId = id.trim().toUpperCase();

        // 1. SECURITY: Protect Super Admin
        if (cleanId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account cannot be modified."
            });
        }

        // 2. Fetch User to manage old image
        const user = await User.findOne({ facultyId: cleanId });
        if (!user) {
            return res.status(404).json({ success: false, message: "Faculty member not found" });
        }

        let updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.trim().toLowerCase();

        // 3. Handle Image Replacement
        if (req.file) {
            await deleteUploadedImage(user.profileImage); // Cleanup old disk file
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        // 4. Update Database
        const updatedUser = await User.findOneAndUpdate(
            { facultyId: cleanId },
            updateData,
            { new: true, runValidators: true, lean: true }
        );

        // 5. Log Activity
        await logUserAction(req, 'UPDATED_FACULTY_ACCOUNT', `Faculty profile for ${updatedUser.name} (${updatedUser.facultyId}) was updated`);

        return res.status(200).json({
            success: true,
            message: "Faculty information updated successfully",
            data: updatedUser
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "This email is already assigned to another user." });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
}

// ============================================================================
// 3. Delete Profile Image (Reset to Default)
// ============================================================================
async function handleDeleteProfileImage(req, res) {
    try {
        const cleanId = req.params.id.trim().toUpperCase();
        const user = await User.findOne({ facultyId: cleanId });
        
        if (!user) return res.status(404).json({ success: false, message: "Faculty member not found" });

        const defaultImage = '/images/profilePlaceholder.jpg';

        if (user.profileImage === defaultImage) {
            return res.status(400).json({ success: false, message: "User already has the default profile image." });
        }

        await deleteUploadedImage(user.profileImage);
        user.profileImage = defaultImage;
        await user.save();

        res.status(200).json({ success: true, message: "Profile image removed and reset to default.", data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 4. Get Single Faculty User
// ============================================================================
async function handleGetUserByFacultyId(req, res) {
    try {
        const requestedId = req.params.id.trim().toUpperCase();

        if (requestedId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: The Super Admin profile is restricted and cannot be fetched."
            });
        }

        // .lean() heavily optimizes response time
        const user = await User.findOne({ facultyId: requestedId }).lean();

        if (!user) return res.status(404).json({ success: false, message: "Faculty member not found" });

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 5. Delete User
// ============================================================================
// async function handleDeleteUserByFacultyId(req, res) {
//     try {
//         const targetId = req.params.id.trim().toUpperCase();

//         // 1. SECURITY: Protect Super Admin
//         if (targetId === 'CA2026') {
//             return res.status(403).json({
//                 success: false,
//                 message: "System Protection: The Super Admin account is permanent and cannot be deleted."
//             });
//         }

//         // 2. Find and Delete
//         const deletedUser = await User.findOneAndDelete({ facultyId: targetId }).lean();

//         if (!deletedUser) {
//             return res.status(404).json({ success: false, message: `No faculty member found with ID: ${targetId}` });
//         }

//         // 3. Cleanup disk files
//         await deleteUploadedImage(deletedUser.profileImage);

//         // 4. Log Activity
//         await logUserAction(req, 'DELETED_FACULTY_ACCOUNT', `Faculty account for ${deletedUser.name} (${deletedUser.facultyId}) was deleted`);

//         return res.status(200).json({
//             success: true,
//             message: `Faculty member ${targetId} (${deletedUser.name}) has been deleted.`
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// }


async function handleDeleteUserByFacultyId(req, res) {
    try {
        const targetId = req.params.id.trim().toUpperCase();

        // 1. SECURITY: Protect Super Admin
        if (targetId === 'CA2026') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account is permanent and cannot be deleted."
            });
        }

        console.log(`\n--- STARTING CASCADE DELETE FOR USER: ${targetId} ---`);

        // 2. Find the user FIRST before deleting
        const userToDelete = await User.findOne({ facultyId: targetId }).lean();

        if (!userToDelete) {
            console.log(`--- ABORTED: User ${targetId} not found --- \n`);
            return res.status(404).json({ success: false, message: `No faculty member found with ID: ${targetId}` });
        }

        // 3. Define ALL collections from the database (image_0d9c9a.png)
        // Note: 'users' is excluded here because we delete the main user document in Step 5.
        const collectionsToClear = [
            'activitystores',
            'assignsubjects',
            'calculatedmarks',
            'copomappings',
            'directattainments',
            'finalattainment',
            'marks',
            'poattainments',
            'rubrics',
            'subjects'
        ];

        // 4. CASCADE DELETE: Loop through and forcefully delete from every collection
        for (const collectionName of collectionsToClear) {
            try {
                // Deletes any document in these collections where the facultyId matches
                const result = await mongoose.connection.collection(collectionName).deleteMany({ facultyId: targetId });
                console.log(`[${collectionName}]: Found and deleted ${result.deletedCount} documents for faculty ${targetId}.`);
            } catch (cleanupError) {
                console.error(`[${collectionName}]: Error during cleanup -`, cleanupError.message);
            }
        }

        // 5. NOW actually delete the main User document
        await User.findByIdAndDelete(userToDelete._id);
        console.log(`--- SUCCESS: Main User ${targetId} deleted ---\n`);

        // 6. Cleanup disk files
        if (userToDelete.profileImage) {
            await deleteUploadedImage(userToDelete.profileImage); // Ensure this function is imported/defined
        }

        // 7. Log Activity
        // Ensure logUserAction is imported/defined in this file
        await logUserAction(req, 'DELETED_FACULTY_ACCOUNT', `Faculty account for ${userToDelete.name} (${userToDelete.facultyId}) was deleted`);

        return res.status(200).json({
            success: true,
            message: `Faculty member ${targetId} (${userToDelete.name}) and all associated records have been successfully deleted from all collections.`
        });

    } catch (error) {
        console.error("Delete User Controller Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}
// ============================================================================
// 6. Get All Faculty Members
// ============================================================================
async function handleGetAllUsers(req, res) {
    try {
        // Excludes Super Admin and uses .lean() for high-speed list retrieval
        const users = await User.find({ facultyId: { $ne: 'CA1718' } })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: users.length,
            message: "Faculty list retrieved successfully",
            data: users
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 7. Get Personal Profile
// ============================================================================
async function handleGetMyProfile(req, res) {
    try {
        const cleanId = req.params.id.trim().toUpperCase();
        
        const user = await User.findOne({ facultyId: cleanId }).lean();

        if (!user) return res.status(404).json({ success: false, message: "Profile not found." });

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

// ============================================================================
// 8. User Self-Update Profile
// ============================================================================
async function handleUserSelfUpdate(req, res) {
    try {
        const cleanId = req.params.id.trim().toUpperCase();
        const { name } = req.body; 

        const user = await User.findOne({ facultyId: cleanId });
        if (!user) return res.status(404).json({ success: false, message: "Profile not found." });

        let updateData = {};
        if (name) updateData.name = name.trim(); 

        if (req.file) {
            await deleteUploadedImage(user.profileImage);
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ success: false, message: "No changes provided to update." });
        }

        const updatedUser = await User.findOneAndUpdate(
            { facultyId: cleanId },
            updateData,
            { new: true, runValidators: true, lean: true } 
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

module.exports = {
    handleGenerateNewUser,
    handleEditUserByFacultyId,
    handleDeleteProfileImage,
    handleGetUserByFacultyId,
    handleDeleteUserByFacultyId,
    handleGetAllUsers,
    handleGetMyProfile,
    handleUserSelfUpdate
};



// const User = require('../models/user');
// const { deleteUploadedImage } = require('../utils/fileHelper');
// const logActivity = require('../utils/activityLogger');



// //done
// async function handleGenerateNewUser(req, res) {
//     try {
//         const { facultyId, name, email, password } = req.body;

//         // 1. Determine the profile image path
//         // It defaults to the placeholder unless a file was uploaded
//         let profileImage = '/images/profilePlaceholder.jpg';
//         if (req.file) {
//             profileImage = `/uploads/${req.file.filename}`;
//         }

//         // 2. Create the user
//         const newUser = await User.create({
//             facultyId,
//             name,
//             email,
//             password,
//             role: 'faculty', // Force role to 'faculty'
//             profileImage
//         });

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         try {
//             // Smart Check: Are they signing themselves up, or did an Admin do it?
//             const userId = req.user ? (req.user._id || req.user.id || req.user) : newUser._id;
            
//             let actorName = newUser.name; // Default to self-registration
            
//             if (req.user) {
//                 const currentUser = await User.findById(userId).select('name').lean();
//                 actorName = currentUser ? currentUser.name : "an Administrator";
//             }

//             await logActivity(
//                 userId,
//                 'CREATED_FACULTY_ACCOUNT', 
//                 `Faculty account created for ${newUser.name} (${newUser.facultyId}) by ${actorName}`, 
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------

//         return res.status(201).json({
//             success: true,
//             message: "Faculty account created successfully",
//             data: {
//                 id: newUser._id,
//                 facultyId: newUser.facultyId,
//                 name: newUser.name,
//                 email: newUser.email,
//                 profileImage: newUser.profileImage
//             }
//         });

//     } catch (error) {
//         // Handle MongoDB Duplicate Key Error (code 11000)
//         if (error.code === 11000) {
//             const duplicateField = Object.keys(error.keyPattern)[0];
//             const message = duplicateField === 'facultyId' 
//                 ? "This Faculty ID is already registered." 
//                 : "This Email address is already in use.";
            
//             return res.status(400).json({ success: false, message: message });
//         }

//         // Handle Mongoose Validation Errors
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             return res.status(400).json({ success: false, message: messages[0] });
//         }

//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// }





// //done
// async function handleEditUserByFacultyId(req, res) {
//     try {
//         const { id } = req.params; 
//         const { name, email } = req.body;

//         // 1. SECURITY: Prevent changes to the Super Admin
//         if (id.toUpperCase() === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "System Protection: The Super Admin account cannot be modified."
//             });
//         }

//         // 2. Find the user FIRST so we can check if they have an old image to delete
//         const user = await User.findOne({ facultyId: id.toUpperCase() });
//         if (!user) {
//             return res.status(404).json({ success: false, message: "Faculty member not found" });
//         }

//         // 3. Prepare the data to update
//         let updateData = { name, email };

//         // 4. If a new image was uploaded, handle the file replacement
//         if (req.file) {
//             // Delete the old image from the server (if it was an uploaded file)
//             await deleteUploadedImage(user.profileImage);
            
//             // Set the new image path to save in the database
//             updateData.profileImage = `/uploads/${req.file.filename}`;
//         }

//         // 5. Update the database
//         const updatedUser = await User.findOneAndUpdate(
//             { facultyId: id.toUpperCase() },
//             updateData,
//             { new: true, runValidators: true }
//         );

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         try {
//             const userId = req.user?._id || req.user?.id || req.user;
//             const currentUser = await User.findById(userId).select('name').lean();
            
//             // If an admin is doing this, we get their name. If not, it defaults to "an Administrator"
//             const actorName = currentUser ? currentUser.name : "an Administrator";

//             await logActivity(
//                 userId,
//                 'UPDATED_FACULTY_ACCOUNT', 
//                 `Faculty profile for ${updatedUser.name} (${updatedUser.facultyId}) was updated by ${actorName}`, 
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------

//         // 6. Return success response
//         return res.status(200).json({
//             success: true,
//             message: "Faculty information updated successfully",
//             data: updatedUser
//         });

//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({ success: false, message: "This email is already assigned to another user." });
//         }
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };



// // @desc    Delete just the Profile Image (Reset to default)
// // @route   DELETE /api/users/image/:id
// async function handleDeleteProfileImage(req, res) {
//     try {
//         const { id } = req.params;
//         const user = await User.findOne({ facultyId: id.toUpperCase() });
        
//         if (!user) return res.status(404).json({ success: false, message: "Faculty member not found" });

//         const defaultImage = '/images/profilePlaceholder.jpg';

//         if (user.profileImage === defaultImage) {
//             return res.status(400).json({ success: false, message: "User already has the default profile image." });
//         }

//         await deleteUploadedImage(user.profileImage);
//         user.profileImage = defaultImage;
//         await user.save();

//         res.status(200).json({ success: true, message: "Profile image removed and reset to default.", data: user });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // @desc    Get Single Faculty
// // @route   GET /api/users/:id
// async function handleGetUserByFacultyId(req, res) {
//     try {
//         const { id } = req.params;
//         const requestedId = id.toUpperCase();

//         if (requestedId === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access Denied: The Super Admin profile is restricted and cannot be fetched."
//             });
//         }

//         const user = await User.findOne({ facultyId: requestedId });

//         if (!user) {
//             return res.status(404).json({ success: false, message: "Faculty member not found" });
//         }

//         res.status(200).json({ success: true, data: user });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };





// async function handleDeleteUserByFacultyId(req, res) {
//     try {
//         const targetId = req.params.id.toUpperCase();

//         // 1. SECURITY: Protect the Super Admin
//         if (targetId === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "System Protection: The Super Admin account is permanent and cannot be deleted."
//             });
//         }

//         // 2. Find and delete the user
//         const deletedUser = await User.findOneAndDelete({ facultyId: targetId });

//         if (!deletedUser) {
//             return res.status(404).json({ success: false, message: `No faculty member found with ID: ${targetId}` });
//         }

//         // 3. Cleanup: Delete their uploaded profile image
//         await deleteUploadedImage(deletedUser.profileImage);

//         // ---> 🔔 THE BELL RINGER (Placed BEFORE the return!) <---
//         try {
//             const userId = req.user?._id || req.user?.id || req.user;
//             const currentUser = await User.findById(userId).select('name').lean();
            
//             // If an admin is doing this, we get their name.
//             const actorName = currentUser ? currentUser.name : "an Administrator";

//             await logActivity(
//                 userId,
//                 'DELETED_FACULTY_ACCOUNT', 
//                 `Faculty account for ${deletedUser.name} (${deletedUser.facultyId}) was deleted by ${actorName}`, 
//                 []
//             );
//         } catch (logError) {
//             console.error("⚠️ Activity Logger Failed:", logError.message);
//         }
//         // ---------------------------------------------------------

//         // 4. Success response
//         return res.status(200).json({
//             success: true,
//             message: `Faculty member ${targetId} (${deletedUser.name}) has been deleted.`
//         });

//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };


// // @desc    Get all Faculty members (excludes Admin)
// // @route   GET /api/users/
// async function handleGetAllUsers(req, res) {
//     try {
//         const users = await User.find({ 
//             facultyId: { $ne: 'CA1718' } 
//         }).sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             count: users.length,
//             message: "Faculty list retrieved successfully",
//             data: users
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };

// // @desc    User gets their own profile
// // @route   GET /api/users/profile/:id
// async function handleGetMyProfile(req, res) {
//     try {
//         const { id } = req.params; // The facultyId from the URL

//         // Find the user in the database
//         const user = await User.findOne({ facultyId: id.toUpperCase() });

//         if (!user) {
//             return res.status(404).json({ success: false, message: "Profile not found." });
//         }

//         // Return the user data
//         res.status(200).json({
//             success: true,
//             data: user
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };


// // @desc    User updates their own profile (Name and Image only)
// // @route   PATCH /api/users/profile/:id
// async function handleUserSelfUpdate(req, res) {
//     try {
//         const { id } = req.params; // This is the facultyId from the URL

//         // 1. Find the user first
//         const user = await User.findOne({ facultyId: id.toUpperCase() });
//         if (!user) {
//             return res.status(404).json({ success: false, message: "Profile not found." });
//         }

//         // 2. Extract ONLY the allowed text fields
//         const { name } = req.body; 

//         // 3. Build the update object dynamically
//         let updateData = {};
        
//         // SCENARIO A: User provided a new name
//         if (name) {
//             updateData.name = name; 
//         }

//         // SCENARIO B: User provided a new image
//         if (req.file) {
//             // Safely delete the old image (helper ignores the default image)
//             await deleteUploadedImage(user.profileImage);
            
//             // Set the new image path 
//             updateData.profileImage = `/uploads/${req.file.filename}`;
//         }

//         // 4. Prevent empty database calls
//         if (Object.keys(updateData).length === 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "No changes provided to update." 
//             });
//         }

//         // 5. Update the user in MongoDB
//         // Note: Because we only put 'name' or 'profileImage' inside updateData,
//         // Mongoose will completely ignore the other field and keep whatever is already in the database!
//         const updatedUser = await User.findOneAndUpdate(
//             { facultyId: id.toUpperCase() },
//             updateData,
//             { new: true, runValidators: true } 
//         );

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully.",
//             data: updatedUser
//         });

//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// };


// module.exports = {
//     handleGenerateNewUser,
//     handleEditUserByFacultyId,
//     handleDeleteProfileImage,
//     handleGetUserByFacultyId,
//     handleDeleteUserByFacultyId,
//     handleGetAllUsers,
//     handleGetMyProfile,
//     handleUserSelfUpdate
// };