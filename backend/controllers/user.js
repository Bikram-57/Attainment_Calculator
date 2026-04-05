// const User = require('../models/user');

// // @desc    Admin creates a new Faculty
// // @route   POST /api/users/admin-create
// // exports.adminCreateUser = async (req, res) => {
// async function handleGenerateNewUser(req, res) {

// // @desc    Admin creates a new Faculty
// // @route   POST /api/users/admin-create
//     try {
//         const { facultyId, name, email, password } = req.body;

//         // Force role to 'faculty' as per your "One Admin" requirement
//         const newUser = await User.create({
//             facultyId,
//             name,
//             email,
//             password,
//             role: 'faculty'
//         });

//         res.status(201).json({
//             success: true,
//             message: "Faculty account created successfully",
//             data: {
//                 id: newUser._id,
//                 facultyId: newUser.facultyId,
//                 name: newUser.name,
//                 email: newUser.email
//             }
//         });

//     } catch (error) {
//         // Handle MongoDB Duplicate Key Error (code 11000)
//         if (error.code === 11000) {
//             const duplicateField = Object.keys(error.keyPattern)[0];
//             const message = duplicateField === 'facultyId' 
//                 ? "This Faculty ID is already registered." 
//                 : "This Email address is already in use.";
            
//             return res.status(400).json({
//                 success: false,
//                 message: message
//             });
//         }

//         // Handle Mongoose Validation Errors (e.g., missing fields)
//         if (error.name === 'ValidationError') {
//             const messages = Object.values(error.errors).map(val => val.message);
//             return res.status(400).json({ success: false, message: messages[0] });
//         }

//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// };


// // @desc    Update Faculty Info (Admin Only)
// // @route   PUT /api/users/update/:id

// async function handleEditUserByFacultyId(req, res) {

//     try {
//         const { id } = req.params; // The facultyId from the URL (e.g., CA1718 or F101)
//         const { name, email } = req.body;

//         // 1. SECURITY: Prevent any changes to the Super Admin account
//         if (id.toUpperCase() === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "System Protection: The Super Admin account (Dr. Krishna) cannot be modified."
//             });
//         }

//         // 2. UPDATE: Only update allowed fields (name and email)
//         const updatedUser = await User.findOneAndUpdate(
//             { facultyId: id.toUpperCase() },
//             { name, email },
//             { 
//                 new: true,           // Return the updated document
//                 runValidators: true  // Ensure email format is still valid
//             }
//         );

//         if (!updatedUser) {
//             return res.status(404).json({ success: false, message: "Faculty member not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Faculty information updated successfully",
//             data: updatedUser
//         });

//     } catch (error) {
//         // Handle duplicate email error during update
//         if (error.code === 11000) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "This email is already assigned to another user." 
//             });
//         }
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// // @desc    Get Single Faculty (Restricts Admin ID)
// // @route   GET /api/users/:id

// async function handleGetUserByFacultyId(req, res) {
//     try {
//         const { id } = req.params;
//         const requestedId = id.toUpperCase();

//         // 1. RESTRICTION: Block anyone from fetching Dr. Krishna's Admin data
//         if (requestedId === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "Access Denied: The Super Admin profile is restricted and cannot be fetched."
//             });
//         }

//         // 2. SEARCH: Find the faculty member
//         const user = await User.findOne({ facultyId: requestedId });

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Faculty member not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: user
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message
//         });
//     }
// };


// // @desc    Delete Faculty (Admin Only) - Protects Dr. Krishna
// // @route   DELETE /api/users/delete/:id
// async function handleDeleteUserByFacultyId(req, res) {

//     try {
//         // 1. Capture the ID from the URL and force to Uppercase
//         const targetId = req.params.id.toUpperCase();

//         // 2. THE LOCK: Specifically block the Super Admin ID from deletion
//         if (targetId === 'CA1718') {
//             return res.status(403).json({
//                 success: false,
//                 message: "System Protection: The Super Admin account (CA1718) is permanent and cannot be deleted."
//             });
//         }

//         // 3. EXECUTION: Attempt to find and remove the faculty member
//         const deletedUser = await User.findOneAndDelete({ facultyId: targetId });

//         // 4. CHECK: If the facultyId doesn't exist in the database
//         if (!deletedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: `No faculty member found with ID: ${targetId}`
//             });
//         }

//         // 5. SUCCESS: Return confirmation
//         res.status(200).json({
//             success: true,
//             message: `Faculty member ${targetId} (${deletedUser.name}) has been deleted.`
//         });

//     } catch (error) {
//         // Handle unexpected server/database errors
//         res.status(500).json({
//             success: false,
//             message: "Server Error: Could not complete the deletion request.",
//             error: error.message
//         });
//     }
// };


// async function handleGetAllUsers(req, res) {

//     try {
//         // Use the $ne (Not Equal) operator to exclude Dr. Krishna's ID
//         // This ensures the Admin is never part of the general list
//         const users = await User.find({ 
//             facultyId: { $ne: 'CA1718' } 
//         }).sort({ createdAt: -1 }); // Sort by newest first

//         res.status(200).json({
//             success: true,
//             count: users.length,
//             message: "Faculty list retrieved successfully",
//             data: users
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server Error: Could not fetch users.",
//             error: error.message
//         });
//     }
// };

// module.exports = {
//   handleGenerateNewUser,
//   handleEditUserByFacultyId,
//   handleGetUserByFacultyId,
//   handleDeleteUserByFacultyId,
//   handleGetAllUsers
// }
































