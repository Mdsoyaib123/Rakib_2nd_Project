import mongoose from "mongoose";
import { User_Model } from "../user/user.schema";
import { Withdraw_Model } from "./withdrow.model";
import { TWithdraw } from "./withdrow.interface";

type CreateWithdrawPayload = {
  userId: number;
  amount: number;
};

const createWithdrawService = async (payload: CreateWithdrawPayload) => {
  const { userId, amount } = payload;

  const user = await User_Model.findOne({ userId });

  if (!user) throw new Error("User not found");
  if (user.freezeUser) throw new Error("User account is frozen");
  if (user?.freezeWithdraw)
    throw new Error("Your withdrawal is frozen , please contact admin support");

  if (user?.orderRound?.round === "trial" && user?.quantityOfOrders !== 0) {
    throw new Error("You can't withdraw before complete trial orders");
  }

  if (user?.orderRound?.round === "round_one" && user?.userDiopsitType === "trial") {
    throw new Error("You can't withdraw before complete two round orders");
  }

  if (user?.orderRound?.round === "round_two" && user?.quantityOfOrders !== 0) {
    throw new Error("You can't withdraw before complete all orders");
  }

  const withdrawal = user.withdrawalAddressAndMethod;

  if (!withdrawal || !withdrawal.withdrawMethod) {
    throw new Error("Please add withdrawal address first");
  }

  if (
    withdrawal.withdrawMethod === "BankTransfer" &&
    (!withdrawal.bankName || !withdrawal.bankAccountNumber)
  ) {
    throw new Error("Please add bank withdrawal details");
  }

  if (
    withdrawal.withdrawMethod === "MobileBanking" &&
    (!withdrawal.mobileBankingName || !withdrawal.mobileBankingAccountNumber)
  ) {
    throw new Error("Please add mobile banking withdrawal details");
  }

  if (amount <= 0) throw new Error("Invalid withdrawal amount");

  if (user.userBalance < amount) throw new Error("Insufficient balance");

  if (amount < 500) {
    throw new Error("Minimum withdrawal amount is 500");
  }

  const withdrawalMethod = user.withdrawalAddressAndMethod;

  if (!withdrawalMethod) {
    throw new Error("Withdrawal address not set");
  }

  const withdrawPayload: Partial<TWithdraw> = {
    userId: user.userId,
    amount,
    name: user.name || "N/A",
    superiorUserName: user.superiorUserName || "",

    withdrawMethod: withdrawalMethod.withdrawMethod,

    withdrawalAmount: amount,
    totalRechargeAmount: user.memberTotalRecharge,
    totalWithdrawalAmount: user.memberTotalWithdrawal,

    transactionStatus: "PENDING",
    applicationTime: new Date(),
  };

  // Bank Transfer
  if (withdrawalMethod.withdrawMethod === "BankTransfer") {
    withdrawPayload.bankName = withdrawalMethod.bankName;
    withdrawPayload.bankAccountNumber =
      withdrawalMethod?.bankAccountNumber as number;
    withdrawPayload.branchName = withdrawalMethod.branchName;
    withdrawPayload.district = withdrawalMethod.district;
  }

  // Mobile Banking
  if (withdrawalMethod.withdrawMethod === "MobileBanking") {
    withdrawPayload.mobileBankingName = withdrawalMethod.mobileBankingName;
    withdrawPayload.mobileBankingAccountNumber =
      withdrawalMethod?.mobileBankingAccountNumber as number;
  }

  const withdraw = await Withdraw_Model.create(withdrawPayload);

  // ✅ Freeze user balance
  await User_Model.updateOne(
    { userId },
    {
      $inc: {
        userBalance: -amount,
        memberTotalWithdrawal: +amount,
      },
    },
  );

  return withdraw;
};
const acceptWithdrawService = async (withdrawId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await Withdraw_Model.findById(withdrawId).session(session);
    if (!withdraw) throw new Error("Withdrawal not found");

    const user = await User_Model.findOne({ userId: withdraw.userId }).session(
      session,
    );

    if (withdraw.transactionStatus !== "PENDING")
      throw new Error("This Withdrawal request already processed");

    // ✅ Update withdraw status
    withdraw.transactionStatus = "APPROVED";
    withdraw.processingTime = new Date();
    await withdraw.save({ session });

    // ✅ Deduct frozen amount permanently
    await User_Model.updateOne(
      { userId: withdraw.userId },
      {
        $inc: {}, // keeping your logic as-is
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return withdraw;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const rejectWithdrawService = async (
  withdrawId: string,
  reviewRemark?: string,
) => {
  const withdraw = await Withdraw_Model.findById(withdrawId);

  if (!withdraw) throw new Error("Withdrawal not found");
  if (withdraw.transactionStatus !== "PENDING")
    throw new Error("This Withdrawal request already processed");

  // ✅ Update withdraw status
  withdraw.transactionStatus = "REJECTED";
  withdraw.processingTime = new Date();
  withdraw.reviewRemark = reviewRemark || "Rejected by admin";
  await withdraw.save();

  // 🔄 Refund frozen balance
  await User_Model.updateOne(
    { userId: withdraw.userId },
    {
      $inc: {
        userBalance: withdraw.withdrawalAmount,
        memberTotalWithdrawal: -withdraw.withdrawalAmount,
      },
    },
  );

  return withdraw;
};

const getAllWithdrawsService = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Withdraw_Model.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Withdraw_Model.countDocuments(),
  ]);

  return {
    data,
  };
};

const getSingleUserWithdraws = async (userId: number, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Withdraw_Model.find({ userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Withdraw_Model.countDocuments({ userId }),
  ]);

  return {
    data,
  };
};

export const WithdrawService = {
  createWithdrawService,
  acceptWithdrawService,
  rejectWithdrawService,
  getAllWithdrawsService,
  getSingleUserWithdraws,
};
