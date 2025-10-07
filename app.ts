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

app.use(express.json());

app.use(
  cors({
    origin: ['http://localhost:4200', '*'],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true
  })
);

app.use(session({
  secret: secretKey,  // เปลี่ยนเป็น key ของคุณเอง
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30

   } // 30 นาที
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ใช้ router
app.use("/", usersRouter);
