const express = require('express');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const handlers = require('./lib/handlers');

const app = express();

// prevents showing Express powers the app
app.disable('x-powered-by');
// adds more express security features
app.use(helmet());

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
app.get('/', handlers.home);

// about page route
app.get('/about', handlers.about);

// custom 404
// app.use is method by which Express adds middleware
app.use(handlers.notFound);

// custom 500
app.use(handlers.serverError);

// if you run a JS file directly with node, require.main will equal the global module,
// otherwise it's being imported from another module
if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Express started on http://localhost:${port}; ` +
        `press Ctrl-C to terminate.`,
    );
  });
} else {
  module.exports = app;
}
