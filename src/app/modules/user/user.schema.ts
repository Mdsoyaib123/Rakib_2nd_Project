import mongoose, { Schema } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    invitationCode: { type: String, required: true },
    userId: {
      type: Number,
      unique: true,
      default: () => Math.floor(1000000 + Math.random() * 9000000),
    },

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

    lastLoginIp: { type: String },
    lastLoginTime: { type: Date },

    userType: { type: String, required: true, default: "Normal" },
  },
  { timestamps: true }
);

export const User_Model = mongoose.model<TUser>("User", userSchema);
