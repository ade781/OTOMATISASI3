import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ status: "error", code: "TOKEN_MISSING" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ status: "error", code: "TOKEN_EXPIRED" });
      }
      return res.status(403).json({ status: "error", code: "TOKEN_INVALID" });
    }
    req.user = decoded;
    next();
  });
};