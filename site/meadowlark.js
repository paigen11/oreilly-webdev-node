const express = require('express');
const expressHandlebars = require('express-handlebars');

const app = express();

// configure Handlebars view enginer
app.engine(
  'handlebars',
  expressHandlebars({
    defaultLayout: 'main',
  }),
);
app.set('view engine', 'handlebars');

const port = process.env.PORT || 3000;

// home page route
app.get('/', (req, res) => {
  // express convenience method - sets content-type header
  res.type('text/plain');
  // replaces Node's res.end()
  res.send('Meadowlark Travel');
});

// about page route
app.get('/about', (req, res) => {
  res.type('text/plain');
  res.send('About Meadowlark Travel');
});

// custom 404
// app.use is method by which Express adds middleware
app.use((req, res) => {
  res.type('text/plain');
  // replaces Node's res.set & res.writeHead
  res.status(404);
  res.send('404 - Not Found');
});

// custom 500
app.use((err, req, res, next) => {
  console.error(err.message);
  res.type('text/plain');
  res.send('500 - Server Error');
});

app.listen(port, () =>
  console.log(
    `Express started on http://localhost:${port}; ` +
      `press Ctrl-C to terminate.`,
  ),
);
