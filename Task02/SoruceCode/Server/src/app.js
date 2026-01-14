const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes'));

app.get('/', (req, res) => {
  res.json({ message: 'PriceCompare API Server is running' });
});

module.exports = app;
