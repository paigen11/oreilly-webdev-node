const express = require('express');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const csrf = require('csurf');

const morgan = require('morgan');
const fs = require('fs');
const cluster = require('cluster');
const https = require('https');

const handlers = require('./lib/handlers/main');
const weatherMiddlware = require('./lib/middleware/weather');
const flashMiddleware = require('./lib/middleware/flash');
const requiresWaiver = require('./lib/tourRequiresWaiver');
const cartValidation = require('./lib/cartValidation');
const { credentials } = require('./config');
const emailService = require('./lib/email')(credentials);
const email = require('./lib/email');
const cors = require('cors');

// bringing in mongodb
require('./db');

const app = express();

// bringing in routes
const addRoutes = require('./routes');
addRoutes(app);

switch (app.get('env')) {
  case 'development':
    app.use(morgan('dev'));
    break;
  case 'production':
    const stream = fs.createWriteStream(__dirname + '/access.log', {
      flags: 'a',
    });
    app.use(morgan('combined', { stream }));
    break;
}

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

const RedisStore = require('connect-redis')(expressSession);
app.use(cookieParser(credentials.cookieSecret));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
    store: new RedisStore({
      url: credentials.redis.url,
      logErrors: true, // highly recommended!
    }),
  }),
);

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

async function go() {
  try {
    const result = await emailService.send(
      'email@gmail.com',
      'Your Meadowlark Travel Tour',
      '<img src="//meadowlarktravel.com/email/logo.png"  alt="Meadowlark Travel Logo">' +
        '<p>Thank you for booking your trip with Meadowlark Travel.  ' +
        'We look forward to your visit!</p>',
    );
    console.log('mail sent successfully: ', result);
  } catch (err) {
    console.log('could not send mail: ' + err.message);
  }
}

// go();

// to use sesssions, just use properties of the request object's session var
// req.session.userName = 'anonymous';
// const colorScheme = req.session.colorScheme || 'darkMode';

// sessions don't have to use the request object for retrieving values and the response object for setting values
// it's all on the request object
// delete req.session.colorScheme;  // removes 'colorScheme' from the session

app.use(express.static(__dirname + '/public'));

// how to invoke middlewares set up elsewhere
app.use(weatherMiddlware);
app.use(flashMiddleware);
app.use(requiresWaiver);
app.use(cartValidation.resetValidation);
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.use('/api', cors());

app.get('/api/vacations', handlers.getVacationsApi);
app.get('/api/vacation/:sku', handlers.getVacationBySkuApi);
app.post(
  '/api/vacation/:sku/notify-when-in-season',
  handlers.addVacationInSeasonListenerApi,
);
app.delete('/api/vacation/:sku', handlers.requestDeleteVacationApi);

app.use((req, res, next) => {
  if (cluster.isWorker)
    console.log(`Worker ${cluster.worker.id} received request`);
  next();
});

// uncaught exception handling
app.get('/fail', (req, res) => {
  throw new Error('Nope!');
});

app.get('/epic-fail', (req, res) => {
  process.nextTick(() => {
    throw new Error('Kaboom!');
  });
  res.send('embarrassed');
});

app.get('*', (req, res) => res.send('online'));

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION\n', err.stack);
  // do any cleanup you need to do here...close
  // database connections, etc.  you'll probably
  // also want to notify your operations team
  // that a critical error occurred; you can use
  // email or even better a service like Sentry,
  // Rollbar, or New Relic
  process.exit(1);
});

// custom 404
// app.use is method by which Express adds middleware
// middleware must be a function
app.use(handlers.notFound);

// custom 500
app.use(handlers.serverError);

const options = {
  key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
  cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
};

function startServer(port) {
  https.createServer(options, app).listen(port, () => {
    console.log(
      `Express started in ${app.get(
        'env',
      )} mode at http://localhost:${port}; ` + `press Ctrl-C to terminate.`,
    );
  });
}
// if you run a JS file directly with node, require.main will equal the global module,
// otherwise it's being imported from another module
if (require.main === module) {
  // app run directly; start app server
  startServer(process.env.PORT || 3033);
} else {
  // app imported as a module via 'require' export
  // function to create server
  module.exports = startServer;
}
