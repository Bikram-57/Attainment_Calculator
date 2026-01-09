const User = require('../models/user')

async function handleGenerateNewUser(req, res) {
    try {
        const { facultyId, name, email, password } = req.body;
        console.log(req.body);
        
        await User.create({
            facultyId,
            name,
            email,
            password
        })

        return res.status(201)
        .json({
            success: true,
            message: "User created successfully",
              data: {
                id: facultyId,
                name: name,
                email: email
              }
        });
    }
     catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error saving data",
      error: error.message
    });
  }
};


async function handleGetUserByFacultyId(req, res) {
  try {
    const { facultyId } = req.params;

    const user = await User.findOne({ facultyId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message
    });
  }
}

async function handleDeleteUserByFacultyId(req, res) {
  try {
    const { facultyId } = req.params;

    const user = await User.findOneAndDelete({ facultyId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user.facultyId,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
}


async function handleEditUserByFacultyId(req, res) {
  try {
    const { facultyId } = req.params;
    const { name, email } = req.body;

    // Find user by facultyId
    const user = await User.findOne({ facultyId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message
    });
  }
}


module.exports = { 
  handleGenerateNewUser, 
  handleGetUserByFacultyId, 
  handleDeleteUserByFacultyId, 
  handleEditUserByFacultyId 
}