import { Request, Response } from "express";
import { HistoryService } from "./hisory.service";

const getAllHistory = async (req: Request, res: Response) => {
  try {
    const histories = await HistoryService.getAllHistory(
      req.params.userId as string,
      req.query.historyType as string
    );

    res.status(200).json({
      success: true,
      data: histories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch history",
      error,
    });
  }
};

export const HistoryController = {
  getAllHistory,
};
