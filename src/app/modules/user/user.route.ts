import { Router } from "express";
import { user_controllers } from "./user.controller";

const router = Router();

router.post("/create", user_controllers.createUser);
router.get("/getAll", user_controllers.getAllUsers);
router.get("/getSingle/:id", user_controllers.getUserByUserId);
router.patch("/update/:id", user_controllers.updateUser);
router.delete("/delete/:id", user_controllers.deleteUser);

export const userRoute = router;
