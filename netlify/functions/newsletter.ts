import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  try {
    const { email } = JSON.parse(event.body || "{}");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: ` Thank you, Subscription received for ${email}`,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error",
      }),
    };
  }
};
