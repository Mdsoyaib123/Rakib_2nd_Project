export type TWithdraw = {
  userId: number;
  amount: number;

  transactionStatus: "PENDING" | "APPROVED" | "REJECTED";

  superiorUserName?: string;
  name: string;

  withdrawMethod: "BankTransfer" | "MobileBanking";

  // Bank Transfer
  bankName?: string;
  bankAccountNumber?: number;
  branchName?: string;
  district?: string;

  // Mobile Banking
  mobileBankingName?: string;
  mobileBankingAccountNumber?: number;
  mobileUserDistrict?: string;


  withdrawalAmount: number;
  totalRechargeAmount?: number;
  totalWithdrawalAmount?: number;

  applicationTime: Date;
  processingTime?: Date;
  reviewRemark?: string;

};
