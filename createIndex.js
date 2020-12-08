const { ObjectID } = require('mongodb');
const client = require('./connection.js');

client.indices.create({
  index: 'conf',
}, (err, resp, status) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Create index response: ', resp);

    const objectId = new ObjectID();
    console.log('Object index response: ', objectId, typeof objectId);
  }
});
