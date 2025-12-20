import { Request, Response } from "express";
import { user_services } from "./user.service";


 const createUser = async (req: Request, res: Response) => {
  try {
    const user = await user_services.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

 const getAllUsers = async (_req: Request, res: Response) => {
  const users = await user_services.getAllUsers();
  res.json({ success: true, data: users });
};

 const getUserById = async (req: Request, res: Response) => {
  const user = await user_services.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
};

 const getUserByUserId = async (req: Request, res: Response) => {
  const user = await user_services.getUserByUserId(req.params.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.json({ success: true, data: user });
};

 const updateUser = async (req: Request, res: Response) => {
  const user = await user_services.updateUser(req.params.id, req.body);
  res.json({ success: true, data: user });
};

 const deleteUser = async (req: Request, res: Response) => {
  await user_services.deleteUser(req.params.id);
  res.json({ success: true, message: "User deleted successfully" });
};


export const user_controllers = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUserId,
  updateUser,
  deleteUser,
};
