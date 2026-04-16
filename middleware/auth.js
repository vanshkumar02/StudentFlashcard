const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("No token provided");
  }

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
}

module.exports = auth;