import { Router } from "express";
import { user_controllers } from "./user.controller";

const router = Router();

router.post("/create", user_controllers.createUser);
router.get("/getAll", user_controllers.getAllUsers);
router.get("/getSingle/:userId", user_controllers.getUserByUserId);
router.patch("/update/:userId", user_controllers.updateUser);
router.delete("/delete/:userId", user_controllers.deleteUser);
router.put("/freeze/:userId", user_controllers.freezeUser);
router.put("/recharge/:userId", user_controllers.rechargeUserBalance);
router.put("/admin-order-enable-round/:userId", user_controllers.enableOrderRound);
router.put("/decrease/:userId", user_controllers.decreaseUserBalance);
// user.route.ts
router.patch(
  "/update-order-amount/:userId",
  user_controllers.updateUserOrderAmountSlot
);
router.patch(
  "/update-selected-package-amount/:userId",
  user_controllers.updateUserSelectedPackageAmount
);
router.patch(
  "/update-quantity-of-orders/:userId",
  user_controllers.updateQuantityOfOrders
);
router.patch(
  "/update-admin-assigned-product/:userId",
  user_controllers.updateAdminAssaignProduct
);
router.get("/purchase-order/:userId", user_controllers.purchaseOrder);
router.patch(
  "/confirmed-purchase-order/:userId/:productId",
  user_controllers.confirmedPurchaseOrder
);
router.patch(
  "/update-withdrawal-address/:userId",
  user_controllers.updateWithdrawalAddress
);

export const userRoute = router;
