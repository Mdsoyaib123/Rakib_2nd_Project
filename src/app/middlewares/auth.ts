import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app_error";
import { configs } from "../configs";
import { jwtHelpers, JwtPayloadType } from "../utils/JWT";
import { User_Model } from "../modules/user/user.schema";

type Role = "user" | "admin";

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new AppError("You are not authorize!!", 401);
      }
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        configs.jwt.access_token_secret as string
      );
      if (!roles.length || !roles.includes(verifiedUser.role)) {
        throw new AppError("You are not authorize!!", 401);
      }
      // check user
      const isUserExist = await User_Model.findOne({
        phoneNumber: verifiedUser?.phoneNumber,
      }).lean();
      if (!isUserExist) {
        throw new AppError("Account not found !", 404);
      }
      req.user = verifiedUser as JwtPayloadType;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
