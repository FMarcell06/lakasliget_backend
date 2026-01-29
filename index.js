import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cloudinary from "./cloudinaryConfig.js"

dotenv.config()

const app=express()
//app.use(cors({ origin: "http://localhost:5173" }))
//app.use(cors({ origin:"https://fm06-recipe-backend.vercel.app/api"}))
app.use(cors())

const port=process.env.PORT|| 5050
app.listen(port,()=>console.log(`Server listening on port ${port}`))