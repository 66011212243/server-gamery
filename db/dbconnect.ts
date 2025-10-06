import mysql from "mysql2";


// สร้าง connection pool
export const connect = mysql.createPool({
  host: "202.28.34.210",
  user: "66011212243",
  password: "gamery",
  database: "db66011212243",
  port: 3309,
});

// ทดสอบ connection + query
connect.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Database connected successfully!");
    

  }
});
