import { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

export const handler: Handler = async (event) => {
if (event.httpMethod !== "POST") {
return {
statusCode: 405,
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
error: "Method not allowed",
}),
};
}

try {
const { email } = JSON.parse(event.body || "{}");

```
if (!email) {
  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      error: "Email address is required.",
    }),
  };
}

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_RECEIVER_EMAIL,
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  throw new Error("SMTP configuration missing.");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

await transporter.verify();

await transporter.sendMail({
  from: `MADECC Newsletter <${SMTP_USER}>`,
  to: CONTACT_RECEIVER_EMAIL || "madeccco5@gmail.com",
  replyTo: email,
  subject: "New Newsletter Subscription",
  text: `New subscriber: ${email}`,
  html: `
    <h2>New Newsletter Subscription</h2>
    <p><strong>Email:</strong> ${email}</p>
  `,
});

return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    success: true,
    message: "Subscription successful.",
  }),
};
```

} catch (error: any) {
console.error("Newsletter error:", error);

```
return {
  statusCode: 500,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    error: error.message || "Failed to process subscription.",
  }),
};
```

}
};
