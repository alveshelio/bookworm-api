import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';

const router = express.Router();

router.post('/', (req, res) => {
  const { credentials } = req.body;
  User.findOne({ email: credentials.email })
    .then(user => {
      if (user && user.isValidPassword(credentials.password)) {
        res.status(200).json({ user: user.toAuthJSON() });
      } else {
        res.json({ errors: { global: 'Invalid credentials!!!' } });
      }
    });
});

router.post('/confirmation', (req, res) => {
  const token = req.body.token;

  try {
    const decodedToken = jwt.verify(token, process.env.JTW_SECRET);
    const { email } = decodedToken;

    User.findOne({ email })
      .then(user => {
        if (!user.confirmed && user.confirmationToken === token) {
          user.confirmed = true;
          user.confirmationToken = '';
          user.save((err, updatedUser) => {
            if (err) res.status(500).json({});
            res.json({ user: updatedUser.toAuthJSON(), message: 'Thank you for confirming your email address.' })
          });
        } else  if (!user.confirmed && user.confirmationToken !== token) {
          res.json({ user: null, message: 'It seems your token is invalid.'})
        } else if (user.confirmed && user.confirmationToken === '') {
          res.json({ user: null, message: 'It seems you\'ve already verified your email address.' })
        }
      })
      .catch(() => {
        res.status(400).json({ message: 'It seems your token is invalid' });
      });
  } catch(err) {
    res.status(400).json({ message: 'It seems your token is invalid' });
  }

  // User.findOneAndUpdate(
  //   { confirmationToken: token},
  //   { confirmationToken: '', confirmed: true },
  //   { new: true }
  // ).then(user =>
  //   user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({})
  // ).catch(err => res.json({ user: null, errors: { global: err } }));
});

export default router;