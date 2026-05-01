export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY no configurado");
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL no configurado");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY.trim(),
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: "Liga Deportiva de Picaíhua",
        email: process.env.BREVO_SENDER_EMAIL
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Error Brevo:", data);
    throw new Error(data.message || "Error enviando correo");
  }

  console.log("✅ Brevo OK:", data.messageId);

  return data;
}