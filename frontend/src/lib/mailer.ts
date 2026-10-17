import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendResumeCopy(opts: {
  to: string;
  applicantName: string;
  applicantEmail: string;
  fileName: string;
  buffer: Buffer;
  mime: string;
  jobTitle?: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.error("SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — skipping resume email");
    return;
  }
  const subject = opts.jobTitle
    ? `New application — ${opts.applicantName} applied to ${opts.jobTitle}`
    : `New resume uploaded — ${opts.applicantName}`;
  const text = opts.jobTitle
    ? `${opts.applicantName} (${opts.applicantEmail}) applied to "${opts.jobTitle}" on Jobtake.`
    : `${opts.applicantName} (${opts.applicantEmail}) uploaded a new resume on Jobtake.`;
  try {
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: opts.to,
      subject,
      text,
      attachments: [{ filename: opts.fileName, content: opts.buffer, contentType: opts.mime }],
    });
  } catch (err) {
    console.error("Failed to send resume copy email", err);
  }
}
