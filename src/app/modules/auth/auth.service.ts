import { AppError } from "../../utils/app_error";
import { TAccount, TLoginPayload, TRegisterPayload } from "./auth.interface";
import { Account_Model } from "./auth.schema";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { TUser } from "../user/user.interface";
import { User_Model } from "../user/user.schema";
import { jwtHelpers } from "../../utils/JWT";
import { configs } from "../../configs";
import { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../../utils/mail_sender";

const login_user_from_db = async (
  payload: TLoginPayload,
  ipAddress: string,
) => {
  const isExistAccount = await User_Model.findOne({
    phoneNumber: payload.phoneNumber,
  });
  // console.log("is account", isExistAccount);
  if (!isExistAccount) {
    throw new AppError("Account is   Not Found", httpStatus.NOT_FOUND);
  }
  if (isExistAccount?.freezeUser === true && isExistAccount?.role !== "admin") {
    throw new AppError(
      "Your account is currently Frozen. Please contact customer service",
      httpStatus.NOT_FOUND,
    );
  }
  console.log("ip address 444", ipAddress);

  await User_Model.findOneAndUpdate(
    { phoneNumber: payload.phoneNumber },
    { lastLoginIp: ipAddress, lastLoginTime: new Date() },
  );

  const isPasswordMatch = await bcrypt.compare(
    payload.password,
    isExistAccount.password,
  );

  if (!isPasswordMatch) {
    throw new AppError("Invalid password", httpStatus.UNAUTHORIZED);
  }

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  };

  if (isExistAccount?.role === "admin") {
    const otp = generateOTP();

    // Save OTP (recommended: DB with expiry)
    const userUpdate = await User_Model.findByIdAndUpdate(
      isExistAccount._id,
      {
        loginOtp: otp,
        loginOtpExpires: new Date(Date.now() + 5 * 60 * 1000),
      },
      { new: true } // ✅ return updated doc
    );

    console.log("OTP generated for admin login:", otp);
    console.log("Updated user:", userUpdate);


    try {
      await sendMail({
        to: "platformbd15@gmail.com",
        subject: "🔐 Admin Login Verification Code",
        textBody: `Your verification code is: ${otp}
This code will expire in 5 minutes.`,

        htmlBody: `
        <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
          <div style="max-width:600px; margin:auto; background:#fff; padding:25px; border-radius:10px;">
            
            <h2 style="color:#1b8fff;">🔐 Admin Login Verification</h2>

            <p>Hello Admin,</p>

            <p>Use the following code to complete your login:</p>

            <div style="font-size:28px; font-weight:bold; letter-spacing:5px; text-align:center; margin:20px 0; color:#111;">
              ${otp}
            </div>

            <p style="color:#666;">This code will expire in <strong>5 minutes</strong>.</p>

            <p style="color:#ef4444;">
              If you didn't attempt this login, please secure your account immediately.
            </p>

            <hr/>

            <p style="font-size:12px; color:#999;">
              Digital Credit AI Security System
            </p>

          </div>
        </div>
      `,
      });
    } catch (err) {
      console.error("OTP email failed:", err);
    }

    // 🚨 STOP LOGIN HERE (important)
    return {
      requiresOtp: true,
      message: "OTP sent to your email for verification",
      userId: isExistAccount.userId,
    };
  }


  const accessToken = jwtHelpers.generateToken(
    {
      phoneNumber: isExistAccount.phoneNumber,
      role: isExistAccount.role,
      userId: isExistAccount.userId,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_token_expires as string,
  );

  // console.log("accessToken", accessToken);

  const refreshToken = jwtHelpers.generateToken(
    {
      phoneNumber: isExistAccount.phoneNumber,
      role: isExistAccount.role,
      userId: isExistAccount.userId,
    },
    configs.jwt.refresh_token_secret as Secret,
    configs.jwt.refresh_token_expires as string,
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    role: isExistAccount.role,
    userId: isExistAccount.userId,
    user_id: isExistAccount._id,
  };
};

const verifyAdminOtp = async (userId: string, otp: string) => {
  const user = await User_Model.findOne({ userId: parseInt(userId) });

  if (!user || !user.loginOtp) {
    throw new AppError("Invalid request", 400);
  }

  if (user.loginOtp !== otp) {
    throw new AppError("Invalid OTP", 401);
  }

  if (new Date() > user?.loginOtpExpires !) {
    throw new AppError("OTP expired", 401);
  }

  // Clear OTP after success
  user.loginOtp  = undefined;
  user.loginOtpExpires = undefined;

  await user.save();

  // Generate tokens now
  const accessToken = jwtHelpers.generateToken(
    {
      phoneNumber: user.phoneNumber,
      role: user.role,
      userId: user.userId,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_token_expires as string,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      phoneNumber: user.phoneNumber,
      role: user.role,
      userId: user.userId,
    },
    configs.jwt.refresh_token_secret as Secret,
    configs.jwt.refresh_token_expires as string,
  );

  return {
    accessToken,
    refreshToken,
    role: user.role,
    userId: user.userId,
    user_id: user._id,
  };
};

const get_my_profile_from_db = async (phoneNumber: string) => {
  const accountProfile = await User_Model.findOne({
    phoneNumber: phoneNumber,
  });

  return {
    profile: accountProfile,
  };
};

const refresh_token_from_db = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      configs.jwt.refresh_token_secret as Secret,
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await User_Model.findOne({
    phoneNumber: decodedData.phoneNumber,
  });

  const accessToken = jwtHelpers.generateToken(
    {
      phoneNumber: userData!.phoneNumber,
      role: userData!.role,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_token_expires as string,
  );

  return { accessToken };
};

const change_password_from_db = async (
  user: JwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
  },
) => {
  const isExistAccount = await User_Model.findOne({
    phoneNumber: user.phoneNumber,
  });
  if (!isExistAccount) {
    throw new AppError("Account not found", httpStatus.NOT_FOUND);
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    isExistAccount.password,
  );
  if (!isCorrectPassword) {
    throw new AppError("Old password is incorrect", httpStatus.UNAUTHORIZED);
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 10);
  await User_Model.findOneAndUpdate(
    { phoneNumber: isExistAccount.phoneNumber },
    {
      password: hashedPassword,
    },
  );
  return "Password changed successful.";
};

