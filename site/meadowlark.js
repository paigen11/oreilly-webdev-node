const express = require('express');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const multiparty = require('multiparty');

const handlers = require('./lib/handlers');
const weatherMiddlware = require('./lib/middleware/weather');
const flashMiddleware = require('./lib/middleware/flash');
const { credentials } = require('./config');

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
    // way to inject views in different parts of layout in express
    helpers: {
      section: (name, options) => {
        if (!this._sections) this._sections = {};
        this._sections[name] = options.fn(this);
        return null;
      },
    },
  }),
);
app.set('view engine', 'handlebars');

// makes req.body available to us
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser(credentials.cookieSecret));

// to set the value of a cookie anywhere you have a response object
// res.cookie('monster', 'nom nom');
// res.cookie('signed_monster', 'nom nom', { signed: true });

// to retreieve the value of a cookie anywhere you have a request object
// const monster = req.cookies.monster;
// const signedMonster = req.signedCookies.signed_monster;

// to delete a cookie anywhere you have a response object
// res.clearCookie('monster')

// sessions are a more convenient way to maintain state in an application
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
  }),
);

// to use sesssions, just use properties of the request object's session var
// req.session.userName = 'anonymous';
// const colorScheme = req.session.colorScheme || 'darkMode';

// sessions don't have to use the request object for retrieving values and the response object for setting values
// it's all on the request object
// delete req.session.colorScheme;  // removes 'colorScheme' from the session

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.use(weatherMiddlware);
app.use(flashMiddleware);

// home page route
// renders home html view
app.get('/', handlers.home);

// about page route
app.get('/about', handlers.about);

// newsletter sign-up page, processing function, and thank you page
app.get('/newsletter-signup', handlers.newsletterSignup);
app.post('/newsletter-signup/process', handlers.newsletterSignupProcess);
app.get('/newsletter-signup/thank-you', handlers.newsletterSignupThankYou);

// handlers for fetch/JSON form submission
app.get('/newsletter', handlers.newsletter);
app.post('/api/newsletter-signup', handlers.api.newsletterSignup);

// vacation photo contest
app.get('/contest/vacation-photo', handlers.vacationPhotoContest);
app.get('/contest/vacation-photo-ajax', handlers.vacationPhotoContestAjax);
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).send({ error: err.message });
    handlers.vacationPhotoContestProcess(req, res, fields, files);
  });
});
app.get(
  '/contest/vacation-photo-thank-you',
  handlers.vacationPhotoContestProcessThankYou,
);
app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    if (err)
      return handlers.api.vacationPhotoContestError(req, res, err.message);
    handlers.api.vacationPhotoContest(req, res, fields, files);
  });
});

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
