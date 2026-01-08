import { User_Model } from "../modules/user/user.schema";

const generateInvitationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generateUniqueInvitationCode = async (): Promise<string> => {
  let code: string;
  let exists = true;

  while (exists) {
    code = generateInvitationCode();
    const user = await User_Model.findOne({ invitationCode: code });
    exists = !!user;
  }

  return code!;
};
