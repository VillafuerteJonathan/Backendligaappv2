export async function sendEmail({ to, subject, text, html }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY?.trim(), // 👈 importante
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Liga Deportiva de Picaíhua",
          email: process.env.BREVO_SENDER_EMAIL, // 👈 usar variable específica
        },
        to: [{ email: to }],
        subject: subject,
        textContent: text || "",
        htmlContent: html || "",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "No se pudo enviar el correo");
    }

    return data;

  } catch (error) {
    console.error("Error enviando correo:", error.message);
    throw error;
  }
}