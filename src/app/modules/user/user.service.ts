import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";

const createUser = async (payload: Partial<TUser>) => {
  return await User_Model.create(payload);
};

const getAllUsers = async () => {
  return await User_Model.find().sort({ createdAt: -1 });
};

const getUserById = async (id: string) => {
  return await User_Model.findById(id);
};

const getUserByUserId = async (userId: string) => {
  return await User_Model.findOne({ userId });
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  return await User_Model.findByIdAndUpdate(id, payload, {
    new: true,
  });
};

const deleteUser = async (id: string) => {
  return await User_Model.findByIdAndDelete(id);
};

export const user_services = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUserId,
  updateUser,
  deleteUser,
};
