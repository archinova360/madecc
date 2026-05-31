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
  return {
    statusCode: 500,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      error: "SMTP configuration missing.",
    }),
  };
}

const isGmail =
  SMTP_HOST.includes("gmail.com") ||
  SMTP_USER.includes("@gmail.com");

const transporter = nodemailer.createTransport(
  isGmail
    ? {
        service: "gmail",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }
    : {
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: SMTP_PORT === "465",
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      }
);

await transporter.verify();

await transporter.sendMail({
  from: `"MADECC Newsletter" <${SMTP_USER}>`,
  to: CONTACT_RECEIVER_EMAIL || "madeccco5@gmail.com",
  replyTo: email,
  subject: "New Newsletter Subscription",
  text: `A new visitor subscribed to the MADECC newsletter.\n\nSubscriber Email: ${email}`,
  html: `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2 style="color:#ea580c;">New Newsletter Subscription</h2>
      <p>A visitor has subscribed to the MADECC newsletter.</p>

      <table style="border-collapse:collapse;margin-top:15px;">
        <tr>
          <td style="padding:8px;font-weight:bold;">Subscriber Email:</td>
          <td style="padding:8px;">${email}</td>
        </tr>
      </table>

      <p style="margin-top:20px;color:#666;font-size:12px;">
        Sent automatically from the MADECC website newsletter form.
      </p>
    </div>
  `,
});

return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    success: true,
    message: "Thanks, Subscription successfully.",
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
