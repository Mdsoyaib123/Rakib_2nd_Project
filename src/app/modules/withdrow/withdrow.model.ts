import mongoose, { Schema } from "mongoose";
import { TWithdraw } from "./withdrow.interface";

const withdrawSchema = new Schema<TWithdraw>(
  {
    userId: { type: Number, required: true, index: true },

    amount: { type: Number, required: true }, // requested amount

    transactionStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    superiorUserName: { type: String },
    name: { type: String, required: true },

    BankName: { type: String, required: true },
    withdrawalAddress: { type: String, required: true },

    withdrawalAmount: { type: Number, required: true }, // before fee
    totalRechargeAmount: { type: Number },
    totalWithdrawalAmount: { type: Number },

    applicationTime: { type: Date, default: Date.now },
    processingTime: { type: Date },

    reviewRemark: { type: String },
  },
  { timestamps: true }
);

export const Withdraw_Model = mongoose.model<TWithdraw>(
  "Withdraw",
  withdrawSchema
);
