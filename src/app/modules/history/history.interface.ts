import { Types } from "mongoose";

export type THistory = {
  userId: Types.ObjectId;
  historyType: "withdraw" | "recharge" | "checkIn";
  amount: number;
  time: Date;
};
