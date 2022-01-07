import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import config from "../config/index.js";
import UserModel from "../models/user.model.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
  //   issuer: "RUKSMS",
  //   audience: "RUKSMS",
};

passport.use(
  // decode jwt auto
  new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
      const oneUser = await UserModel.findById(jwtPayload.id);
      if (!oneUser) {
        return done(new Error("ไม่พบบัญชีผู้ใช้"), false);
      }
      return done(null, oneUser);
    } catch (e) {
      return done(e, false);
    }
  })
);

const requiredSignIn = passport.authenticate("jwt", { session: false });

export default requiredSignIn;
