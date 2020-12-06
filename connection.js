const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  hosts: ['http://3.131.254.70:9200'],
});

module.exports = client;
