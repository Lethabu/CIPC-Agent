import pino from "pino";

const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

/**
 * Sends an email.
 * @param to The recipient's email address.
 * @param subject The subject of the email.
 * @param body The body of the email.
 */
export const sendEmail = async (to: string, subject: string, body: string) => {
  // In a production environment, you would use a transactional email service
  // like SendGrid, Mailgun, or AWS SES to send the email.
  // For this example, we're just logging the email to the console.
  logger.info(`Sending email to ${to}`);
  logger.info(`Subject: ${subject}`);
  logger.info(`Body: ${body}`);
};
