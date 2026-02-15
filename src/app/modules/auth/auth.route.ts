import { Router } from "express";
import { auth_controllers } from "./auth.controller";
import RequestValidator from "../../middlewares/request_validator";
import { auth_validation } from "./auth.validation";
import auth from "../../middlewares/auth";

const authRoute = Router();

authRoute.post(
  "/login",
  RequestValidator(auth_validation.login_validation),
  auth_controllers.login_user
);

authRoute.get("/me", auth("admin", "user"), auth_controllers.get_my_profile);

authRoute.post("/refresh-token", auth_controllers.refresh_token);

authRoute.post(
  "/change-password",
  auth("admin", "user"),
  RequestValidator(auth_validation.changePassword),
  auth_controllers.change_password
);
// authRoute.post(
//   "/forgot-password",
//   RequestValidator(auth_validation.forgotPassword),
//   auth_controllers.forget_password
// );
// authRoute.post(
//   "/reset-password",
//   RequestValidator(auth_validation.resetPassword),
//   auth_controllers.reset_password
// );

// authRoute.post(
//   "/verified-account",
//   RequestValidator(auth_validation.verified_account),
//   auth_controllers.verified_account
// );
// authRoute.post(
//   "/new-verification-link",
//   RequestValidator(auth_validation.forgotPassword),
//   auth_controllers.get_new_verification_link
// );
export default authRoute;
