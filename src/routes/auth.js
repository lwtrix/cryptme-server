import express from 'express';
import { Admin } from '../models/admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const authRouter = express.Router();

authRouter.post('/signup', async (req, res, next) => {
  try {
    const newAdmin = await Admin.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    res.json({ status: 'ok', newAdmin });
  } catch (error) {
    console.log(error);
    res.json({ status: 'error', message: error });
  }
});

authRouter.post('/signin', async (req, res, next) => {
  try {
    // Check if account with given email exists

    const foundAdmin = await Admin.findOne({ email: req.body.email });

    if (!foundAdmin) {
      res.json({
        status: 'error',
        message: `There's no existing account with this email`,
      });
      return;
    }

    // Check if password is correct

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      foundAdmin.password
    );

    if (!isPasswordCorrect) {
      res.json({ status: 'error', message: 'Email and password do not match' });
      return;
    }

    // Create a new jwt authorization token and send to client

    const token = jwt.sign({ _id: foundAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    res.json({ status: 'ok', token });
  } catch (error) {
    res.json({ status: 'error', message: error });
  }
});

export default authRouter;
