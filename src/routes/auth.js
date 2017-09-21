import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { sendResetPasswordEmail, sendResetPasswordNotificationEmail } from '../mailer';

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

router.post('/reset_password_request', (req, res) => {
  const { email } = req.body;
  User.findOne({ email })
    .then(user => {
      if (user) {
        sendResetPasswordEmail(user);
        res.json({});
      } else {
        res.status(400).json({ errors: { global: 'Unable to fin this email in our data base' } });
      }
    })
});

router.post('/validate_token', (req, res) => {
  const token = req.body.token;
  jwt.verify(token, process.env.JTW_SECRET, err => {
    if (err) {
      res.status(401).json({ errors: { global: 'Token is not valid' } });
    } else {
      // this might be done is resetPassword route instead.
      res.json({});
    }
  });
});

router.post('/reset_password', (req, res) => {
  const { password, token } = req.body.data;
  try {
    const decodedToken = jwt.verify(token, process.env.JTW_SECRET);

    User.findById( decodedToken._id)
      .then(user => {
        if (user.resetPasswordToken && (user.resetPasswordToken === token)) {
          user.setPassword(password);
          user.setResetPasswordToken();
          user.save()
            .then(() => {
              sendResetPasswordNotificationEmail(user);
              res.json({})
            })
        } else {
          res.status(404).json({ errors: { global: 'It seems your token is invalid' } });
        }
      })
      .catch(() => res.status(400).json({}));
  } catch(err) {
    res.status(401).json({ errors: { global: 'It seems your token is invalid' } });
  }
});

export default router;