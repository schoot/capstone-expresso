const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(cors());
app.use(errorhandler());

const apiRouter = require('./server/apiRouter');
app.use('/api',apiRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

module.exports = app;