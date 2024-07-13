const Users = require("../models/users.model");
const Tokens = require("../models/tokens.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendEmail");
const { sendActivationToken } = require("../utils/sendActivationToken");
exports.registerUser = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.password) {
      return res.status(400).send({
        message: "Password Required",
      });
    }
    let user = await Users.findOne({ email: payload.email });
    if (!user) {
      // create new user and save it to the database
      const hashedValue = bcrypt.hashSync(payload.password, 10);
      const activationToken = crypto.randomBytes(32).toString("hex");
      payload.hashedPassword = hashedValue;
      payload.activationToken = activationToken;
      delete payload.password;
      user = new Users(payload);
      const activationTokenSent = await sendActivationToken(
        payload.email,
        activationToken
      );
      if (activationTokenSent) {
        await user
          .save()
          .then((data) => {
            res.status(201).send({
              message:
                "User created successfully! Please check your email to activate your account.",
            });
          })
          .catch((error) => {
            res.status(400).send({
              message: "error while creating user",
              error: error.message,
            });
          });
      } else {
        res
          .status(400)
          .send({ message: "error while sending activation token" });
      }
    } else {
      return res.status(409).send({ message: "Email already in use." });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { activationToken } = req.body;
    const user = await Users.findOne({ activationToken: activationToken });
    if (!user) {
      res.status(404).send({
        message: "User not found",
      });
    } else {
      user.isActivated = true;
      // user.activationToken = null;
      user.save().then((data) => {
        res.status(200).send({
          message: "User activated successfully",
        });
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "Invalid Email or email not registered" });
    }
    const isValidPass = bcrypt.compareSync(password, user.hashedPassword);
    if (!isValidPass) {
      return res.status(401).send({ message: "Invalid Password" });
    }
    let token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    res.cookie("accessToken", token, {
      expires: new Date(Date.now() + 86400000),
    });
    res.status(200).send({
      message: "User logged in Successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await res.clearCookie("accessToken");
    return res.status(200).send({
      message: "User logged-out successfully.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .send({ message: "User with the given email doesn't exist" });
    }
    let token = await Tokens.findOne({ email });
    if (token) {
      await token.deleteOne();
    }
    const newToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = bcrypt.hashSync(newToken, 10);
    token = new Tokens({ email, token: hashedToken });
    await token.save();
    const link = `http://localhost:3000/reset-password/?token=${newToken}&email=${user.email}`;
    const ismailSent = await sendEmail(user.email, link);
    console.log(ismailSent);
    if (ismailSent) {
      return res
        .status(200)
        .send({ message: "Check your mail to reset password." });
    }
    return res
      .status(500)
      .send({ message: "Error while sending email else loop" });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    const resetToken = await Tokens.findOne({ email });
    if (!resetToken) {
      return res.status(400).send({ message: "Invalid or expired Token" });
    }
    const isValidToken = await bcrypt.compareSync(token, resetToken.token);
    if (!isValidToken) {
      return res.status(400).send({ message: "Invalid or expired Token" });
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    Users.findOneAndUpdate(
      { email },
      { $set: { hashedPassword: hashedPassword } }
    )
      .then((data) => {
        res.status(200).send({
          message: "Password Reset Successfully",
          data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "error while resetting password",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};
