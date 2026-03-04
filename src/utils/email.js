import nodemailer from "nodemailer";
import dns from "dns";

// 👇 Fuerza IPv4 (evita problema con Gmail en Render)
dns.setDefaultResultOrder("ipv4first");

export async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,          // 👈 cambiar a 587
    secure: false,      // 👈 false para 587
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
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