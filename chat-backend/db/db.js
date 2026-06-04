import mongoose from "mongoose";
const MONGO_URI = 'mongodb://shubhampatil5333_db_user:lNPGAElY3sqo6fz2@ac-be7txlq-shard-00-00.umjjpha.mongodb.net:27017,ac-be7txlq-shard-00-01.umjjpha.mongodb.net:27017,ac-be7txlq-shard-00-02.umjjpha.mongodb.net:27017/?ssl=true&replicaSet=atlas-xkjxtp-shard-0&authSource=admin&appName=Cluster0'
const connectDb = async() => {
    try {
        const db = await mongoose.connect(MONGO_URI)
        console.log("mongodb connected", db.connection.host);
    } catch (error) {
        console.log(error);
    }
}
  

export default connectDb 