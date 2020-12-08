const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  // hosts: ['http://3.131.254.70:9200'],
  // hosts: ['http://3.139.243.255:9200'],
  hosts: ['http://3.23.115.0:9200'],
});

module.exports = client;
