import express from 'express';
import NotFoundError from '../middleware/errors/not-found-error.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { Admin } from '../models/admin.js';
import { Article } from '../models/article.js';
import { body, validationResult } from 'express-validator';
import RequestValidationError from '../middleware/errors/request-validation-error.js';

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
        throw new NotFoundError(
          `Articles from author '${req.query.author}' not found`
        );
      }
      // Add author _id to query object if author exists
      query.author = foundAuthor._id;
    }

    // Fetch articles with query object
    const articlesFound = await Article.find(query)
      .populate('author', 'username')
      .exec();

    res.status(200).send({ articles: articlesFound });
  } catch (error) {
    next(error);
  }
});

articlesRouter.post(
  '/',
  isAuthenticated,
  [
    body('title')
      .isLength({ min: 3, max: 36 })
      .withMessage('Title must be between 3 and 36 characters long'),
    body('paragraphs')
      .isArray({ min: 1 })
      .withMessage('At least one paragraph is required to create a new article')
      .isLength({ min: 28, max: 300 })
      .withMessage('Paragraphs must be between 28 and 300 characters long'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
      }

      const newArticle = await Article.create({
        title: req.body.title,
        paragraphs: req.body.paragraphs,
        author: req.user,
        publishedAt: Date.now(),
      });

      res.status(201).send({ article: newArticle });
    } catch (error) {
      next(error);
    }
  }
);

export default articlesRouter;
