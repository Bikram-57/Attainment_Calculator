const User = require('../models/user');

// @desc    Admin creates a new Faculty
// @route   POST /api/users/admin-create
// exports.adminCreateUser = async (req, res) => {
async function handleGenerateNewUser(req, res) {

// @desc    Admin creates a new Faculty
// @route   POST /api/users/admin-create
    try {
        const { facultyId, name, email, password } = req.body;

        // Force role to 'faculty' as per your "One Admin" requirement
        const newUser = await User.create({
            facultyId,
            name,
            email,
            password,
            role: 'faculty'
        });

        res.status(201).json({
            success: true,
            message: "Faculty account created successfully",
            data: {
                id: newUser._id,
                facultyId: newUser.facultyId,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        // Handle MongoDB Duplicate Key Error (code 11000)
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            const message = duplicateField === 'facultyId' 
                ? "This Faculty ID is already registered." 
                : "This Email address is already in use.";
            
            return res.status(400).json({
                success: false,
                message: message
            });
        }

        // Handle Mongoose Validation Errors (e.g., missing fields)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages[0] });
        }

        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};


// @desc    Update Faculty Info (Admin Only)
// @route   PUT /api/users/update/:id

async function handleEditUserByFacultyId(req, res) {

    try {
        const { id } = req.params; // The facultyId from the URL (e.g., CA1718 or F101)
        const { name, email } = req.body;

        // 1. SECURITY: Prevent any changes to the Super Admin account
        if (id.toUpperCase() === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account (Dr. Krishna) cannot be modified."
            });
        }

        // 2. UPDATE: Only update allowed fields (name and email)
        const updatedUser = await User.findOneAndUpdate(
            { facultyId: id.toUpperCase() },
            { name, email },
            { 
                new: true,           // Return the updated document
                runValidators: true  // Ensure email format is still valid
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "Faculty member not found" });
        }

        res.status(200).json({
            success: true,
            message: "Faculty information updated successfully",
            data: updatedUser
        });

    } catch (error) {
        // Handle duplicate email error during update
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "This email is already assigned to another user." 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get Single Faculty (Restricts Admin ID)
// @route   GET /api/users/:id

async function handleGetUserByFacultyId(req, res) {
    try {
        const { id } = req.params;
        const requestedId = id.toUpperCase();

        // 1. RESTRICTION: Block anyone from fetching Dr. Krishna's Admin data
        if (requestedId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "Access Denied: The Super Admin profile is restricted and cannot be fetched."
            });
        }

        // 2. SEARCH: Find the faculty member
        const user = await User.findOne({ facultyId: requestedId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Faculty member not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};


// @desc    Delete Faculty (Admin Only) - Protects Dr. Krishna
// @route   DELETE /api/users/delete/:id
async function handleDeleteUserByFacultyId(req, res) {

    try {
        // 1. Capture the ID from the URL and force to Uppercase
        const targetId = req.params.id.toUpperCase();

        // 2. THE LOCK: Specifically block the Super Admin ID from deletion
        if (targetId === 'CA1718') {
            return res.status(403).json({
                success: false,
                message: "System Protection: The Super Admin account (CA1718) is permanent and cannot be deleted."
            });
        }

        // 3. EXECUTION: Attempt to find and remove the faculty member
        const deletedUser = await User.findOneAndDelete({ facultyId: targetId });

        // 4. CHECK: If the facultyId doesn't exist in the database
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: `No faculty member found with ID: ${targetId}`
            });
        }

        // 5. SUCCESS: Return confirmation
        res.status(200).json({
            success: true,
            message: `Faculty member ${targetId} (${deletedUser.name}) has been deleted.`
        });

    } catch (error) {
        // Handle unexpected server/database errors
        res.status(500).json({
            success: false,
            message: "Server Error: Could not complete the deletion request.",
            error: error.message
        });
    }
};


async function handleGetAllUsers(req, res) {

    try {
        // Use the $ne (Not Equal) operator to exclude Dr. Krishna's ID
        // This ensures the Admin is never part of the general list
        const users = await User.find({ 
            facultyId: { $ne: 'CA1718' } 
        }).sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            count: users.length,
            message: "Faculty list retrieved successfully",
            data: users
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch users.",
            error: error.message
        });
    }
};

module.exports = {
  handleGenerateNewUser,
  handleEditUserByFacultyId,
  handleGetUserByFacultyId,
  handleDeleteUserByFacultyId,
  handleGetAllUsers
}