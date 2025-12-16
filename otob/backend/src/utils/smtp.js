const nodemailer = require('nodemailer');

// Membuat transporter Gmail dan memastikan kredensial valid
const createVerifiedGmailTransporter = async (email, appPassword) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: appPassword
    }
  });
  await transporter.verify();
  return transporter;
};

module.exports = {
  createVerifiedGmailTransporter
};
