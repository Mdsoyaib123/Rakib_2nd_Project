import { Request, Response } from "express";
import { WithdrawService } from "./withdrow.service";

const createWithdrawController = async (req: Request, res: Response) => {
  try {
    const result = await WithdrawService.createWithdrawService(req.body);

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptWithdraw = async (req: Request, res: Response) => {
  try {
    const { withdrawId } = req.params;

    const result = await WithdrawService.acceptWithdrawService(withdrawId);

    res.status(200).json({
      success: true,
      message: "Withdrawal approved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectWithdraw = async (req: Request, res: Response) => {
  try {
    const { withdrawId } = req.params;
    const { reviewRemark } = req.body;

    const result = await WithdrawService.rejectWithdrawService(
      withdrawId,
      reviewRemark,
    );

    res.status(200).json({
      success: true,
      message: "Withdrawal rejected successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getAllWithdraws = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await WithdrawService.getAllWithdrawsService(
      page,
      limit,
      req.query.transactionStatus as string,
      req.query.userId as string,
      req.query.withdrawalAmount
        ? Number(req.query.withdrawalAmount)
        : undefined,
      req.query.phoneLast4 as string,
    );

    res.status(200).json({
      success: true,
      message: "Withdraws retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleUserWithdraws = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await WithdrawService.getSingleUserWithdraws(
      Number(userId),
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "User withdraws retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const getSingleWithdraw = async (req: Request, res: Response) => {
  try {
    const { withdrawId } = req.params;

    const result = await WithdrawService.getSingleWithdraw(withdrawId);

    res.status(200).json({
      success: true,
      message: "single withdraw retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const WithdrawController = {
  createWithdrawController,
  acceptWithdraw,
  rejectWithdraw,
  getAllWithdraws,
  getSingleUserWithdraws,
  getSingleWithdraw,
};
