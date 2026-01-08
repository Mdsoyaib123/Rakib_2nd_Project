import { Request, Response } from "express";
import { user_services } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const user = await user_services.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await user_services.getAllUsers({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      userId: req.query.userId as any,
      ip: req.query.ip as string,
      phoneLast4: req.query.phoneLast4 as string,
      name: req.query.name as string,
      userType: req.query.userType as string,
      lastLoginTime: req.query.lastLoginTime as string,
    });

    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserByUserId = async (req: Request, res: Response) => {
  try {
    const user = await user_services.getUserByUserId(req.params.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await user_services.updateUser(req.params.userId, req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await user_services.deleteUser(req.params.userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const freezeUser = async (req: Request, res: Response) => {
  try {
    await user_services.freezeUser(req.params.userId, req.body.isFreeze);
    res.json({
      success: true,
      message: "User freeze status updated successfully",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const rechargeUserBalance = async (req: Request, res: Response) => {
  try {
    const result = await user_services.rechargeUserBalance(
      req.params.userId,
      req.body.amount
    );
    res.json({
      success: true,
      message: "User balance recharged successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
const decreaseUserBalance = async (req: Request, res: Response) => {
  try {
    const result = await user_services.decreaseUserBalance(
      req.params.userId,
      req.body.amount
    );
    res.json({
      success: true,
      message: "User balance decreased successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUserOrderAmount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    const result = await user_services.updateUserOrderAmount(userId, amount);

    res.status(200).json({
      success: true,
      message: `Amount updated successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const user_controllers = {
  createUser,
  getAllUsers,
  getUserByUserId,
  updateUser,
  deleteUser,
  freezeUser,
  rechargeUserBalance,
  decreaseUserBalance,
  updateUserOrderAmount,
};
