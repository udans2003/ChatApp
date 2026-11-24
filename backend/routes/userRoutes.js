
const express = require("express");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users
// Return registered users except the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
    })
      .select("_id username email profilePicture")
      .sort({ username: 1 })
      .lean();

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    res.status(500).json({
      message: "Could not fetch users",
    });
  }
});

module.exports = router;
