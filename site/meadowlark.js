const express = require('express');
const expressHandlebars = require('express-handlebars');
const fortune = require('./lib/fortune'); // the ./ indicates to node not to look for this import in the node_modules folder

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

app.use(express.static(__dirname + '/public'));

// home page route
// renders home html view
app.get('/', (req, res) => res.render('home'));

// about page route
app.get('/about', (req, res) => {
  res.render('about', { fortune: fortune.getFortune() });
});

// custom 404
// app.use is method by which Express adds middleware
app.use((req, res) => {
  res.status(404);
  res.render('404');
});

// custom 500
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.message);
  res.render('500');
});

app.listen(port, () =>
  console.log(
    `Express started on http://localhost:${port}; ` +
      `press Ctrl-C to terminate.`,
  ),
);
