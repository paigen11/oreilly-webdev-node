const nodemailer = require('nodemailer');
const htmlToFormattedText = require('html-to-formatted-text');

module.exports = (credentials) => {
  const mailTransport = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    auth: {
      user: credentials.sendgrid.user,
      pass: credentials.sendgrid.password,
    },
    port: 465,
  });

  const from = '"Meadowlark Travel" <email@gmail.com>';
  const errorRecipient = 'email@gmail.com';

  return {
    send: (to, subject, html) =>
      mailTransport.sendMail({
        from,
        to,
        subject,
        html,
        text: htmlToFormattedText(html),
      }),
  };
};
