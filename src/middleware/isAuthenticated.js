import jwt from 'jsonwebtoken'

const isAuthenticated = (req, res, next) => {
  // Check if token was sent through headers
  const token = req.headers.authorization?.split(' ')[1]

  if(!token) {
    res.json({ status: 'error', message: 'You must provide an authentication token'})
    return
  }

  try {
    // Check if token is valid 
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user _id to req object
    req.user = payload._id

    next()
  } catch (error) {
    res.json({ status: 'error', message: 'Authentication token invalid or expired'})
  }
}

export default isAuthenticated