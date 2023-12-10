const express = require('express');
const routes = require('./routes/index');

const app = express();
cons port = process.env.PORT || '5000';

app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
