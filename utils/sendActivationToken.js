const nodemailer = require("nodemailer");

exports.sendActivationToken = async (email,activationToken) => {
  const activationLink = `http://localhost:3000/activate/${activationToken}`;
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
      subject: "Account Activation",
      text: `Please activate your account by clicking the following link: ${activationLink}`,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log("Error while sending password link", error);
    return false;
  }
};
