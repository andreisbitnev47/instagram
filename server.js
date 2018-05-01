
const express = require('express');
const expressGraphQL = require('express-graphql');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const schema = require('./data/schema');
const path = require('path');

const app = express();

mongoose.connect('mongodb://localhost/instagram');

app.use(bodyParser.json());
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

const webpackMiddleware = require('webpack-dev-middleware');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
app.use(webpackMiddleware(webpack(webpackConfig)));

app.listen(4000, () => console.log('Server running on port 4000'));

module.exports = app;