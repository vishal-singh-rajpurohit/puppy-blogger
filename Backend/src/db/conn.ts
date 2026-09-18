import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export const conn = async () => {
    try {
        const mongoUrl = process.env.ATLAS_LINK;
        console.log(mongoUrl)
        if (!mongoUrl) {
            throw new Error("ATLAS_LINK environment variable is not defined");
        }

        await mongoose.connect(mongoUrl);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error connecting to the database: " + error.message);
        }

        throw new Error("Unknown database connection error");
    }
};