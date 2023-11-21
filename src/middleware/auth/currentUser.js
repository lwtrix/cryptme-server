import jwt from 'jsonwebtoken';

export const currentUser = async (req, res, next) => {
  if (!req.session.jwt_user) {
    req.currentUser = null;
    next();
  }

  try {
    const payload = await jwt.verify(
      req.session.jwt_user,
      process.env.JWT_SECRET
    );

    req.currentUser = payload;
  } catch (error) {}

  next();
};
