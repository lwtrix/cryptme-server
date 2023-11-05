import express from "express"

const port = process.env.PORT || 4000 
const app = express()

app.use(express.json())

const news = [
  {
    id: 1,
    title: 'this is a title',
    content: 'news text content goes here',
    author: 'LwTrix',
    publishedOn: '20/09/1999'
  }
]

app.get('/news', (req, res) => {
  res.send(news)
})

app.listen(port, () => {
  console.log(`Live on port ${port}`)
})