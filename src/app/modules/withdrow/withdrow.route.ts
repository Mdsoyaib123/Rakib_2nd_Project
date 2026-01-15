import { Router } from "express";
import { WithdrawController } from "./withdrow.controller";

const router = Router();

router.post("/create-withdraw", WithdrawController.createWithdrawController);
router.patch("/accept/:withdrawId", WithdrawController.acceptWithdraw);
router.patch("/reject/:withdrawId", WithdrawController.rejectWithdraw);
router.get("/getAll", WithdrawController.getAllWithdraws);
router.get("/getSingleUserWithdraws/:userId", WithdrawController.getSingleUserWithdraws);
export const withdrawRoute = router;
