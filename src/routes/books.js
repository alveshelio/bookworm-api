import express from 'express';
import request from 'request-promise';
import { parseString } from 'xml2js';

import authenticate from '../middlewares/authenticate';
import Book from '../models/Book';

const router = express.Router();

router.use(authenticate);

router.get('/all', async (req, res) => {
  const books = await Book.find();

  if (books) {
    return res.json({ books });
  }
  res.status(401).json({ errors: { global: 'Unable to retrieve books' } });
});

router.post('/new', async (req, res) => {
  const book = req.body.book;
  const newBook = await (new Book(book)).save();

  if (newBook) {
    return res.json({ book: newBook });
  }
  res.status(401).json({ errors: { global: 'Unable to save the book' } });
});

router.get('/search', (req, res) => {
  const query = req.query.q;
  request.get(`https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_API_KEY}&q=${query}`)
    .then(result =>
      parseString(result, (err, goodreadsResult) => res.json({
        books: goodreadsResult.GoodreadsResponse.search[ 0 ].results[ 0 ].work.map(work => ({
          goodreadsId: work.best_book[ 0 ].id[ 0 ]._,
          title: work.best_book[ 0 ].title[ 0 ],
          authors: work.best_book[ 0 ].author[ 0 ].name[ 0 ],
          authorId: work.best_book[ 0 ].author[ 0 ].id[ 0 ]._,
          covers: [ work.best_book[ 0 ].image_url[ 0 ] ],
        })),
      }))
    );
});

router.post('/:bookId/:authorId', (req, res) => {
  const bookId = req.params.bookId;
  const authorId = req.params.authorId;
  request.get(`https://www.goodreads.com/author/list/${authorId}?format=xml&key=${process.env.GOODREADS_API_KEY}`)
    .then(result => parseString(result, (err, goodreadsResult) => res.json({
        book: goodreadsResult.GoodreadsResponse.author[ 0 ].books[ 0 ].book
          .map(book => ({
            goodreadsId: book.id[ 0 ]._,
            title: book.title[ 0 ],
            link: book.link[ 0 ],
            covers: [ book.image_url[ 0 ] ],
            authors: book.authors[ 0 ].author.map(author => author.name[0]),
            pages: book.num_pages[ 0 ],
            averageRating: book.average_rating[ 0 ],
            description: book.description[ 0 ],
          }))
          .filter(book => book.goodreadsId === bookId)[0]
      }))
    );
});

export default router;
