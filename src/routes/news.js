import express from "express";

const newsRouter = express.Router()

const news = [
  {
    id: 1,
    title: 'this is a title',
    content: 'news text content goes here',
    author: 'LwTrix',
    publishedOn: '20/09/1999'
  }
]

newsRouter.get('/', (req, res) => {
  res.send('ok')
})

export default newsRouter