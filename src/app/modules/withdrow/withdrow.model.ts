import mongoose, { Schema } from "mongoose";
import { TWithdraw } from "./withdrow.interface";

const withdrawSchema = new Schema<TWithdraw>(
  {
    userId: { type: Number, required: true, index: true },

    amount: { type: Number, required: true },

    transactionStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    superiorUserName: { type: String },
    name: { type: String, required: true },

    withdrawMethod: {
      type: String,
      enum: ["BankTransfer", "MobileBanking"],
      required: true,
    },

    // Bank Transfer
    bankName: {
      type: String,
      required: function (this: TWithdraw) {
        return this.withdrawMethod === "BankTransfer";
      },
    },
    bankAccountNumber: {
      type: Number,
      required: function (this: TWithdraw) {
        return this.withdrawMethod === "BankTransfer";
      },
    },
    branchName: { type: String },
    district: { type: String },

    // Mobile Banking
    mobileBankingName: {
      type: String,
      required: function (this: TWithdraw) {
        return this.withdrawMethod === "MobileBanking";
      },
    },
    mobileBankingAccountNumber: {
      type: Number,
      required: function (this: TWithdraw) {
        return this.withdrawMethod === "MobileBanking";
      },
    },
    mobileUserDistrict: {
      type: String,
      required: function (this: TWithdraw) {
        return this.withdrawMethod === "MobileBanking";
      },
    },
    withdrawalAmount: { type: Number, required: true },
    totalRechargeAmount: { type: Number },
    totalWithdrawalAmount: { type: Number },

    applicationTime: { type: Date, default: Date.now },
    processingTime: { type: Date },

    reviewRemark: { type: String },

  },
  { timestamps: true },
);

export const Withdraw_Model = mongoose.model<TWithdraw>(
  "Withdraw",
  withdrawSchema,
);
