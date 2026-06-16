import express from 'express'
import { getUsers, login, register,getMessages,storeImages, getImages } from '../controller/userController.js'
import verifyToken from '../middleware/jwtMiddleware.js'
import upload from '../middleware/multerAuth.js'
const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.get('/chat',verifyToken, getUsers)
router.get("/messages/:receiverId",verifyToken,getMessages); 
router.post("/multer",upload.array("image", 4),storeImages); 
router.get("/images",getImages); 

export default router  