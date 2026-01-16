import mongoose from "mongoose";
import { generateUniqueInvitationCode } from "../../utils/genarateInvitationCode";
import { ProductModel } from "../product/product.model";
import { TUser } from "./user.interface";
import { User_Model } from "./user.schema";
import bcrypt from "bcrypt";

const createUser = async (payload: Partial<TUser>) => {
  const superiorUser = await User_Model.findOne({
    invitationCode: payload.invitationCode,
  });

  // console.log("superior user id ", superiorUser?.userId);

  if (!superiorUser) {
    throw new Error("Superior user not found");
  }

  const superiorUserId = superiorUser?.userId;
  const superiorUserName = superiorUser?.name;

  payload.superiorUserId = superiorUserId as unknown as string;
  payload.superiorUserName = superiorUserName as string;

  const ieExists = await User_Model.findOne({
    phoneNumber: payload.phoneNumber,
    email: payload.email,
  });

  if (ieExists) {
    throw new Error("Phone number or email is already exists");
  }

  if (payload?.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.password = hashedPassword;
  }

  const invitationCode = await generateUniqueInvitationCode();
  payload.invitationCode = invitationCode;

  payload.quantityOfOrders = 25; // Trial round orders
  payload.userDiopsitType = "trial";
  payload.userBalance = 10000;
  payload.userSelectedPackage = 10000;
  payload.orderRound = {
    round: "trial",
    status: true,
  };

  const user = new User_Model(payload);

  // console.log("user", user);
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

const rechargeUserBalance = async (userId: number, amount: number) => {
  const user: any = await User_Model.findOne({ userId });
  if (!user) throw new Error("User not found");

  // if (user.orderRound.round !== "trial" && !user.orderRound.status) {
  //   throw new Error("All order rounds completed. Now recharge fast!");
  // }

  // ✅ Set deposit type and unlock first deposit round, but user can't order yet
  return await User_Model.findOneAndUpdate(
    { userId },
    {
      $set: {
        userDiopsitType: "deposit",
        "orderRound.round": "round_one",
        "orderRound.status": false, // ❌ user cannot order yet
      },
      $inc: {
        userBalance: amount,
        memberTotalRecharge: amount,
      },
    },
    { new: true }
  );
};

const enableOrderRound = async (
  userId: number,
  round: "round_one" | "round_two",
  status: boolean
) => {
  const user = await User_Model.findOne({ userId });
  if (!user) throw new Error("User not found");
  return await User_Model.findOneAndUpdate(
    { userId },
    {
      $set: {
        "orderRound.round": round,
        "orderRound.status": status,
        quantityOfOrders:
          user?.quantityOfOrders === 0 ? 25 : user?.quantityOfOrders, // admin decides quantity
        completedOrdersCount:
          user?.completedOrdersCount === 25 ? 0 : user?.completedOrdersCount,
      },
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
const updateUserOrderAmountSlot = async (
  userId: number,
  amount: number | number[]
) => {
  const updatedUser = await User_Model.findOneAndUpdate(
    { userId: Number(userId) },
    { userOrderAmountSlot: amount },
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
  const user: any = await User_Model.findOne({ userId: userId });

  if (user?.userBalance < amount) {
    throw new Error("Insufficient balance, please recharge first");
  }

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
const updateQuantityOfOrders = async (
  userId: number,
  round: string,
  status: boolean
) => {
  const updatedUser = await User_Model.findOneAndUpdate(
    { userId: userId },
    { "orderRound.round": round, "orderRound.status": status },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

const updateAdminAssaignProduct = async (
  userId: number,
  productId?: number,
  orderNumber?: number,
  mysteryboxMethod?: string,
  mysteryboxAmount?: string
) => {
  try {
    // 🔹 CASE 1: Product + orderNumber exists
    if (productId && orderNumber) {
      const updatedUser = await User_Model.findOneAndUpdate(
        {
          userId,
          "adminAssaignProductsOrRewards.orderNumber": { $ne: orderNumber },
        },
        {
          $push: {
            adminAssaignProductsOrRewards: {
              productId,
              orderNumber,
              ...(mysteryboxMethod && mysteryboxAmount
                ? {
                    mysterybox: {
                      method: mysteryboxMethod,
                      amount: mysteryboxAmount,
                    },
                  }
                : {}),
            },
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error(
          `Order number ${orderNumber} already assigned or user not found`
        );
      }

      return updatedUser;
    }

    if (
      mysteryboxMethod === "12x" &&
      mysteryboxAmount &&
      !productId &&
      !orderNumber
    ) {
      throw new Error("Product or order number is required for 12x mysterybox");
    }

    // 🔹 CASE 2: ONLY mysterybox (no product, no order)

    if (mysteryboxMethod === "cash" && mysteryboxAmount) {
      const updatedUser = await User_Model.findOneAndUpdate(
        { userId },
        {
          $set: {
            mysteryReward: mysteryboxAmount,
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    }
  } catch (error: any) {
    console.error("❌ Error in updateAdminAssaignProduct:", error.message);

    // Re-throw for controller to handle
    throw new Error(error.message || "Failed to assign product or reward");
  }
};
const removeMysteryReward = async (userId: number) => {
  try {
    if (!userId) {
      throw new Error("UserId is required");
    }

    const user = await User_Model.findOne({ userId }).select("mysteryReward");

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await User_Model.findOneAndUpdate(
      { userId },
      {
        $inc: {
          userBalance: user.mysteryReward,
          dailyProfit: user.mysteryReward,
        },
        $unset: { mysteryReward: 0 },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error: any) {
    console.error("❌ Error in removeMysteryReward:", error.message);
    throw new Error(error.message || "Failed to remove mystery reward");
  }
};
const addCheckInReward = async (userId: number, checkInAmount: number) => {
  try {
    if (!userId) {
      throw new Error("UserId is required");
    }

    const user: any = await User_Model.findOne({ userId });

    if (!user) {
      throw new Error("User not found");
    }

    // ❌ Trial round users cannot check in
    if (user?.orderRound?.round === "trial") {
      throw new Error("Daily check-in is not available in trial round");
    }

    // ❌ Must complete at least 40 orders
    if (user?.orderCountForCheckIn <= 40) {
      throw new Error("Complete at least 40 orders to enable daily check-in");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheckIn = user.dailyCheckInReward?.lastCheckInDate
      ? new Date(user.dailyCheckInReward.lastCheckInDate)
      : null;

    if (lastCheckIn) {
      lastCheckIn.setHours(0, 0, 0, 0);

      // ❌ Already checked in today
      if (lastCheckIn.getTime() === today.getTime()) {
        throw new Error("You have already checked in today");
      }
    }

    const updatedUser = await User_Model.findOneAndUpdate(
      { userId },
      {
        $inc: {
          userBalance: checkInAmount,
          dailyProfit: checkInAmount,
          "dailyCheckInReward.totalCheckIns": 1,
        },
        $set: {
          "dailyCheckInReward.lastCheckInDate": new Date(),
        },
      },
      { new: true }
    );

    return updatedUser;
  } catch (error: any) {
    console.error("❌ Error in addCheckInReward:", error.message);
    throw new Error(error.message || "Failed to add daily check-in reward");
  }
};

const purchaseOrder = async (userId: number) => {
  const user: any = await User_Model.findOne({ userId }).lean();

  if (!user) throw new Error("User not found");
  if (user.freezeUser) return { message: "User account is frozen" };
  if (!user.userSelectedPackage)
    return { message: "Please select a slot first" };
  if (!user.orderRound.status) {
    return { message: "No active order round available" };
  }

  if (user.quantityOfOrders <= 0)
    return { message: "Insufficient order quantity" };

  // 🔢 Order number preview
  const currentOrderNumber = user.completedOrdersCount + 1;

  let product: any;
  let isAdminAssigned = false;

  const forcedProductRule = user.adminAssaignProductsOrRewards?.find(
    (rule: any) => rule.orderNumber === currentOrderNumber
  );

  if (forcedProductRule) {
    product = await ProductModel.findOneAndUpdate(
      {
        productId: forcedProductRule.productId,
      },
      {},
      { new: true }
    ).lean();

    // if (!product) throw new Error("Assigned product not found");

    isAdminAssigned = true;
  } else {
    const products = await ProductModel.aggregate([
      { $match: { price: { $lte: user?.userSelectedPackage } } },
      { $sample: { size: 1 } },
    ]);

    if (!products.length) {
      return { message: "Insufficient balance to purchase any product" };
    }

    product = products[0];
  }

  return {
    orderNumber: currentOrderNumber,
    product,
    isAdminAssigned,
    outOfBalance: forcedProductRule ? user.userBalance - product.price : null,
    mysteryboxMethod: forcedProductRule?.mysterybox?.method
      ? forcedProductRule?.mysterybox?.method
      : null,
    mysteryboxAmount: forcedProductRule?.mysterybox?.amount
      ? forcedProductRule?.mysterybox?.amount
      : null,
  };
};

const confirmedPurchaseOrder = async (userId: number, productId: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user: any = await User_Model.findOne({ userId }).session(session);

    if (user.quantityOfOrders === 0) {
      await User_Model.updateOne(
        { userId },
        { $set: { "orderRound.status": false } },
        { session }
      );
    }

    if (!user) throw new Error("User not found");
    if (user.quantityOfOrders <= 0)
      return { message: "Insufficient order quantity" };

    const currentOrderNumber = user.completedOrdersCount + 1;

    const product = await ProductModel.findOne({
      productId: productId,
    }).session(session);

    console.log("product", product);

    if (!product) throw new Error("Product not found");

    if (user.userBalance < product.price)
      return {
        success: false,
        message:
          "Insufficient balance to purchase this product.please contact to admin supports",
      };

    let forcedProductRule: any = null;

    forcedProductRule = user.adminAssaignProductsOrRewards?.find(
      (rule: any) => rule.orderNumber === currentOrderNumber
    );

    const productCommisionTenpercent =
      forcedProductRule?.mysterybox?.method === "cash"
        ? Number(forcedProductRule?.mysterybox?.amount)
        : forcedProductRule?.mysterybox?.method === "12x"
        ? product.price / 2
        : (product.price * 10) / 100;

    console.log("ten persent", productCommisionTenpercent);
    console.log("prodcut commision", product.commission);

    // ✅ SAME UPDATE LOGIC
    const updateQuery: any = {
      $inc: {
        quantityOfOrders: -1,
        completedOrdersCount: 1,
        orderCountForCheckIn: user?.userDiopsitType === "deposit" ? 1 : 0,
        userBalance: forcedProductRule
          ? Number(productCommisionTenpercent)
          : product.commission,

        dailyProfit: forcedProductRule
          ? Number(productCommisionTenpercent)
          : product.commission,
      },
      $push: {
        completedOrderProducts: product.productId.toString(),
      },
    };
    if (
      user.quantityOfOrders === 1 &&
      (user.orderRound.round === "trial" ||
        user.orderRound.round === "round_two")
    ) {
      updateQuery.$set = {
        userSelectedPackage: 0,
        "orderRound.status": false,
      };
    }

    if (forcedProductRule) {
      updateQuery.$pull = {
        adminAssaignProductsOrRewards: { orderNumber: currentOrderNumber },
      };
    }

    await User_Model.updateOne({ userId }, updateQuery, { session });

    if (product.isAdminAssigned) {
      await ProductModel.updateOne(
        { productId: product.productId },
        { $set: { isAdminAssigned: false } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return {
      orderNumber: currentOrderNumber,
      productId: product.productId,
      user,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateWithdrawalAddress = async (userId: number, payload: any) => {
  return await User_Model.findOneAndUpdate(
    { userId: userId },
    { withdrawalAddressAndMethod: payload },
    { new: true }
  );
};
const getUserCompletedProducts = async (userId: number) => {
  const user = await User_Model.findOne({ userId }).lean();

  if (!user || !user.completedOrderProducts?.length) {
    return [];
  }

  // convert string ids → number ids
  const productIds = user?.completedOrderProducts.map((id) => Number(id));

  // fetch all unique products once (performance)
  const products = await ProductModel.find({
    productId: { $in: productIds },
  }).lean();
  console.log("products", products);

  // create lookup map
  const productMap = new Map<number, any>();
  products.forEach((p) => productMap.set(p.productId, p));

  // rebuild array WITH duplicates
  const result = productIds.map((id) => productMap.get(id)).filter(Boolean);

  return result;
};

export const user_services = {
  createUser,
  getAllUsers,

  getUserByUserId,
  updateUser,
  deleteUser,
  freezeUser,
  rechargeUserBalance,
  enableOrderRound,
  decreaseUserBalance,
  updateUserOrderAmountSlot,
  updateUserSelectedPackageAmount,
  updateQuantityOfOrders,
  updateAdminAssaignProduct,
  removeMysteryReward,
  addCheckInReward,
  purchaseOrder,
  confirmedPurchaseOrder,
  updateWithdrawalAddress,
  getUserCompletedProducts,
};