// const forget_password_from_db = async (email: string) => {
//   const isAccountExists = await User_Model.findOne({ email: email });
//   if (!isAccountExists) {
//     throw new AppError("Account not found", httpStatus.NOT_FOUND);
//   }
//   const resetToken = jwtHelpers.generateToken(
//     {
//       email: isAccountExists.email,
//       role: isAccountExists.role,
//     },
//     configs.jwt.reset_secret as Secret,
//     configs.jwt.reset_expires as string,
//   );

//   const resetPasswordLink = `${configs.jwt.front_end_url}/reset?token=${resetToken}&email=${isAccountExists.email}`;
//   const emailTemplate = `<p>Click the link below to reset your password:</p><a href="${resetPasswordLink}">Reset Password</a>`;

//   await sendMail({
//     to: email,
//     subject: "Password reset successful!",
//     textBody: "Your password is successfully reset.",
//     htmlBody: emailTemplate,
//   });

//   return "Check your email for reset link";
// };

// const reset_password_into_db = async (
//   token: string,
//   email: string,
//   newPassword: string,
// ) => {
//   let decodedData: JwtPayload;
//   try {
//     decodedData = jwtHelpers.verifyToken(
//       token,
//       configs.jwt.reset_secret as Secret,
//     );
//   } catch (err) {
//     throw new AppError(
//       "Your reset link is expire. Submit new link request!!",
//       httpStatus.UNAUTHORIZED,
//     );
//   }

//   const isAccountExists = await User_Model.findOne({
//     email: decodedData.email,
//   });
//   if (!isAccountExists) {
//     throw new AppError("Account not found", httpStatus.NOT_FOUND);
//   }

//   const hashedPassword: string = await bcrypt.hash(newPassword, 10);

//   await Account_Model.findOneAndUpdate(
//     { email: isAccountExists.email },
//     {
//       password: hashedPassword,
//       lastPasswordChange: Date(),
//     },
//   );
//   return "Password reset successfully!";
// };

// const verified_account_into_db = async (token: string) => {
//   try {
//     const { email } = jwtHelpers.verifyToken(
//       token,
//       configs.jwt.verified_token as string,
//     );
//     // check account is already verified or blocked
//     const isExistAccount = await Account_Model.findOne({ email });
//     // check account
//     if (!isExistAccount) {
//       throw new AppError("Account not found!!", httpStatus.NOT_FOUND);
//     }
//     if (isExistAccount.isDeleted) {
//       throw new AppError("Account deleted !!", httpStatus.BAD_REQUEST);
//     }
//     const result = await Account_Model.findOneAndUpdate(
//       { email },
//       { isVerified: true },
//       { new: true },
//     );

//     return result;
//   } catch (error) {
//     throw new AppError("Invalid or Expired token!!!", httpStatus.BAD_REQUEST);
//   }
// };

// const get_new_verification_link_from_db = async (email: string) => {
//   const isExistAccount = await User_Model.findOne({ email });
//   // check account
//   if (!isExistAccount) {
//     throw new AppError("Account not found!!", httpStatus.NOT_FOUND);
//   }

//   const verifiedToken = jwtHelpers.generateToken(
//     {
//       email,
//     },
//     configs.jwt.verified_token as Secret,
//     "5m",
//   );
//   const verificationLink = `${configs.jwt.front_end_url}/verified?token=${verifiedToken}`;
//   await sendMail({
//     to: email,
//     subject: "New Verification link",
//     textBody: `New Account verification link is successfully created on ${new Date().toLocaleDateString()}`,
//     htmlBody: `
//             <p>Thanks for creating an account with us. We’re excited to have you on board! Click the button below to
//                 verify your email and activate your account:</p>


//             <div style="text-align: center; margin: 30px 0;">
//                 <a href="${verificationLink}" target="_blank"
//                     style="background-color: #4CAF50; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; font-size: 18px;"
//                     class="btn">
//                     Verify My Email
//                 </a>
//             </div>

//             <p>If you did not create this account, please ignore this email.</p>
//             `,
//   });

//   return null;
// };

export const auth_services = {
  login_user_from_db,
  verifyAdminOtp,
  get_my_profile_from_db,
  refresh_token_from_db,
  change_password_from_db,
  // forget_password_from_db,
};
