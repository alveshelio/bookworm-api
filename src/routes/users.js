import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import parseErrors from '../utils/parseErrors';
import { sendConfirmationEmail } from '../mailer';

const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body.user;
  const user = new User({ email });
  user.setPassword(password);
  user.setConfirmationToken();
  user.save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord);
      res.status(200).json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => {
      res.status(400).json({ errors: parseErrors(err.errors) });
    });
});

router.post('/fetch_user', async (req, res) => {
  const token = req.body.token;
  const decodedToken = jwt.verify(token, process.env.JTW_SECRET);

  if (!decodedToken) {
    res.status(401).json({ errors: { global: 'Invalid Token' } });
  }
  const user = await User.findOne({ email: decodedToken.email });
  if (!user) {
    res.status(401).json({ errors: { global: 'Unable to find user' } });
  }
  return res.json({ user });
});

export default router;
