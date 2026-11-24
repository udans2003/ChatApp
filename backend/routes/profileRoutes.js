
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

// Get my profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("_id username email profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch {
    res.status(500).json({
      message: "Failed to load profile",
    });
  }
});

// Update my profile
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { username, profilePicture } = req.body;

    if (typeof username !== "string") {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim();

    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 30
    ) {
      return res.status(400).json({
        message: "Username must contain 3-30 characters",
      });
    }

    if (
      profilePicture !== undefined &&
      typeof profilePicture !== "string"
    ) {
      return res.status(400).json({
        message: "Profile picture must be a valid image",
      });
    }

    if (
      profilePicture &&
      !/^data:image\/(png|jpeg|webp);base64,/i.test(profilePicture)
    ) {
      return res.status(400).json({
        message: "Only PNG, JPG, and WebP images are supported",
      });
    }

    if (profilePicture?.length > 10_000_000) {
      return res.status(400).json({
        message: "Profile picture is too large",
      });
    }

    const existingUser = await User.findOne({
      username: cleanUsername,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    const update = { username: cleanUsername };
    if (typeof profilePicture === "string") {
      update.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      update,
      { new: true, runValidators: true }
    ).select("_id username email profilePicture");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      token: jwt.sign(
        {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || "",
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      ),
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username already taken",
      });
    }

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

module.exports = router;
