import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP no configurado");
    }

    console.log("📧 Conectando a SMTP Brevo...");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // 587 usa STARTTLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 👉 Verifica conexión (CLAVE para debug)
    await transporter.verify();
    console.log("✅ SMTP conectado correctamente");

    const info = await transporter.sendMail({
      from: `"Liga Deportiva" <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Correo enviado:", info.messageId);

    return info;

  } catch (error) {
    console.error("❌ Error SMTP:", error);
    throw error;
  }
};