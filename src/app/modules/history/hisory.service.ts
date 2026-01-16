import { Types } from "mongoose";
import { HistoryModel } from "./history.model";

const getAllHistory = async (userId: string) => {
  return await HistoryModel.find({ userId: userId }).sort({ time: -1 });
};

export const HistoryService = {
  getAllHistory,
};
