import { Types } from "mongoose";

export type THistory = {
  userId: Types.ObjectId;
  historyType:  "recharge" | "checkIn";
  withdrawStatus ?: "PENDING" | "APPROVED" | "REJECTED";
  amount: number;
  time: Date;
};
