const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const redis = require('redis');

const app = express();

// create client
// var client=redis.createClient();
const client = redis.createClient(6379, '3.131.254.70');
client.on('connect', () => {
  console.log('Redis server connected');
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
//  res.send('Welcome!');

  client.exists('bookss', (err, reply) => {
    if (reply === 1) {
      client.hgetall('bookss', (err, books) => {
        // console.log("done");
        res.render('index', { books, reply });
      });
    } else {
      console.log('empty');
      res.render('index', { reply });
    }
  });
});

app.post('/book/add', (req, res) => {
  const newBook = {};
  newBook.id = req.body.id;
  newBook.name = req.body.name;
  newBook.author = req.body.author;
  newBook.cost = req.body.cost;
  client.hmset('bookss', ['name', newBook.name, 'author', newBook.author, 'id', newBook.id, 'cost', newBook.cost], (err, reply) => {
    if (err) {
      console.log(err);
    }
    console.log(reply);
    client.hmset(`book:${newBook.id}`, [
      'name', newBook.name, 'author', newBook.author, 'id', newBook.id, 'cost', newBook.cost,
    ], (error, replyy) => {
      if (err) {
        console.log(error);
      }
      console.log(replyy);
      res.redirect('/');
    });
  });
});

app.post('/book/search', (req, res, next) => {
  console.log(req.body);
  const { id } = req.body;

  client.hgetall(`book:${id}`, (err, obj) => {
    if (!obj) {
    	// console.log('!obj');
      res.render('search', {
        error: 'Book not found!!', books: '',
      });
    } else {
    	// console.log('else')
      obj.id = id;
    	console.log(obj);

      res.render('search', {
        book: obj, books: 'exists', error: '',
      });
    }
  });
});

app.get('/search', (req, res) => {
  res.render('search', {
    error: '',
    books: '',
  });
});

app.post('/book/delete/:id', (req, res) => {
  const { id } = req.params;
  client.del(`book:${req.params.id}`);

  console.log(typeof client.hget('bookss', 'id'));
  client.hget('bookss', 'id', (err, reply) => {
    if (id == reply) {
      // console.log(reply)
      // console.log('there');
      client.del('bookss');
    }
  });

  res.redirect('/search');
});

// app.get('/elastic', (req, res) => {
//   const IP = req.clientIp;
//   const userAgent = req.useragent.source;
//   //   const data = {
//   //     ip: IP,
//   //     useragent: userAgent,
//   //   };
//   bulkArticlesArray.push(
//     { index: { _index: 'conf', _type: 'userconf' } },
//     {
//       ip: IP,
//       useragent: userAgent,
//     },
//   );
//   esClient.bulk({
//     maxRetries: 5,
//     index: 'config',
//     type: 'userconf',
//     body: bulkArticlesArray,
//   }, (err, resp, status) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(resp.items);
//       res.send('Successful');
//     }
//   });
// });

app.listen(5000);
console.log('Server Started on Port 5000');
module.exports = app;
