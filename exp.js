const express = require('express');

const app = express();
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const elasticsearch = require('elasticsearch');
// const client = require('./connection.js');
app.use(requestIp.mw());
app.use(useragent.express());
const client = new elasticsearch.Client({
  // hosts: ['http://3.131.254.70:9200'],
  hosts: ['http://3.139.243.255:9200'],
});

app.get('/elastic', (req, res) => {
  const IP = req.clientIp;
  const userAgent = req.useragent.source;
  client.index({
    index: 'userconf',
    body: {
      ip: IP,
      useragent: userAgent,
    },
  }).then((resp) => {
    console.log('User config', resp);
    res.send('succesful');
  }).catch((err) => console.log('Error', err));
});

app.get('/search-ua/:ua', (req, res) => {
  // Access title like this: req.params.title

  /* Query using slop to allow for unexact matches */
  client.search({
    index: 'userconf',
    // type: 'articles',
    body: {
      query: {
        match_phrase: {
          useragent: { query: req.params.ua, slop: 100 },
        },
      },
    },

  }).then((resp) => {
    console.log('Successful query! Here is the response:', resp);
    res.send(resp);
  }, (err) => {
    console.trace(err.message);
    res.send(err.message);
  });
});
app.get('/search-ip/:ip', (req, res) => {
  client.search({
    index: 'userconf',
    // type: 'articles',
    body: {
      query: {
        match_phrase: {
          ip: { query: req.params.ip, slop: 100 },
        },
      },
    },

  }).then((resp) => {
    console.log('Successful query! Here is the response:', resp);
    res.send(resp);
  }, (err) => {
    console.trace(err.message);
    res.send(err.message);
  });
});
app.get('/', (req, res) => {
  const ip = req.clientIp;
  res.send(req.useragent.source + ip);
});
app.listen(3000);
