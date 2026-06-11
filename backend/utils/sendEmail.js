// utils/sendEmail.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const sendEmail = async (options) => {
  // 1. Set up the OAuth2 client
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENTID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Redirect URL
  );

  // 2. Give the client your refresh token
  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
  });

  // 3. Generate a temporary Access Token
  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.log("*ERR: Failed to create access token :( *");
        reject(err);
      }
      resolve(token);
    });
  });

  // 4. Create the Nodemailer transporter using OAuth2
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USERNAME,
      accessToken,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });

  // 5. Define the email options
  const mailOptions = {
    from: `Your App Name <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 6. Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

































// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: 'Your App Name <noreply@yourapp.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;