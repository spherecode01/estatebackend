import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"; // Import mongoose for database connection
import authRoute from "./routes/auth.route.js";
import postRoute from "./routes/post.route.js";
import testRoute from "./routes/test.route.js";
import userRoute from "./routes/user.route.js";
import chatRoute from "./routes/chat.route.js";
import messageRoute from "./routes/message.route.js";
import { Server } from "socket.io"; // Import Server from socket.io

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/api/test", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/test", testRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

// Connect to MongoDB database
mongoose.connect(process.env.DATABASE_URL, {
  //useNewUrlParser: true,
 // useUnifiedTopology: true,
 // useCreateIndex: true,
})
.then(() => {
  console.log("Connected to database");
})
.catch((error) => {
  console.error("Database connection error:", error);
});

// Integrate Socket.IO with Express server
const server = app.listen(8800, () => {
  console.log("Server is running on port 8800");
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://estatefrontend.onrender.com", // Specify the origin of the client
  },
});

let onlineUsers = []; // Store online users

const addUser = (userId, socketId) => {
  const userExists = onlineUsers.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// Handle Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a new user connects
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  // When a user sends a message
  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    } else {
      console.log("User not online");
    }
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    removeUser(socket.id);
  });
});
