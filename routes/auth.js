const router = require("express").Router();
const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("Wrong credentials!");

    const validated = await bcrypt.compare(req.body.password, user.password);
    !validated && res.status(400).json("Wrong credentials!");

    const accessToken = await jwt.sign(
      { userID: user._id },
      process.env.SECRET,
      { expiresIn: "2d" }
    );

    const token = await new Token({
      userId: user._id,
      token: accessToken,
    });
    await token.save();
    console.log(token);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/logout", async (req, res) => {
  const userId = req.body.userId;
  try {
    const token = await Token.findOneAndDelete({ userId });
    if (token) {
      res.json("Logged out successfully");
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
