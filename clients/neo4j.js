const neo4j = require('neo4j-driver');

const uri = '';
const user = '';
const password = '';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

module.exports = driver;
