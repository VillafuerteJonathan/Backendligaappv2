export async function sendEmail({ to, subject, text, html }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY?.trim(),
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Liga Deportiva de Picaíhua",
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: to }],
        subject: subject,
        textContent: text || "",
        htmlContent: html || ""
      })
    });

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("BREVO RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.message || "Error enviando correo");
    }

    console.log("📧 Correo enviado correctamente");
    return data;

  } catch (error) {
    console.error("❌ Error enviando correo:", error.message);
    throw error;
  }
}