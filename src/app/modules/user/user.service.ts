import { generateUniqueInvitationCode } from "../../utils/genarateInvitationCode";
import { ProductModel } from "../product/product.model";
import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";

const createUser = async (payload: Partial<TUser>) => {
  const superiorUser = await User_Model.findOne({
    invitationCode: payload.invitationCode,
  });

  console.log("superior user id ", superiorUser?.userId);

  if (!superiorUser) {
    throw new Error("Superior user not found");
  }

  const superiorUserId = superiorUser?.userId;
  const superiorUserName = superiorUser?.name;

  payload.superiorUserId = superiorUserId as unknown as string;
  payload.superiorUserName = superiorUserName as string;

  const ieExists = await User_Model.findOne({
    phoneNumber: payload.phoneNumber,
  });

  if (ieExists) {
    throw new Error("Phone number already exists");
  }

  if (payload?.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;
  }

  const invitationCode = await generateUniqueInvitationCode();
  payload.invitationCode = invitationCode;

  const user = new User_Model(payload);

  console.log("user", user);
  return await user.save();
};

const getAllUsers = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    userId,
    ip,
    phoneLast4,
    name,
    userType,
    lastLoginTime,
  } = query;

  const filter: any = {};

  // 🔍 User ID
  if (userId) {
    filter.userId = Number(userId);
  }

  // 🔍 IP Address
  if (ip) {
    filter.lastLoginIp = ip;
  }

  // 🔍 Phone last 4 digits
  if (phoneLast4) {
    filter.phoneNumber = { $regex: `${phoneLast4}$` };
  }

  // 🔍 Name (partial match)
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  // 🔍 User Type
  if (userType) {
    filter.userType = userType;
  }
  // 🔍 Last Login Time (date range)
  if (lastLoginTime) {
    filter.lastLoginTime = {
      $gte: new Date(new Date(lastLoginTime).setHours(0, 0, 0, 0)),
      $lte: new Date(new Date(lastLoginTime).setHours(23, 59, 59, 999)),
    };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User_Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),

    User_Model.countDocuments(filter),
  ]);

  return {
    data,
  };
};
const getUserByUserId = async (userId: number) => {
  console.log("userid ", userId);
  return await User_Model.findOne({ userId: userId });
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  return await User_Model.findByIdAndUpdate(id, payload, {
    new: true,
  });
};

const deleteUser = async (id: number) => {
  return await User_Model.findOneAndDelete({ userId: id });
};
const freezeUser = async (id: number, isFreeze: boolean) => {
  return await User_Model.findOneAndUpdate(
    { userId: id },
    { freezeUser: isFreeze },
    { new: true }
  );
};

const rechargeUserBalance = async (id: number, amount: number) => {
  const user = await User_Model.findOne({ userId: id });
  const newBalance = (user?.userBalance || 0) + amount;
  return await User_Model.findOneAndUpdate(
    { userId: id },
    {
      userBalance: newBalance,
      memberTotalRecharge: (user?.memberTotalRecharge || 0) + amount,
    },
    { new: true }
  );
};
const decreaseUserBalance = async (id: number, amount: number) => {
  const user = await User_Model.findOne({ userId: id });
  const newBalance = (user?.userBalance || 0) - amount;
  return await User_Model.findOneAndUpdate(
    { userId: id },
    {
      userBalance: newBalance,
      memberTotalRecharge: (user?.memberTotalRecharge || 0) - amount,
    },
    { new: true }
  );
};
const updateUserOrderAmount = async (
  userId: number,
  amount: number | number[]
) => {
  const updatedUser = await User_Model.findOneAndUpdate(
    { userId: Number(userId) },
    { userOrderAmount: amount },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};
const updateUserSelectedPackageAmount = async (
  userId: number,
  amount: number
) => {
  const updatedUser = await User_Model.findOneAndUpdate(
    { userId: userId },
    { userSelectedPackage: amount },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};
const purchaseOrder = async (userId: number) => {
  const user: any = await User_Model.findOne({ userId: userId });

  if (!user) {
    throw new Error("User not found");
  }
  if (user?.freezeUser) {
    return { message: "User account is frozen" };
  }
  if (user?.userSelectedPackage === 0) {
    return { message: "Please select a slot first" };
  }
  if (user?.quantityOfOrders <= 0) {
    return { message: "Insufficient order quantity" };
  }

  const products = await ProductModel.aggregate([
    { $match: { salePrice: { $lte: user.userBalance } } },
    { $sample: { size: 1 } },
  ]);

  if (!products.length) {
    return { message: "Insufficient balance to purchase any product" };
  }

  const product = products[0];

  await User_Model.findOneAndUpdate(
    { userId },
    {
      $inc: {
        quantityOfOrders: -1,
        userBalance: -product.salePrice,
      },
    }
  );

  return product;
};

export const user_services = {
  createUser,
  getAllUsers,

  getUserByUserId,
  updateUser,
  deleteUser,
  freezeUser,
  rechargeUserBalance,
  decreaseUserBalance,
  updateUserOrderAmount,
  updateUserSelectedPackageAmount,
  purchaseOrder,
};
