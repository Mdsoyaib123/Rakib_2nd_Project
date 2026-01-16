import mongoose, { Schema } from "mongoose";
import { THistory } from "./history.interface";

const historySchema = new Schema<THistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    historyType: {
      type: String,
      enum: ["withdraw", "recharge", "checkIn"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const HistoryModel = mongoose.model<THistory>("History", historySchema);
