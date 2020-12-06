const express = require('express');

const app = express();
const useragent = require('express-useragent');
const requestIp = require('request-ip');
const { ObjectID } = require('mongodb');
const client = require('./connection.js');

app.use(requestIp.mw());
app.use(useragent.express());

const bulkArticlesArray = [];

app.get('/elastic', (req, res) => {
  const IP = req.clientIp;
  const userAgent = req.useragent.source;
  //   const data = {
  //     ip: IP,
  //     useragent: userAgent,
  //   };
  const idName = new ObjectID().toString();
  bulkArticlesArray.push(
    { index: { _index: 'conf', _type: 'userconf' } },
    {
      ip: IP,
      useragent: userAgent,
    },
  );
  client.bulk({
    maxRetries: 5,
    index: 'config',
    type: 'userconf',
    body: bulkArticlesArray,
  }, (err, resp, status) => {
    if (err) {
      console.log(err);
    } else {
      console.log(resp.items);
      res.send('Succesful');
    }
  });

//   client.index({
//     index: 'userconfig',
//     type: 'user',
//     id: idName,
//     body: data,
//   }).then((resp) => {
//     console.log('User config', resp);
//   }).catch((err) => console.log('Error', err));
});
app.get('/', (req, res) => {
  const ip = req.clientIp;
  res.send(req.useragent.source + ip);
});
app.listen(3000);
// const insertDoc = async function (indexName, _id, mappingType, data) {
//   return await client.index({
//     index: indexName,
//     type: mappingType,
//     id: _id,
//     body: data,
//   });
// };

// module.exports = insertDoc;
// async function test() {
//   const data = {
//     beat: 'apm',
//     version: '7.5.0',
//   };
//   try {
//     const resp = await insertDoc('user', 2, '_meta', data);
//     console.log(resp);
//   } catch (e) {
//     console.log(e);
//   }
// }
// test();
