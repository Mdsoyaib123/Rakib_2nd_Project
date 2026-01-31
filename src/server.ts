import http from "http";
import mongoose from "mongoose";
import app from "./app";
import { configs } from "./app/configs";

import { User_Model } from "./app/modules/user/user.schema";
import { initSocket } from "./app/utils/socket";

async function startServer() {
  await mongoose.connect(configs.db_url!);

  // Prevent ghost online users after restart
  await User_Model.updateMany({}, { isOnline: false });

  const server = http.createServer(app);
  initSocket(server);

  server.listen(configs.port, () => {
    console.log(`🚀 Server running on port ${configs.port}`);
  });
}

startServer();
