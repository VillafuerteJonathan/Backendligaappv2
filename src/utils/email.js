import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: `"Liga Deportiva de Picaíhua" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
