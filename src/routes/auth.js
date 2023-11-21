import express from 'express';
import { Admin } from '../models/admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import RequestValidationError from '../middleware/errors/request-validation-error.js';
import BadRequestError from '../middleware/errors/bad-request-error.js';
import { currentUser } from '../middleware/auth/currentUser.js';

const authRouter = express.Router();

authRouter.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('username')
      .trim()
      .isLength({ min: 3, max: 12 })
      .withMessage('Please enter a username between 3 and 12 characters'),
    body('password')
      .trim()
      .isLength({ min: 6, max: 18 })
      .withMessage('Please enter a password between 6 and 18 characters'),
    body('key')
      .equals(process.env.ADMIN_SIGNUP_KEY)
      .withMessage(
        'To create an admin account, you will need to enter the correct auth key'
      ),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
      }

      // Check if email or username are already in use
      const isEmailOrUsernameTaken = await Admin.findOne({
        $or: [{ email: req.body.email }, { username: req.body.username }],
      }).exec();

      if (isEmailOrUsernameTaken) {
        if (isEmailOrUsernameTaken.email === req.body.email) {
          throw new BadRequestError('Email is already in use');
        }

        if (isEmailOrUsernameTaken.username === req.body.username) {
          throw new BadRequestError('Sorry, username is taken');
        }
      }

      const newAdmin = await Admin.create({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      });

      res.status(201).send({ id: newAdmin._id });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Please enter a valid e-mail'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Please enter your password'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
      }

      // Check if account with given email exists
      const foundAdmin = await Admin.findOne({ email: req.body.email });

      if (!foundAdmin) {
        throw new BadRequestError(
          `There's no existing account with this email`
        );
      }

      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        foundAdmin.password
      );

      if (!isPasswordCorrect) {
        throw new BadRequestError(`Email and password don't match`);
      }

      // Create a new jwt authorization token and send to client
      const jwtToken = jwt.sign(
        {
          id: foundAdmin._id,
          email: foundAdmin.email,
          username: foundAdmin.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '5m',
        }
      );
      req.session.jwt_user = jwtToken;

      res
        .status(200)
        .send({
          id: foundAdmin.id,
          email: foundAdmin.email,
          username: foundAdmin.username,
        });
    } catch (error) {
      next(error);
    }
  }
);

authRouter.get('/currentUser', currentUser, (req, res) => {
  if(!req.currentUser) {
    return res.send({ currentUser: null })
  }

  res.send({ currentUser: req.currentUser })
})

export default authRouter;
