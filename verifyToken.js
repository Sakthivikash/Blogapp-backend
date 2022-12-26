const jwt = require("jsonwebtoken");
const Token = require("./models/Token");

const validateToken = async (req, res, next) => {
  const userId = req.header("userId");
  const token = await Token.findOne({ userId });
  console.log(token);
  req.token = token.token;
  console.log(req.token);
  await jwt.verify(req.token, process.env.SECRET, (err, data) => {
    if (err) {
      console.log(err);
      return res
        .status(403)
        .json("Your session has timedout Or Access Deneid.Please Login!");
    } else {
      next();
    }
  });
};

module.exports.validateToken = validateToken;
