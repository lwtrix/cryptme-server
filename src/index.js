import express from "express"
import 'express-async-errors'
import cors from 'cors'
import mongoose from "mongoose"
import cookieSession from "cookie-session"

import errorHandler from "./middleware/errors/error-handler.js"
import articlesRouter from "./routes/articles.js"
import authRouter from "./routes/auth.js"

const port = process.env.PORT || 4000 
const server = express()

server.set('trust proxy', true)
server.use(cors())
server.use(express.json())
server.use(cookieSession({
  httpOnly: true,
  signed: false
}))

server.use('/auth', authRouter)
server.use('/articles', articlesRouter)

server.use(errorHandler)

// Database connection and server listening

mongoose.connect(process.env.MONGO_URI)

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to DB')

  server.listen(port, () => {
    console.log(`Live on port ${port}`)
  })
})