const User = require('../models/user');
const { deleteUploadedImage } = require('../utils/fileHelper');

// @desc    Admin creates a new Faculty (With optional image)
// @route   POST /api/users/
async function handleGenerateNewUser(req, res) {
    try {
        const { facultyId, name, email, password } = req.body;

        // 1. Determine the profile image path
        // It defaults to the placeholder unless a file was uploaded
        let profileImage = '/images/profilePlaceholder.jpg';
        if (req.file) {
            profileImage = `/uploads/${req.file.filename}`;
        }

        // 2. Create the user
        const newUser = await User.create({
            facultyId,
            name,
            email,
            password,
            role: 'faculty', // Force role to 'faculty'
            profileImage
        });

        res.status(201).json({
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
        // Handle MongoDB Duplicate Key Error (code 11000)
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            const message = duplicateField === 'facultyId' 
                ? "This Faculty ID is already registered." 
                : "This Email address is already in use.";
            
            return res.status(400).json({ success: false, message: message });
        }

        // Handle Mongoose Validation Errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }

        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


// @desc    Update Faculty Info & Profile Image (Admin Only)
// @route   PUT /api/users/:id
async function handleEditUserByFacultyId(req, res) {
    try {
        const { id } = req.params; 
        const { name, email } = req.body;

        // 1. SECURITY: Prevent changes to the Super Admin
        if (id.toUpperCase() === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account cannot be modified."
            });
        }

        // 2. Find the user FIRST so we can check if they have an old image to delete
        const user = await User.findOne({ facultyId: id.toUpperCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: "Faculty member not found" });
        }

        // 3. Prepare the data to update
        let updateData = { name, email };

        // 4. If a new image was uploaded, handle the file replacement
        if (req.file) {
            // Delete the old image from the server (if it was an uploaded file)
            await deleteUploadedImage(user.profileImage);
            
            // Set the new image path to save in the database
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        // 5. Update the database
        const updatedUser = await User.findOneAndUpdate(
            { facultyId: id.toUpperCase() },
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Faculty information updated successfully",
            data: updatedUser
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "This email is already assigned to another user." });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Delete just the Profile Image (Reset to default)
// @route   DELETE /api/users/image/:id
async function handleDeleteProfileImage(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findOne({ facultyId: id.toUpperCase() });
        
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
};

// @desc    Get Single Faculty
// @route   GET /api/users/:id
async function handleGetUserByFacultyId(req, res) {
    try {
        const { id } = req.params;
        const requestedId = id.toUpperCase();

        if (requestedId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: The Super Admin profile is restricted and cannot be fetched."
            });
        }

        const user = await User.findOne({ facultyId: requestedId });

        if (!user) {
            return res.status(404).json({ success: false, message: "Faculty member not found" });
        }

        res.status(200).json({ success: true, data: user });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


// @desc    Delete Faculty
// @route   DELETE /api/users/:id
async function handleDeleteUserByFacultyId(req, res) {
    try {
        const targetId = req.params.id.toUpperCase();

        if (targetId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account is permanent and cannot be deleted."
            });
        }

        // Find and delete the user
        const deletedUser = await User.findOneAndDelete({ facultyId: targetId });

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: `No faculty member found with ID: ${targetId}` });
        }

        // ⚠️ NEW ADDITION: If the user is deleted, also delete their uploaded profile image from the server!
        await deleteUploadedImage(deletedUser.profileImage);

        res.status(200).json({
            success: true,
            message: `Faculty member ${targetId} (${deletedUser.name}) has been deleted.`
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


// @desc    Get all Faculty members (excludes Admin)
// @route   GET /api/users/
async function handleGetAllUsers(req, res) {
    try {
        const users = await User.find({ 
            facultyId: { $ne: 'CA1718' } 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            message: "Faculty list retrieved successfully",
            data: users
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    User gets their own profile
// @route   GET /api/users/profile/:id
async function handleGetMyProfile(req, res) {
    try {
        const { id } = req.params; // The facultyId from the URL

        // Find the user in the database
        const user = await User.findOne({ facultyId: id.toUpperCase() });

        if (!user) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        // Return the user data
        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


// @desc    User updates their own profile (Name and Image only)
// @route   PATCH /api/users/profile/:id
async function handleUserSelfUpdate(req, res) {
    try {
        const { id } = req.params; // This is the facultyId from the URL

        // 1. Find the user first
        const user = await User.findOne({ facultyId: id.toUpperCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        // 2. Extract ONLY the allowed text fields
        const { name } = req.body; 

        // 3. Build the update object dynamically
        let updateData = {};
        
        // SCENARIO A: User provided a new name
        if (name) {
            updateData.name = name; 
        }

        // SCENARIO B: User provided a new image
        if (req.file) {
            // Safely delete the old image (helper ignores the default image)
            await deleteUploadedImage(user.profileImage);
            
            // Set the new image path 
            updateData.profileImage = `/uploads/${req.file.filename}`;
        }

        // 4. Prevent empty database calls
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No changes provided to update." 
            });
        }

        // 5. Update the user in MongoDB
        // Note: Because we only put 'name' or 'profileImage' inside updateData,
        // Mongoose will completely ignore the other field and keep whatever is already in the database!
        const updatedUser = await User.findOneAndUpdate(
            { facultyId: id.toUpperCase() },
            updateData,
            { new: true, runValidators: true } 
        );

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


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