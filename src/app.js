const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');

const { createError, notFoundError } = require('./middlewares');
const { PORT, HTTP_URL } = process.env;
const port = PORT || 3005;
const app = express();
app.use(cors());

app.use('/products', productsRouter);

app.use(createError);
app.use(notFoundError);

app.listen(port, () => {
  console.log(`Server running at ${HTTP_URL}:${port} `);
});
