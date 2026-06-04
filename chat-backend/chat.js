import messagedb from "./schema/messageSchema.js";

const onlineUsers = new Map();
console.log("k",onlineUsers);

function setupChat(io) {
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);

        onlineUsers.set(socket.userId, socket.id);

        
        console.log("Connected:", socket.userId);

        socket.on("privateMessage", async (data) => {

            const { receiverId, message } = data; 

            const savedMessage = await messagedb.create({
                sender: socket.userId,
                receiver: receiverId,
                message
            });

            const receiverSocketId = onlineUsers.get(receiverId);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", savedMessage);
            }

            socket.emit("receiveMessage", savedMessage);
        });
        socket.on("disconnect", () => {
            onlineUsers.delete(socket.userId);
        });
    });
}

export default setupChat; 