import mongoose, { Schema } from "mongoose";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    name: { type: String },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    password: { type: String, required: true },
    invitationCode: {
      type: String,
      required: true,
      unique: true,
    },
    superiorUserId: { type: String },
    superiorUserName: { type: String },
    userId: {
      type: Number,
      unique: true,
      default: () => Math.floor(1000000 + Math.random() * 9000000),
    },
    freezeUser: { type: Boolean, default: false },

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
    userOrderAmountSlot: { type: [Number], default: [] },
    userSelectedPackage: { type: Number },
    completedOrdersCount: { type: Number, default: 0 },
    adminAssaignProducts: {
      type: [{ productId: Number, orderNumber: Number }],
      default: [],
    },
  },
  { timestamps: true }
);

export const User_Model = mongoose.model<TUser>("User", userSchema);
