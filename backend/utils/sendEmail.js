import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})


export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Carry Forward" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  }

  await transporter.sendMail(mailOptions)
}
