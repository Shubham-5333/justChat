import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import db from './db/db.js';
import router from './routes/route.js';
import cors from 'cors'
import setupChat from './chat.js'
import socketAuth from './middleware/socketAuth.js';
import path from 'path';
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
app.use(express.urlencoded({extended:true}))
// app.use("/images",express.static(path.resolve(__dirname, "images")));
app.use("/images", express.static(path.join(__dirname, 'Assets',"images")));

app.use('/api', router)

server.listen(port, () => console.log(`Server Running on http://localhost:${port}`));
