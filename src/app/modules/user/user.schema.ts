import mongoose, { Schema } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    invitationCode: { type: String, required: true },
    userId: { type: String, required: true, unique: true },

    superiorUserId: { type: String },
    superiorUserName: { type: String },
    userLavel: { type: String },

    quantityOfOrders: { type: Number, default: 0 },
    withdrowalValidOddNumber: { type: Number, default: 0 },
    actualCompletedNumberToday: { type: Number, default: 0 },

    userBalance: { type: Number, required: true, default: 0 },
    memberTotalRecharge: { type: Number, default: 0 },
    memberTotalWithdrawal: { type: Number, default: 0 },

    userOrderFreezingAmount: { type: Number, default: 0 },
    amountFrozedInWithdrawal: { type: Number, default: 0 },
    whetherOnline: { type: Boolean, default: true },
    mobilePhoneAreaCode: { type: String },

    lastLoginIp: { type: String, required: true },
    lastLoginTime: { type: Date, required: true },

    userType: { type: String, required: true },
  },
  { timestamps: true }
);

export const User_Model = mongoose.model<TUser>("User", userSchema);
