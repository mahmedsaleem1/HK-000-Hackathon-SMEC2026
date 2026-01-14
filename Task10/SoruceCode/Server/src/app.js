import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// const app = express();
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import adminRouter from "./routes/admin.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import itemRouter from "./routes/item.routes.js";
import swapRequestRouter from "./routes/swapRequest.routes.js";
import reviewRouter from "./routes/review.routes.js";

app.use("/api/v/payment", paymentRoutes);
app.use("/api/v/order", orderRouter);
app.use("/webhook", webhookRoutes);
app.use("/api/v/users", userRouter);
app.use("/api/v/products", productRouter);
app.use("/api/v/orders", orderRouter);
app.use("/api/v/admins", adminRouter);

// Barter/Rental swap routes
app.use("/api/v/items", itemRouter);
app.use("/api/v/swap-requests", swapRequestRouter);
app.use("/api/v/reviews", reviewRouter);

// Global error handler - must be after all routes
app.use((err, req, res, next) => {
  // Only log errors that are not marked as silent (e.g., not token expiration)
  if (!err.silent && err.statusCode !== 401) {
    console.error(`Error: ${err.message}`);
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode,
    message: err.message || "Internal Server Error",
    success: false,
    errors: err.errors || [],
  });
});

export { app };

