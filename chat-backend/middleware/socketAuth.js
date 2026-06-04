import jwt from "jsonwebtoken";

const JWT_SECRET = "shm123";

const socketAuth = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        socket.userId = decoded.userId;

        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
};

export default socketAuth;