export type TWithdraw = {
  userId: number;
  amount: number;
  transactionStatus: string;
  superiorUserName: string;
  name: string;
  BankName: string;
  withdrawalAddress: string;
  withdrawalAmount: number;
  withdrawalFee: number;
  actualAmount: number;
  totalRechargeAmount: number;
  totalWithdrawalAmount: number;
  applicationTime: Date;
  processingTime: Date;
  reviewRemark: string;
};
