const self       = {};
var nodemailer = require('nodemailer');

// institutocrear
// qzmy htak izvv yegr
const EMAIL_USER = 'institutocrear.info@gmail.com'
const EMAIL_PASS = 'Password01@'
// const EMAIL_PASS = 'qzmyhtakizvvyegr'

const CLIENT_ID = "768573746662-jj8cdghdhoadvkvp57p2m82o6qf1767d.apps.googleusercontent.com"
const SECRET = "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"
const TOKEN = "4/0AfJohXlR9dli9rRXMLtGnVIuZxOTThg_Am4WdqhrIxw4WpkHGCo3oUcO5oQVhg52c8zJ3w"

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: EMAIL_USER,
      pass: EMAIL_PASS,
      clientId: CLIENT_ID,
      clientSecret: SECRET,
      refreshToken: TOKEN
    }
});

async function sendEmail(to, subject, html) {
  try {
  const info = await transporter.sendMail({
    from: '"Instituto Crear" <instcrear@hotmail.com>',
    to: to,
    subject: subject,
    html: html,
  });

  console.log("Message sent: %s", info.messageId);

  return info;
  
  }catch(e) {
    console.log(e)
  }
}

module.exports = sendEmail;