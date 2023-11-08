import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { Admin } from '../models/admin.js';
import { Article } from '../models/article.js';

const articlesRouter = express.Router();

articlesRouter.get('/', isAuthenticated, async (req, res, next) => {
  try {
    const query = {};

    // Check if a title query exists and add it to query object
    if (req.query.title) {
      query.title = new RegExp(req.query.title, 'i');
    }

    // Check if an author query exists
    if (req.query.author) {
      // Check if author exists
      const foundAuthor = await Admin.findOne({
        username: new RegExp(req.query.author, 'i'),
      }).exec();

      if (!foundAuthor) {
        res.json({
          status: 'error',
          message: `Author '${req.query.author}' not found`,
        });
        return;
      }
      // Add author _id to query object if author exists
      query.author = foundAuthor._id;
    }

    // Fetch articles with query object
    const articlesFound = await Article.find(query)
      .populate('author', 'username')
      .exec();

    res.json({ status: 'ok', articles: articlesFound });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: error });
  }
});

articlesRouter.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const newArticle = await Article.create({
      title: req.body.title,
      paragraphs: req.body.paragraphs,
      author: req.body.author,
      publishedAt: Date.now(),
    });

    res.json({ status: 'ok', newArticle });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: error });
  }
});

export default articlesRouter;
