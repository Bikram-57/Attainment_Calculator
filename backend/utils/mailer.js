// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // The new, polished HTML template matching your design
        const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="background-color: #5850ec; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Your OTP Code</h2>
          </div>
          
          <div style="padding: 30px 20px;">
            <p style="color: #333333; font-size: 16px; margin-top: 0;">Hello,</p>
            <p style="color: #555555; font-size: 16px;">
              Your One-Time Password (OTP) for account verification is:
            </p>
            
            
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; padding: 40px 20px;">
        <div style="background-color: #f4f5f6; border-radius: 8px; padding: 40px 30px; display: inline-block; max-width: 500px;">
          <div style="color: #5a4bda; font-size: 30px; font-weight: bold; line-height: 1.5; letter-spacing: 1px;">
            ${otp}
          </div>
        </div>
      </div>
    
            
            <p style="color: #555555; font-size: 14px;">
              This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
            </p>
            <p style="color: #555555; font-size: 14px; margin-bottom: 0;">
              If you didn't request this code, please ignore this email.<br>
              Thank you for using our service!
            </p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #eeeeee;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2026 Attainment Calculator. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    `;

        const mailOptions = {
            from: '"Attainment Calculator Support" <' + process.env.EMAIL_USER + '>',
            to,
            subject,
            html: htmlTemplate
        };

        await transporter.sendMail(mailOptions);
        console.log(`Stylish HTML Email successfully sent to ${to}`);
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Email sending failed");
    }
};

module.exports = sendEmail;



// // utils/sendEmail.js
// const nodemailer = require('nodemailer');

// const sendEmail = async (to, subject, text) => {
//   try {
//     // 1. Configure the transporter using your App Password credentials
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     // 2. Define mail options
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       text
//     };

//     // 3. Send the mail
//     await transporter.sendMail(mailOptions);
//     console.log(`Email successfully sent to ${to}`);
//   } catch (error) {
//     console.error("Email sending failed:", error);
//     throw new Error("Email sending failed");
//   }
// };

// module.exports = sendEmail;