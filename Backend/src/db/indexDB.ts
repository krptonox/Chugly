import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        const connectionInstance = await mongoose.connect(mongoURI);

        console.log(
            `MongoDB connected: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default  connectDB ;