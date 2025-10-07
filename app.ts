// import express from "express";
// import cors from "cors";
// import { router as index } from "./controller/index";
// import { router as trip } from "./controller/trip";
// import { router as ping } from "./controller/ping";
// import { router as upload } from "./controller/upload";
// import bodyParser from "body-parser";

// export const app = express();

// app.use(
//     cors({
//         origin: "*",
//         methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );



// app.use(bodyParser.text());
// app.use(bodyParser.json());
// app.use("/", index);
// app.use("/trip", trip);
// app.use("/ping", ping);
// app.use("/upload", upload);
// app.use("/uploads", express.static("uploads"));

import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { router as usersRouter } from "./controller/users";

export const app = express();
import crypto from "crypto";

const secretKey = crypto.randomBytes(32).toString("hex");
const isProduction = process.env.NODE_ENV === 'production';
app.use(express.json());

app.use(
  cors({
    origin: 'http://localhost:4200',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

const sameSiteValue = isProduction ? 'none' : 'lax';
const sessionCookieOptions = {
    maxAge: 1000 * 60 * 30, // 30 นาที
    httpOnly: true,         // ป้องกัน JS ฝั่ง client แก้ cookie
    
    // **เงื่อนไขสำคัญสำหรับ localhost และ Render**
    secure: isProduction,  // 🔴 secure: true เมื่อเป็น Production (HTTPS), secure: false เมื่อเป็น Localhost (HTTP)
    sameSite: sameSiteValue as 'none' | 'lax'
};

app.use(session({
  secret: secretKey,  // เปลี่ยนเป็น key ของคุณเอง
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieOptions
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ใช้ router
app.use("/", usersRouter);
