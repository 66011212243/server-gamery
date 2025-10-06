import http from "http";
import { app } from "./app";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is started on port ${PORT}`);
},).on("error", (error) => {
  console.error(error);
});