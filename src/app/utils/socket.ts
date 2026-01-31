import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User_Model } from "../modules/user/user.schema";
import { configs } from "../configs";

const onlineUsers = new Map<string, Set<string>>();

export const initSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 5000,
  });

  /* ======================
     JWT AUTH
  ====================== */
  io.use((socket: any, next) => {
    try {
      let token =
        socket.handshake.auth?.token || socket.handshake.headers?.token;

      if (!token) return next(new Error("Unauthorized"));

      const decoded: any = jwt.verify(token, configs.jwt.access_token_secret!);

      console.log("decoded JWT:", decoded);

      // ✅ FORCE STRING
      socket.userId = String(decoded.userId);

      if (!socket.userId) {
        return next(new Error("Invalid token payload"));
      }

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  /* ======================
     CONNECTION
  ====================== */
  io.on("connection", async (socket: any) => {
    const userId: string = socket.userId;
    console.log(`🟢 User entered site: ${userId}`);

    // FIRST CONNECTION → ONLINE
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());

      await User_Model.findOneAndUpdate(
        { userId: Number(userId) }, // 👈 number field
        {
          isOnline: true,
          lastLoginTime: new Date(),
        },
      );
    }

    onlineUsers.get(userId)!.add(socket.id);

    /* ======================
       DISCONNECT
    ====================== */
    socket.on("disconnect", async () => {
      console.log(`🔴 User left site: ${userId}`);

      const sockets = onlineUsers.get(userId);
      if (!sockets) return;

      sockets.delete(socket.id);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);

        await User_Model.findOneAndUpdate(
          { userId: Number(userId) },
          { isOnline: false },
        );
      }
    });
  });

  console.log("✅ Socket.IO ready");
};
