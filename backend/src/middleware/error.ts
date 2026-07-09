import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`Error processing request ${req.method} ${req.url}`, err);

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
