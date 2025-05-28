import "dotenv/config";
import express from "express";
import type { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import studentRoute from "./routes/studentRoutes";
const app: Application = express();
const port = process.env.PORT || 8080;
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get(["/","/health"], async (req: Request, res: Response) => {
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

app.use("/api/student", studentRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    res.status(400).json({
      success: false,
      message:
        "Invalid JSON format: check for unquoted strings or trailing commas.",
    });
    return;
  }
  next(err);
});

app.listen(port, () => {
  console.log(`Student crud app listening on port ${port}`);
});
