import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

app.get("/health", async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        port: port,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      error: "Database connection failed",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
