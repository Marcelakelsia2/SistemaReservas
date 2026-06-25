import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarEmail(
  destino: string,
  assunto: string,
  mensagem: string
) {
  await transporter.sendMail({
    from: `Sistema Reservas <${process.env.EMAIL_FROM}>`,
    to: destino,
    subject: assunto,
    text: mensagem,
  });
}