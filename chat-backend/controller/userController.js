import messagedb from "../schema/messageSchema.js";
import userdb from "../schema/userSchema.js";
import jwt from 'jsonwebtoken'


const JWT_SECRECT = "shm123";

const register = async (req, res) => {
    console.log("reached here");

    try {
        const { name, email, password } = req.body
        console.log(name, email, password);


        const Existing = await userdb.findOne({ email })
        if (Existing) {
            console.log(Existing);
            return res.status(400).json({ message: 'user already exists' })
        }

        const userCreated = await userdb.create({
            name, email, password
        })
        res.status(200).json({ message: 'data created', data: userCreated })
    } catch (error) {
        console.log(error);

    }
}


const login = async (req, res) => {
    const { email, password } = req.body
    console.log("reached", email, password);
    const user = await userdb.findOne({ email })
    console.log("user found", user);
    if(!user){
        return res.status(401).json({message:'user not found'})
    }
    if(user.password !== password){
        return res.status(401).json({message:'invalid password'})
    }
    const token = jwt.sign(

        { userId: user._id },
        JWT_SECRECT, 
        { expiresIn: "1h" }
    )
    res.json({token,message:"login succesfull",user:{id:user._id,name:user.name,email:user.email}})

} 

const getUsers = async(req,res)=>{
    const users =  await userdb.find()
    console.log(users);
    
    res.status(200).json({message:"users found",users})
}

const getMessages = async(req,res)=>{
  console.log("coming");
  
    const senderId = req.user.userId;
    const receiverId = req.params.receiverId;

    const messages = await messagedb.find({
        $or:[
            {
                sender:senderId,
                receiver:receiverId
            }, 
            {
                sender:receiverId,
                receiver:senderId
            }
        ]
    }).sort({createdAt:1});

    res.json(messages);
};



export { register, login, getUsers,getMessages }