exports.vacationPhotoContest = (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};
exports.vacationPhotoContestAjax = (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo-ajax', {
    year: now.getFullYear(),
    month: now.getMonth(),
  });
};

exports.vacationPhotoContestProcess = (req, res, fields, files) => {
  console.log('field data: ', fields);
  console.log('files: ', files);
  res.redirect(303, '/contest/vacation-photo-thank-you');
};
exports.vacationPhotoContestProcessError = (req, res, fields, files) => {
  res.redirect(303, '/contest/vacation-photo-error');
};
exports.vacationPhotoContestProcessThankYou = (req, res) => {
  res.render('contest/vacation-photo-thank-you');
};
// exports.api.vacationPhotoContest = (req, res, fields, files) => {
//   console.log('field data: ', fields);
//   console.log('files: ', files);
//   res.send({ result: 'success' });
// };
// exports.api.vacationPhotoContestError = (req, res, message) => {
//   res.send({ result: 'error', error: message });
// };

const pathUtils = require('path');
// node's internal file system
const fs = require('fs');

// create directory to store vacation photos (if it doesn't already exist)
const dataDir = pathUtils.resolve(__dirname, '..', 'data');
const vacationPhotosDir = pathUtils.join(dataDir, 'vacation-photos');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(vacationPhotosDir)) fs.mkdirSync(vacationPhotosDir);

function saveContestEntry(contestName, email, year, month, photoPath) {
  // TODO...this will come later
}

// we'll want these promise-based versions of fs functions later
const { promisify } = require('util');
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);

// exports.api.vacationPhotoContest = async (req, res, fields, files) => {
//   const photo = files.photo[0];
//   const dir = vacationPhotosDir + '/' + Date.now();
//   const path = dir + '/' + photo.originalFilename;
//   await mkdir(dir);
//   await rename(photo.path, path);
//   saveContestEntry(
//     'vacation-photo',
//     fields.email,
//     req.params.year,
//     req.params.month,
//     path,
//   );
//   res.send({ result: 'success' });
// };

// for the mongodb
const db = require('../../db');
exports.listVacations = async (req, res) => {
  const vacations = await db.getVacations({ available: true });
  const context = {
    vacations: vacations.map((vacation) => ({
      sku: vacation.sku,
      name: vacation.name,
      description: vacation.description,
      price: '$' + vacation.price.toFixed(2),
      inSeason: vacation.inSeason,
    })),
  };
  res.render('vacations', context);
};

exports.notifyWhenInSeasonForm = (req, res) =>
  res.render('notify-me-when-in-season', { sku: req.query.sku });

exports.notifyWhenInSeasonProcess = async (req, res) => {
  const { email, sku } = req.body;
  await db.addVacationInSeasonListener(email, sku);
  return res.redirect(303, '/vacations');
};

exports.setCurrency = (req, res) => {
  req.session.currency = req.params.currency;
  return res.redirect(303, '/vacations');
};

function convertFromUSD(value, currency) {
  switch (currency) {
    case 'USD':
      return value * 1;
    case 'GBP':
      return value * 0.79;
    case 'BTC':
      return value * 0.000078;
    default:
      return NaN;
  }
}

// for the redis db
exports.listVacations = (req, res) => {
  Vacation.find({ available: true }, (err, vacations) => {
    const currency = req.session.currency || 'USD';
    const context = {
      currency: currency,
      vacations: vacations.map((vacation) => {
        return {
          sku: vacation.sku,
          name: vacation.name,
          description: vacation.description,
          inSeason: vacation.inSeason,
          price: convertFromUSD(vacation.price, currency),
          qty: vacation.qty,
        };
      }),
    };
    switch (currency) {
      case 'USD':
        context.currencyUSD = 'selected';
        break;
      case 'GBP':
        context.currencyGBP = 'selected';
        break;
      case 'BTC':
        context.currencyBTC = 'selected';
        break;
    }
    res.render('vacations', context);
  });

  exports.getVacationsApi = async (req, res) => {
    const vacations = await db.getVacations({ available: true });
    res.json(vacations);
  };

  exports.getVacationBySkuApi = async (req, res) => {
    const vacation = await db.getVacationBySku(req.params.sku);
    res.json(vacation);
  };

  exports.addVacationInSeasonListenerApi = async (req, res) => {
    await db.addVacationInSeasonListener(req.params.sku, req.body.email);
    res.json({ message: 'success' });
  };

  exports.requestDeleteVacationApi = async (req, res) => {
    const { email, notes } = req.body;
    res.status(500).json({ message: 'not yet implemented' });
  };
};
