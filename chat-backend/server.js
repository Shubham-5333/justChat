import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import db from './db/db.js';
import router from './routes/route.js';
import cors from 'cors'
import setupChat from './chat.js'
import socketAuth from './middleware/socketAuth.js';

const app = express()
const port = 3000

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
})

io.use(socketAuth)
setupChat(io)
db()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', router)

server.listen(port, () => console.log(`Server Running on http://localhost:${port}`));
