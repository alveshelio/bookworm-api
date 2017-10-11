import jwt from 'jsonwebtoken';

import User from '../models/User';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  let token;

  if (header) token = header.split(' ')[1];
  
  if (token) {
    jwt.verify(token, process.env.JTW_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({ errors: { global: 'Invalid Token' } });
      } else {
        try {
          User.findOne({ email: decoded.email })
            .then(user => {
              if (user) {
                req.currentUser = user;
                next();  
              } else {
                res.status(401).json({ errors: { global: 'User not found' } });
              }
            });
        } catch (error) {
          res.status(401).json({ errors: { global: `Something went wrong. Error: ${error}` } });
        }
        
      }
    })
  } else {
    res.status(401).json({ errors: { global: 'No token' } });
  }
};

export default authenticate;