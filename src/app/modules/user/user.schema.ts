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
    userDiopsitType: {
      type: String,
      enum: ["trial", "deposit"],
      default: "trial",
    },

    orderRound: {
      type: {
        round: {
          type: String,
          enum: ["trial", "round_one", "round_two"],
          required: true,
          default: "trial",
        },
        status: {
          type: Boolean,
          default: true,
        },
      },
      default: {
        round: "trial",
        status: true,
      },
    },

    freezeUser: { type: Boolean, default: true },

    quantityOfOrders: { type: Number, default: 0 },
    completedOrdersCount: { type: Number, default: 0 },
    withdrawalAddressAndMethod: {
      type: {
        BankName: { type: String },
        withdrawalAddress: { type: String },
      },
      default: null,
    },
    withdrowalValidOddNumber: { type: Number, default: 0 },
    actualCompletedNumberToday: { type: Number, default: 0 },

    userBalance: { type: Number, required: true, default: 0 },
    dailyProfit: { type: Number, default: 0 },
    memberTotalRecharge: { type: Number, default: 0 },
    memberTotalWithdrawal: { type: Number, default: 0 },

    userOrderFreezingAmount: { type: Number, default: 0 },
    amountFrozedInWithdrawal: { type: Number, default: 0 },
    whetherOnline: { type: Boolean, default: true },
    mobilePhoneAreaCode: { type: String },

    lastLoginIp: { type: String },
    lastLoginTime: { type: Date },

    userType: { type: String, required: true, default: "Normal" },
    userOrderAmountSlot: {
      type: [Number],
      default: [10000, 30000, 50000, 100000, 200000, 300000, 500000],
    },
    userSelectedPackage: { type: Number },

    adminAssaignProducts: {
      type: [
        {
          productId: { type: Number, required: true },
          orderNumber: { type: Number, required: true },
          mysterybox: {
            type: {
              method: {
                type: String,
                enum: ["cash", "12x"],
              },
              amount: {
                type: String,
              },
            },
            required: false, // ✅ optional
            default: undefined,
          },
        },
      ],
      default: [],
    },

    completedOrderProducts: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User_Model = mongoose.model<TUser>("User", userSchema);
