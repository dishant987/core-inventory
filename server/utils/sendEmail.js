import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Create a transporter using standard SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Define the email options
  const mailOptions = {
    from: `IMS Admin <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // (optional) You can send HTML formatting as well
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};
