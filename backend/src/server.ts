import express from 'express'
import { connectDB } from './config/db.config';
import cors from 'cors'
import dotenv from "dotenv";
import morgan from 'morgan'

dotenv.config()

const app = express();
connectDB();

app.use(morgan('dev'))

const allowedOrigins=[
    "http://localhost:5173",
    
]

app.use(cors({origin:allowedOrigins,
    credentials:true}));
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("API Working")
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log("Server started")
})

