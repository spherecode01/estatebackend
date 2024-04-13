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

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
