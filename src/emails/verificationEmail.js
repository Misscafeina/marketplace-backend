const throwError = require('../middlewares/errors/throwError');
const transporter = require('./transporter');
const { SMTP_FROM } = process.env;
const sendVerificationCode = async (email, username, verificationCode) => {
  const verificationLink = `http://localhost:5173/validate/${verificationCode}`;

  const message = {
    from: SMTP_FROM,
    to: email,
    subject: 'Verifica tu cuenta para acceder a marketplace',
    html: `<p>Hola ${username}, por favor haz click en el enlace para verificar tu cuenta </p>
            <a href=${verificationLink}>Click aquí para verificar tu cuenta</a>
        `,
  };
  transporter.sendMail(message, (error) => {
    if (error) {
      throwError(500, 'email no enviado');
    }
  });
  return verificationLink;
};

module.exports = { sendVerificationCode };
