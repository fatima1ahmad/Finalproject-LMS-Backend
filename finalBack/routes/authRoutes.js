import express from "express";
import AuthController, { googleAuth,
  refreshToken,
} from "../controllers/authController.js";
import { generateToken } from "../utils/jwt.js";  
import { authenticate } from "../middlewares/authMiddleware.js";
import { authenticateJWT } from "../middlewares/authMiddleware.js";
import UserModel from "../models/userModel.js";
import passport from "passport"; 

const router = express.Router();

router.get("/google", googleAuth);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user); // JWT

    const redirectUrl = new URL("http://localhost:3000/auth/google/callback");
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("id", user.id);
    redirectUrl.searchParams.append("name", encodeURIComponent(user.name));
    redirectUrl.searchParams.append("email", encodeURIComponent(user.email));
    redirectUrl.searchParams.append("avatar", encodeURIComponent(user.avatar));
    redirectUrl.searchParams.append("role", user.role || "user");

    res.redirect(redirectUrl.toString());
  },AuthController.googleAuthCallback
);
router.post("/link-google", authenticate, AuthController.linkGoogleAccount);

// Auth routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", authenticateJWT, AuthController.logout);
router.put("/change-password", authenticateJWT, AuthController.changePassword);
router.get("/getme", authenticateJWT, AuthController.getMe);

// Token refresh
router.post("/refresh", refreshToken);

// JWT protected route example
router.get("/protected", authenticateJWT, (req, res) => {
  res.json({
    success: true,
    message: "This is a protected route",
    user: req.user,
  });
});

// Update last login
router.put("/update-last-login", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  await UserModel.updateLastLogin(userId);
  res.json({ success: true, message: "Last login updated" });
});

export default router;
