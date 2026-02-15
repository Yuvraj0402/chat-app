const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");
const conversationRoutes = require("./routes/conversations");
const uploadRoutes = require("./routes/upload");
const filesRoutes = require("./routes/files");
const socket = require("socket.io");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connection Successfull");
    })
    .catch((err) => {
        console.log(err.message);
    });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/files", filesRoutes);

const server = app.listen(process.env.PORT, () =>
    console.log(`Server started on Port ${process.env.PORT}`)
);

const io = socket(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"], // allow both common react ports
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log("Added user:", userId);

        // Broadcast to all clients that this user is now online
        socket.broadcast.emit("user-online", userId);

        // Send list of online users to the newly connected user
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit("online-users", onlineUserIds);
    });

    socket.on("send-msg", async (data) => {
        // data: { to, from, msg: { content, type, ... } }

        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            // If user is online, emit msg-recieve
            socket.to(sendUserSocket).emit("msg-recieve", data);

            // Notify sender that message is delivered (because user is online)
            socket.emit("message-delivered", {
                messageId: data._id || data.id,
                conversationId: data.conversationId, // Ensure this is passed in data
                userId: data.to
            });

            // Update status in DB to delivered
            // Note: In real app we might wait for ack from client, but here we assume online = delivered
            try {
                const Message = require("./models/Message");
                // We need message ID here. The data usually comes from sendMessage which returns the DB object.
                if (data._id) {
                    await Message.findByIdAndUpdate(data._id, { status: 'delivered' });
                }
            } catch (e) { console.log("Error updating delivered status", e) }

        }
    });

    // Explicit mark-delivered event from client (if we want to be sure it reached the client)
    socket.on("mark-delivered", async (data) => {
        try {
            const { conversationId, messageIds, userId } = data;
            socket.in(conversationId).emit("messages-delivered", {
                conversationId,
                messageIds,
                userId
            });

            const Message = require("./models/Message");
            await Message.updateMany(
                { _id: { $in: messageIds }, status: 'sent' }, // Only update if currently sent
                { $set: { status: 'delivered' } }
            );
        } catch (error) {
            console.error("Error marking messages as delivered:", error);
        }
    });

    // Also join conversation rooms for easier broadcasting?
    socket.on("join-chat", (room) => {
        socket.join(room);
        console.log("User Initialized Chat: " + room);
    });

    socket.on("new-message", (newMessageReceived) => {
        // Assuming conversationId is the room
        var conversation = newMessageReceived.conversationId;
        if (!conversation) return console.log("conversationId param not sent with message");

        // Broadcast to everyone in the room except sender
        socket.in(conversation).emit("message-received", newMessageReceived);
    });

    // Typing indicators
    socket.on("typing", (data) => {
        // data: { conversationId, userId, username }
        socket.in(data.conversationId).emit("user-typing", data);
    });

    socket.on("stop-typing", (data) => {
        // data: { conversationId, userId }
        socket.in(data.conversationId).emit("user-stopped-typing", data);
    });

    // Read Receipts
    socket.on("mark-read", async (data) => {
        // data: { conversationId, userId, messageIds }
        try {
            const { conversationId, userId, messageIds } = data;

            // Emit to sender that messages were read
            socket.in(conversationId).emit("messages-read", {
                conversationId,
                userId,
                messageIds,
                readAt: new Date()
            });

            // Also emit delivered if it wasn't already (just in case)
            socket.in(conversationId).emit("messages-delivered", {
                conversationId,
                messageIds,
                userId
            });

            const Message = require("./models/Message");
            await Message.updateMany(
                { _id: { $in: messageIds }, "readBy.user": { $ne: userId } },
                {
                    $addToSet: { readBy: { user: userId, readAt: new Date() } },
                    $set: { status: 'read' }
                }
            );

        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);

        // Find and remove user from onlineUsers
        let disconnectedUserId = null;
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                onlineUsers.delete(userId);
                break;
            }
        }

        // Broadcast to all clients that this user is now offline
        if (disconnectedUserId) {
            socket.broadcast.emit("user-offline", disconnectedUserId);
        }
    });
});
