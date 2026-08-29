import app from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        environment: env.NODE_ENV,
      },
      "Server started",
    );
  });
};

void startServer();