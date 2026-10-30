import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from the backend directory regardless of cwd
dotenv.config({ path: path.join(__dirname, ".env") });

import borrowRoutes from "./routes/borrowRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json());

// ==========================================
// STATIC UPLOADS
// ==========================================

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  "/uploads",
  express.static(uploadsDir)
);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "Community Resource Sharing System Backend Running"
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/messages", messageRoutes);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  console.log(
    "ROUTE NOT FOUND:",
    req.method,
    req.originalUrl
  );

  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    message: error.message || "Internal Server Error"
  });
});

// ==========================================
// MONGODB
// ==========================================

if (!process.env.MONGO_URI) {
  console.error("MongoDB Connection Failed: MONGO_URI is not defined in environment variables");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
      console.log("MongoDB Connection Failed");
      console.log(error.message);
    });
}

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});