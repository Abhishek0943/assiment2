const nodemailer = require("nodemailer");


const sendEmail = async (options) => {
  if (
    !process.env.SMPT_SERVICE ||
    !process.env.SMPT_MAIL ||
    !process.env.SMPT_PASSWORD
  ) {
    throw new Error("SMTP environment variables are not properly defined");
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions= {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
