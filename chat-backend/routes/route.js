import express from 'express'
import { getUsers, login, register,getMessages } from '../controller/userController.js'
import verifyToken from '../middleware/jwtMiddleware.js'
const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.get('/chat',verifyToken, getUsers)
router.get("/messages/:receiverId",verifyToken,getMessages); 

export default router