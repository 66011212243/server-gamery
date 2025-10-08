
import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { router as usersRouter } from "./controller/users";

export const app = express();
import crypto from "crypto";

const secretKey = crypto.randomBytes(32).toString("hex");

app.use(express.json());

app.use(
  cors({
    origin: ['https://gamery-web.firebaseapp.com', 'https://gamery-web.web.app'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(session({
  secret: secretKey,  // เปลี่ยนเป็น key ของคุณเอง
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 1000 * 60 * 30,
      sameSite: 'none',       // ต้องตั้งค่า sameSite=None สำหรับ cross-site cookie
      secure: true
  } // 30 นาที
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.get("/", (req, res) => {
//   res.send("Server is running...");
// });

// ใช้ router
app.use("/", usersRouter);
