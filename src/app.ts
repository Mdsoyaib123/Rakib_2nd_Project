import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import globalErrorHandler from "./app/middlewares/global_error_handler";
import notFound from "./app/middlewares/not_found_api";
import appRouter from "./routes";
import { User_Model } from "./app/modules/user/user.schema";
import { configs } from "./app/configs";
import bcrypt from "bcrypt";
import cron from "node-cron";

// define app
const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://dainty-semifreddo-2cf1f0.netlify.app",
      "https://rainbow-sopapillas-9e5e0e.netlify.app",
      "https://juwelo-dashboard.vercel.app",
      "https://juwelo-client.vercel.app",
      "https://juweloonline.com",
      "https://cozy-muffin-610776.netlify.app",
      "*",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.raw());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", appRouter);

// stating point
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running successful !!",
    data: null,
  });
});

export const createDefaultSuperAdmin = async () => {
  try {
    const existingAdmin = await User_Model.findOne({
      phoneNumber: "01700000000",
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        "admin@123",
        Number(configs.bcrypt_salt_rounds)
      );

      await User_Model.create({
        email: "admin@gmail.com",
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: "admin",
        phoneNumber: "01700000000",
        name: "Admin",
        invitationCode: "adminCode",
        freezeUser: false,
      });
      console.log("✅ Default Admin created.");
    } else {
      console.log("ℹ️ Admin already exists.");
    }
  } catch (error) {
    console.log("❌ Failed to create default admin:", error);
  }
};

createDefaultSuperAdmin();

// Runs every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  try {
    await User_Model.updateMany({}, { $set: { dailyProfit: 0 } });

    console.log("✅ Daily profit reset successfully");
  } catch (error) {
    console.error("❌ Daily profit reset failed:", error);
  }
});

// global error handler
app.use(globalErrorHandler);
app.use(notFound);

// export app
export default app;
