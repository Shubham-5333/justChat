import express from 'express'
const app = express()
import http, { get } from 'http'
import { Server } from 'socket.io'
import db from './db/db.js';
import router from './routes/route.js';
import cors from 'cors'
import setupChat from './chat.js'
import socketAuth from './middleware/socketAuth.js';

const port = 3000

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
})
io.use(socketAuth)
// io.use(socketAuth)
setupChat(io)
db()
app.use(cors())
app.use(express.json())
app.use('/api', router)


server.listen(port, () => console.log(`Server Running on http://localhost:${port}`));

