import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "FreelanceHub <noreply@freelancehub.dev>";

export async function sendOrderCreatedEmail(to: string, orderDetails: { gigTitle: string; clientName: string; price: number; orderId: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New order: ${orderDetails.gigTitle}`,
    html: `
      <h2>You have a new order!</h2>
      <p><strong>${orderDetails.clientName}</strong> ordered <strong>${orderDetails.gigTitle}</strong></p>
      <p>Amount: $${(orderDetails.price / 100).toFixed(2)}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderDetails.orderId}">View Order</a>
    `,
  });
}

export async function sendOrderCompletedEmail(to: string, orderDetails: { gigTitle: string; orderId: string; amount: number }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Payment released: ${orderDetails.gigTitle}`,
    html: `
      <h2>Payment released!</h2>
      <p>Your order <strong>${orderDetails.gigTitle}</strong> was completed.</p>
      <p>Amount: $${(orderDetails.amount / 100).toFixed(2)}</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderDetails.orderId}">View Order</a>
    `,
  });
}

export async function sendMessageNotificationEmail(to: string, details: { senderName: string; orderId: string }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New message from ${details.senderName}`,
    html: `
      <p><strong>${details.senderName}</strong> sent you a message.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${details.orderId}">View Conversation</a>
    `,
  });
}
