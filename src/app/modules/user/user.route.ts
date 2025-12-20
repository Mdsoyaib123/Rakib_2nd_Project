import { Router } from "express";
import { user_controllers } from "./user.controller";

const router = Router();

router.post("/", user_controllers.createUser);
router.get("/", user_controllers.getAllUsers);
router.get("/:id", user_controllers.getUserById);
router.get("/user-id/:userId", user_controllers.getUserByUserId);
router.patch("/:id", user_controllers.updateUser);
router.delete("/:id", user_controllers.deleteUser);

export const userRoute = router;
