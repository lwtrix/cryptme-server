import express from "express"
import mongoose from "mongoose"
import articlesRouter from "./routes/articles.js"
import authRouter from "./routes/auth.js"

const port = process.env.PORT || 4000 
const server = express()

server.use(express.json())

server.use('/auth', authRouter)
server.use('/articles', articlesRouter)


// Database connection and server listening

mongoose.connect(process.env.MONGO_URI)

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to DB')

  server.listen(port, () => {
    console.log(`Live on port ${port}`)
  })
})

