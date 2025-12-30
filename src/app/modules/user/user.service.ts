import { generateUniqueInvitationCode } from "../../utils/genarateInvitationCode";
import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";

const createUser = async (payload: Partial<TUser>) => {
  const superiorUser = await User_Model.findOne({
    invitationCode: payload.invitationCode,
  });
  console.log("superior user id ", superiorUser?._id);

  const superiorUserId = superiorUser?._id;
  const superiorUserName = superiorUser?.name;

  payload.superiorUserId = superiorUserId as unknown as string;
  payload.superiorUserName = superiorUserName as string;

  const ieExists = await User_Model.findOne({ email: payload.email });

  if (ieExists) {
    throw new Error("Email already exists");
  }

  if (payload?.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;
  }


  const invitationCode = await generateUniqueInvitationCode();
  payload.invitationCode = invitationCode;

  const user = new User_Model(payload);

  console.log('user', user)
  return await user.save();
};

const getAllUsers = async () => {
  return await User_Model.find().sort({ createdAt: -1 });
};

const getUserByUserId = async (userId: string) => {
  console.log("userid ", userId);
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
const freezeUser = async (id: string, isFreeze: boolean) => {
  return await User_Model.findByIdAndUpdate(
    id,
    { freezeUser: isFreeze },
    { new: true }
  );
};

const rechargeUserBalance = async (id: string, amount: number) => {
  const user = await User_Model.findById(id);
  const newBalance = (user?.userBalance || 0) + amount;
  return await User_Model.findByIdAndUpdate(
    id,
    {
      userBalance: newBalance,
      memberTotalRecharge: (user?.memberTotalRecharge || 0) + amount,
    },
    { new: true }
  );
};
const decreaseUserBalance = async (id: string, amount: number) => {
  const user = await User_Model.findById(id);
  const newBalance = (user?.userBalance || 0) - amount;
  return await User_Model.findByIdAndUpdate(
    id,
    {
      userBalance: newBalance,
      memberTotalRecharge: (user?.memberTotalRecharge || 0) - amount,
    },
    { new: true }
  );
};

export const user_services = {
  createUser,
  getAllUsers,

  getUserByUserId,
  updateUser,
  deleteUser,
  freezeUser,
  rechargeUserBalance,
  decreaseUserBalance
};
