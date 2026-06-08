import messagedb from "../schema/messageSchema.js";
import userdb from "../schema/userSchema.js";
import jwt from 'jsonwebtoken'

const JWT_SECRET = "shm123";

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const existing = await userdb.findOne({ email })
        if (existing) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const userCreated = await userdb.create({ name, email, password })
        res.status(201).json({ message: 'Account created successfully', data: { id: userCreated._id, name: userCreated.name, email: userCreated.email } })
    } catch (error) {
        console.error('[register]', error);
        res.status(500).json({ message: 'Server error during registration' })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await userdb.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        )

        res.json({
            token,
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (error) {
        console.error('[login]', error);
        res.status(500).json({ message: 'Server error during login' })
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await userdb.find({}, { password: 0 })
        res.status(200).json({ message: "Users found", users })
    } catch (error) {
        console.error('[getUsers]', error);
        res.status(500).json({ message: 'Server error fetching users' })
    }
}

const getMessages = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const receiverId = req.params.receiverId;

        const messages = await messagedb.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('[getMessages]', error);
        res.status(500).json({ message: 'Server error fetching messages' })
    }
};

export { register, login, getUsers, getMessages }