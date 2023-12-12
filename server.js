const express = require('express');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || '5000';

app.use('/', routes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
