import messagedb from "./schema/messageSchema.js";

const onlineUsers = new Map();

function broadcastOnlineUsers(io) {
    const onlineUserIds = Array.from(onlineUsers.keys());
    io.emit("onlineUsers", onlineUserIds);
}

function setupChat(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        onlineUsers.set(socket.userId, socket.id);
        broadcastOnlineUsers(io);

        socket.on("privateMessage", async (data) => {
            const { receiverId, message } = data;

            if (!receiverId || !message?.trim()) return;

            try {
                const savedMessage = await messagedb.create({
                    sender: socket.userId,
                    receiver: receiverId,
                    message: message.trim()
                });

                const receiverSocketId = onlineUsers.get(receiverId);

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", savedMessage);
                }

                // Only emit back to sender if receiver is different
                socket.emit("receiveMessage", savedMessage);
            } catch (error) {
                console.error('[privateMessage] Failed to save message:', error);
                socket.emit("messageError", { message: "Failed to send message. Please try again." });
            }
        });

        socket.on("disconnect", () => {
            console.log('User disconnected:', socket.userId);
            onlineUsers.delete(socket.userId);
            broadcastOnlineUsers(io);
        });
    });
}

export default setupChat;