const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;