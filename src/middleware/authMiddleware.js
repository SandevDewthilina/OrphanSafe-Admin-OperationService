import asyncHandler from "express-async-handler";
import { verifyJWT, verifyAppPassToken } from "../utils/index.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = verifyJWT(token);
      req.userInfo = decoded;
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    const appPass = req.cookies.appPass;
    if (appPass) {
      if (verifyAppPassToken(appPass)) {
        next();
      } else {
        res.status(401);
        throw new Error("Not authorized, invalid app secret");
      }
    } else {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  }
});

export { protect };
