import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";
import { sendSMS } from "../../utils/sms";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6 digit
};

const createUser = async (payload: Partial<TUser>) => {
  const ieExists = await User_Model.findOne({ email: payload.email });

  if (payload.password) {
    const hashedPassword = await bcrypt.hash(payload?.password, 10);
    payload.password = hashedPassword;
  }

  if (ieExists) {
    throw new Error("Email already exists");
  }

  if (payload?.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;
  }

  return await User_Model.create(payload);
};

const getAllUsers = async () => {
  return await User_Model.find().sort({ createdAt: -1 });
};

const getUserByUserId = async (userId: string) => {
  return await User_Model.findOne({ _id: userId });
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

  getUserByUserId,
  updateUser,
  deleteUser,
};
