import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        images:{
            type:Array,
            required:true
        }
    }
)

const productdb = mongoose.model('products',productSchema)
export default productdb