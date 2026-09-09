const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure:
    String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async ({
  to,
  name,
  resetUrl,
}) => {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error(
      "SMTP configuration is missing."
    );
  }

  await transporter.verify();

  await transporter.sendMail({
    from: `"PaperPal AI" <${process.env.SMTP_USER}>`,
    to,
    subject: "Reset your PaperPal AI password",
    text: `Hello ${name || "there"},

We received a request to reset your PaperPal AI password.

Open the link below to create a new password:

${resetUrl}

This link expires in 30 minutes.

If you did not request this, you can safely ignore this email.

PaperPal AI`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
        <h2 style="color:#7c3aed;">PaperPal AI</h2>

        <p>Hello ${name || "there"},</p>

        <p>
          We received a request to reset your PaperPal AI password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              background:#7c3aed;
              color:#ffffff;
              padding:12px 20px;
              border-radius:8px;
              text-decoration:none;
              font-weight:bold;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          This link expires in <strong>30 minutes</strong>.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

        <p style="color:#777;">
          PaperPal AI
        </p>
      </div>
    `,
  });
};
console.log("SMTP USER:", process.env.SMTP_USER);
console.log(
  "SMTP PASS LENGTH:",
  process.env.SMTP_PASS
    ? process.env.SMTP_PASS.length
    : 0
);

module.exports = {
  sendPasswordResetEmail,
};