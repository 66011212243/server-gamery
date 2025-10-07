import { Router } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { connect } from "../db/dbconnect";

export const router = Router();

// 1️ สร้างโฟลเดอร์ uploads
const uploadsDir = path.resolve(__dirname, "../uploads");
import fs from "fs";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 2️ ตั้งค่า Multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = uuidv4() + ext;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 64 * 1024 * 1024 }, // 64 MB
});

declare module 'express-session' {
    interface SessionData {
        user?: {
            user_id: number;
            username: string;
            status: number;
            email: string;
            image: string;
        };
    }
}


function isAuthenticated(req: any, res: any, next: any) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
}

function isAdmin(req: any, res: any, next: any) {
    if (req.session.user && req.session.user.role === "1") {
        next();
    } else {
        res.status(403).json({ message: "Forbidden" });
    }
}


//-------------------------------------------------------------------------------------


// GET /users


router.get("/users", (req, res) => {
    connect.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.post("/register", upload.single("image"), async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (!req.file) {
        return res.status(400).json({ error: "Profile image is required" });
    }
    const image = req.file.filename;

    try {
        connect.query("INSERT INTO users (username, email, password, image ) VALUES (?,?,?,?) ",
            [username, email, hashedPassword, image],
            (err, results, fields) => {
                if (err) {
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                return res.status(201).json({
                    message: "New user successfully created!",
                    profile: image
                });
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }

});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        connect.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, results) => {
                if (err) {
                    console.error("Error querying MySQL:", err);
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                // cast results เป็น array ของ rows
                const rows = results as any[];

                if (rows.length === 0) {
                    return res.status(401).json({ success: false, message: "Invalid email or password" });
                }

                const user = rows[0];

                // ตรวจสอบ password hash
                const isMatch = bcrypt.compareSync(password, user.password);

                if (!isMatch) {
                    return res.status(401).json({ success: false, message: "Invalid email or password" });
                }
                req.session.user = {
                    user_id: user.user_id,
                    username: user.username,
                    status: user.status,
                    email: user.email,
                    image: user.image
                };

                res.status(200).json(results)
            })
    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
})

router.post("/logout", (req, res) => {
    req.session.destroy(() => res.json({ message: "Logged out" }));
});

router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ profile: req.session.user });
});

// Route สำหรับ admin
router.get("/admin", isAuthenticated, isAdmin, (req, res) => {
    res.json({ message: "Welcome Admin!" });
});

router.put("/updateProfile/:id", upload.single("image"), (req, res) => {
    const { username } = req.body;
    const user_id = req.params.id;

    try {
        if (req.file) {
            const image = req.file.filename;
            connect.query("UPDATE users SET username = ?, image = ? WHERE user_id = ?",
                [username, image, user_id],
                (err, results, fields) => {
                    if (err) {
                        console.log("Error while inserting a user into the database", err);
                        return res.status(400).send();
                    }
                    return res.status(201).json({
                        message: "Update user successfully!",
                        profile: image
                    });
                }
            )
        }
        else {
            connect.query("UPDATE users SET username = ? WHERE user_id = ?",
                [username, user_id],
                (err, results, fields) => {
                    if (err) {
                        console.log("Error while inserting a user into the database", err);
                        return res.status(400).send();
                    }
                    return res.status(201).json({
                        message: "Update user successfully!",
                    });
                }
            )
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }
})

router.get("/user/:id", (req, res) => {
    const user_id = req.params.id;
    try {
        connect.query("SELECT * FROM users WHERE user_id = ?",
            [user_id],
            (err, results, fields) => {
                if (err) {
                    console.log("Error while inserting a user into the database", err);
                    return res.status(400).send();
                }
                res.json(results);
            }
        )
    } catch (error) {
        console.log(error);
        return res.status(500).send();
    }

})
