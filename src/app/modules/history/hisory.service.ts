
import { HistoryModel } from "./history.model";

const getAllHistory = async (userId: string, historyType: string) => {

    const query = historyType ? { userId: userId, historyType: historyType } : { userId: userId };

    return await HistoryModel.find(query);
};

export const HistoryService = {
  getAllHistory,
};
