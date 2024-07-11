const nodemailer = require("nodemailer");

exports.sendEmail = async (email, content) => {
  try {
    let transporter = await nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASS,
      },
    });
    let mailOptions = {
      from: "anilkokkul@gmail.com",
      to: email,
      subject: "Reset your password",
      text: JSON.stringify(content),
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log("Error while sending password link", error);
    return false;
  }
};
