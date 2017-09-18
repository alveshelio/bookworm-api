import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotdev from 'dotenv';
import Promise from 'bluebird';

import auth from './routes/auth';
import users from './routes/users';

dotdev.config();

const app = express();
app.use(bodyParser.json());
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, { useMongoClient: true });

app.use('/api/auth', auth);
app.use('/api/users', users);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(8080, () => console.log('Running on localhost:8080'));
