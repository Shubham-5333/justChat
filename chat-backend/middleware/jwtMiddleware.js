import jwt from 'jsonwebtoken'
const JWT_SECRECT = 'shm123'

const verifyToken = (req,res,next)=>{
    const authHeader = req.headers.authorization
    // console.log("auth",authHeader.token);
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token,JWT_SECRECT)
        req.user = decoded
        next()
    } catch (error) {
        console.log(error);
        
    }
    

}

export default verifyToken