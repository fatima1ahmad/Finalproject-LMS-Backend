import passport from "passport";
import UserModel from "../models/userModel.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const oauthId = profile.id;
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatar =
          profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Try to find user by OAuth ID
        let user = await UserModel.findByGoogleId(oauthId);

        if (!user) {
          // Try to find user by email
          const existingUser = await UserModel.findByEmail(email);

          if (existingUser) {
            // Link Google account to existing user
            user = await UserModel.linkOAuthAccount(existingUser.id, {
              provider: "google",
              providerId: oauthId,
              email: email,
            });
          } else {
            // Create new user with Google info
            user = await UserModel.create({
              email,
              name,
              oauth_provider: "google",
              oauth_id: oauthId,
              avatar,
              password: null,
              role: "student", // or your default role
            });
          }
        }
        // Update last login timestamp
        await UserModel.updateLastLogin(user.id);

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
