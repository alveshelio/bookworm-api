import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  authors: {
    type: String,
  },
  cover: {
    type: String,
  },
  link: {
    type: String,
  },
  averageRating: {
    type: String,
  },
  pages: {
    type: String,
  },
}, { timestamp: true});

export default mongoose.model('Book', bookSchema);