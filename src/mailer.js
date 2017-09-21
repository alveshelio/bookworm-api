import nodemailer from 'nodemailer';

const from = '"Bookworm" <info@bookworm.com>';

function setup() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

export function sendConfirmationEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: 'Welcome',
    text: `
      Welcome to bookworm. Please confirm your email.
      ${user.generateConfirmationUrl()}
    `
  };

  transport.sendMail(email);
}

export function sendResetPasswordEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: 'Reset Password',
    text: `
     To reset password follow this link
      ${user.generateResetPasswordLink()}
    `
  };

  transport.sendMail(email);
}

export function sendResetPasswordNotificationEmail(user) {
  const transport = setup();
  const email = {
    from,
    to: user.email,
    subject: 'Your password has been reset',
    text: `
     This email is to let you know that your password has been reset.
     If it was you who reset the password you can simply ignore this image.
     If not please head to ${process.env.HOST}/forgot_password 
     to reset your password.
    `
  };

  transport.sendMail(email);
}