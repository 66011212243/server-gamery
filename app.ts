
import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { router as usersRouter } from "./controller/users";

export const app = express();
import crypto from "crypto";

const secretKey = process.env.SESSION_SECRET || "mySuperSecretKey";

app.use(express.json());

// app.set('trust proxy', 1);  // ✅ จำเป็นบน Render/Cloud Hosting

app.use(
  cors({
    origin: ['https://gamery-web.firebaseapp.com', 'https://gamery-web.web.app','http://localhost:4200'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(session({
  secret: secretKey, 
  resave: false,
  saveUninitialized: false,
  cookie: {
      maxAge: 1000 * 60 * 30,
      // sameSite: 'none',       
      // secure: true
  } // 30 นาที
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.get("/", (req, res) => {
//   res.send("Server is running...");
// });

// ใช้ router
app.use("/", usersRouter);
