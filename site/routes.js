const multiparty = require('multiparty');
const main = require('./lib/handlers/main');
const vacation = require('./lib/handlers/vacations');

module.exports = (app) => {
  // home page route
  // renders home html view
  app.get('/', main.home);

  // about page route
  app.get('/about', main.about);

  // newsletter sign-up page, processing function, and thank you page
  app.get('/newsletter-signup', main.newsletterSignup);
  app.post('/newsletter-signup/process', main.newsletterSignupProcess);
  app.get('/newsletter-signup/thank-you', main.newsletterSignupThankYou);

  // handlers for fetch/JSON form submission
  app.get('/newsletter', main.newsletter);
  app.post('/api/newsletter-signup', main.api.newsletterSignup);

  // vacation photo contest
  app.get('/contest/vacation-photo', main.vacationPhotoContest);
  app.get('/contest/vacation-photo-ajax', vacation.vacationPhotoContestAjax);
  app.post('/contest/vacation-photo/:year/:month', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).send({ error: err.message });
      vacation.vacationPhotoContestProcess(req, res, fields, files);
    });
  });
  app.get(
    '/contest/vacation-photo-thank-you',
    vacation.vacationPhotoContestProcessThankYou,
  );
  app.post('/api/vacation-photo-contest/:year/:month', (req, res) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err)
        return vacation.api.vacationPhotoContestError(req, res, err.message);
      vacation.api.vacationPhotoContest(req, res, fields, files);
    });
  });

  app.post('/cart/checkout', (req, res, next) => {
    const cart = req.session.cart;
    if (!cart) next(new Error('Cart does not exist.'));
    const name = req.body.name || '',
      email = req.body.email || '';
    // input validation
    if (!email.match(main.VALID_EMAIL_REGEX))
      return res.next(new Error('Invalid email address.'));
    // assign a random cart ID; normally we would use a database ID here
    cart.number = Math.random()
      .toString()
      .replace(/^0\.0*/, '');
    cart.billing = {
      name: name,
      email: email,
    };
    res.render(
      'email/cart-thank-you',
      { layout: null, cart: cart },
      (err, html) => {
        console.log('rendered email: ', html);
        if (err) console.log('error in email template');
        mailTransport
          .sendMail({
            from: '"Meadowlark Travel": info@meadowlarktravel.com',
            to: cart.billing.email,
            subject: 'Thank You for Book your Trip with Meadowlark Travel',
            html: html,
            text: htmlToFormattedText(html),
          })
          .then((info) => {
            console.log('sent! ', info);
            res.render('cart-thank-you', { cart: cart });
          })
          .catch((err) => {
            console.error('Unable to send confirmation: ' + err.message);
          });
      },
    );
  });

  app.get('/vacations', vacation.listVacations);

  app.get('/set-currency/:currency', vacation.setCurrency);
};
