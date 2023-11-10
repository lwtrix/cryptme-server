import express from 'express';
import { Admin } from '../models/admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import RequestValidationError from '../middleware/errors/request-validation-error.js';
import BadRequestError from '../middleware/errors/bad-request-error.js';

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
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
         throw new RequestValidationError(errors.array())
      }

      // Check if email is already in use
      const foundAdmin = await Admin.findOne({ email: req.body.email }).exec() 

      if(foundAdmin) {
        throw new BadRequestError('Email is already in use')
      }

      const newAdmin = await Admin.create({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      });

      res.status(201).send({ _id: newAdmin._id });
    } catch (error) {
      next(error)
    }
  }
);

authRouter.post(
  '/signin',
  async (req, res, next) => {
    try {
      // Check if account with given email exists
      const foundAdmin = await Admin.findOne({ email: req.body.email });

      if (!foundAdmin) {
        throw new BadRequestError(`There's no existing account with this email`)
      }

      // Check if password is correct
      const isPasswordCorrect = await bcrypt.compare(
        req.body.password,
        foundAdmin.password
      );

      if (!isPasswordCorrect) {
        throw new BadRequestError(`Email and password don't match`)
      }

      // Create a new jwt authorization token and send to client
      const token = jwt.sign({ _id: foundAdmin._id }, process.env.JWT_SECRET, {
        expiresIn: '5m',
      });

      res.json({ status: 'ok', token });
    } catch (error) {
      next(error)
    }
  }
);

export default authRouter;
