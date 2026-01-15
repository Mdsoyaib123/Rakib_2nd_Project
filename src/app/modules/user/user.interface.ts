export type TUser = {
  name?: string;
  phoneNumber: string;
  email: string;
  role: "user" | "admin";
  password: string;
  confirmPassword: string;
  invitationCode: string;
  userId: number;
  userDiopsitType: "trial" | "deposit";
  freezeUser?: boolean;
  superiorUserId?: string;
  superiorUserName?: string;
  quantityOfOrders?: number;
  orderRound?: {
    round: "trial" | "round_one" | "round_two";
    status: boolean;
  };

  withdrawalAddressAndMethod?: {
    BankName: string;
    withdrawalAddress: string;
  };
  withdrowalValidOddNumber?: number;
  actualCompletedNumberToday?: number;
  userBalance: number;
  dailyProfit?: number;
  memberTotalRecharge?: number;
  memberTotalWithdrawal?: number;
  userOrderFreezingAmount?: number;
  amountFrozedInWithdrawal?: number;
  whetherOnline?: boolean;
  mobilePhoneAreaCode?: string;
  lastLoginIp: string;
  lastLoginTime: Date;
  userType: string;
  userOrderAmountSlot: number[];
  userSelectedPackage?: number;
  completedOrdersCount?: number;
  adminAssaignProductsOrRewards?: {
    productId?: number;
    orderNumber?: number;
    mysterybox?: {
      method: "cash" | "12x";
      amount: string;
    };
  }[];
  mysteryReward?: Number;
  dailyCheckInReward: {
    lastCheckInDate: Date | null;
    totalCheckIns: number;
  };

  completedOrderProducts?: string[];
  orderCountForCheckIn?: number;
};
