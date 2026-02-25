import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLATFORM_NAME = "Account Haven";
const SUPPORT_EMAIL = "support@accountshaven.site";

// ─── Email Templates ───────────────────────────────────────────────

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body { margin: 0; padding: 0; background: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 24px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
  .content { padding: 32px 24px; color: #333333; line-height: 1.6; }
  .content h2 { color: #1a1a2e; margin-top: 0; font-size: 20px; }
  .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .detail-table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
  .detail-table td:first-child { color: #666; font-weight: 500; width: 40%; }
  .detail-table td:last-child { color: #1a1a2e; font-weight: 600; }
  .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #856404; }
  .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #155724; }
  .info-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #0c5460; }
  .cta-btn { display: inline-block; background: #1a1a2e; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 16px 0; }
  .footer { background: #f4f4f7; padding: 20px 24px; text-align: center; font-size: 12px; color: #999; }
  .footer a { color: #666; }
  @media (max-width: 600px) {
    .wrapper { margin: 0; border-radius: 0; }
    .content { padding: 24px 16px; }
    .header { padding: 24px 16px; }
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>${PLATFORM_NAME}</h1>
  </div>
  <div class="content">
    ${body}
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
    <p>Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
  </div>
</div>
</body>
</html>`;
}

function welcomeEmail(email: string): { subject: string; html: string } {
  return {
    subject: `Welcome to ${PLATFORM_NAME}`,
    html: baseLayout(
      `Welcome to ${PLATFORM_NAME}`,
      `
      <h2>Welcome aboard! 🎉</h2>
      <p>Hi there,</p>
      <p>Your account has been created successfully with the email <strong>${email}</strong>.</p>
      <p>${PLATFORM_NAME} is your trusted marketplace for social media accounts. Here's how to get started:</p>
      <table class="detail-table">
        <tr><td>1. Browse Marketplace</td><td>Explore verified listings across platforms</td></tr>
        <tr><td>2. Fund Your Wallet</td><td>Add funds for instant purchases</td></tr>
        <tr><td>3. Place an Order</td><td>Buy accounts securely with full support</td></tr>
      </table>
      <div class="info-box">
        <strong>Tip:</strong> Wallet payments are processed instantly. Bank transfers require manual verification.
      </div>
      <p>If you have any questions, our support team is here to help.</p>
      <p>Best regards,<br>The ${PLATFORM_NAME} Team</p>
      `
    ),
  };
}

function orderCreatedEmail(order: any, listing: any, userEmail: string): { subject: string; html: string } {
  const paymentMethodLabel = order.payment_method === "wallet" ? "Wallet" : "Bank Transfer";
  return {
    subject: `Your Order Has Been Created – Order #${order.order_code}`,
    html: baseLayout(
      "Order Created",
      `
      <h2>Order Confirmation</h2>
      <p>Hi,</p>
      <p>Your order has been created successfully. Here are the details:</p>
      <table class="detail-table">
        <tr><td>Order ID</td><td>${order.order_code}</td></tr>
        <tr><td>Listing</td><td>${listing?.title || "N/A"}</td></tr>
        <tr><td>Platform</td><td>${listing?.platform || "N/A"}</td></tr>
        <tr><td>Amount</td><td>₦${Number(order.amount).toLocaleString()}</td></tr>
        <tr><td>Payment Method</td><td>${paymentMethodLabel}</td></tr>
        <tr><td>Status</td><td>${order.status?.replace(/_/g, " ").toUpperCase()}</td></tr>
      </table>
      ${
        order.payment_method === "bank_transfer"
          ? `<div class="alert-box"><strong>Next Step:</strong> Please complete your bank transfer and upload payment proof in your dashboard. Use <strong>${order.order_code}</strong> as the payment reference.</div>`
          : `<div class="success-box"><strong>Payment Received:</strong> Your wallet payment has been processed. Your order is being fulfilled.</div>`
      }
      <p>You can track your order status in your dashboard.</p>
      <p>Best regards,<br>The ${PLATFORM_NAME} Team</p>
      `
    ),
  };
}

function orderDeliveredEmail(order: any, listing: any): { subject: string; html: string } {
  return {
    subject: `Your Order Has Been Delivered – Access Your Account`,
    html: baseLayout(
      "Order Delivered",
      `
      <h2>Your Order Has Been Delivered! 🎉</h2>
      <p>Great news! Your order has been fulfilled.</p>
      <table class="detail-table">
        <tr><td>Order ID</td><td>${order.order_code}</td></tr>
        <tr><td>Listing</td><td>${listing?.title || "N/A"}</td></tr>
        <tr><td>Platform</td><td>${listing?.platform || "N/A"}</td></tr>
      </table>
      <div class="success-box">
        <strong>Account Delivered:</strong> You can access your account credentials in the order details page in your dashboard.
      </div>
      <div class="alert-box">
        <strong>⚠️ Security Reminder:</strong> Please change the account password immediately after logging in. This protects your new account from unauthorized access.
      </div>
      <p>If you encounter any issues, please contact our support team.</p>
      <p>Best regards,<br>The ${PLATFORM_NAME} Team</p>
      `
    ),
  };
}

function adminNewOrderEmail(order: any, listing: any, userEmail: string): { subject: string; html: string } {
  const paymentMethodLabel = order.payment_method === "wallet" ? "Wallet" : "Bank Transfer";
  return {
    subject: `New Order Created – Action May Be Required`,
    html: baseLayout(
      "New Order – Admin",
      `
      <h2>New Order Created</h2>
      <p>A new order has been placed on ${PLATFORM_NAME}.</p>
      <table class="detail-table">
        <tr><td>Order ID</td><td>${order.order_code}</td></tr>
        <tr><td>User Email</td><td>${userEmail}</td></tr>
        <tr><td>Listing</td><td>${listing?.title || "N/A"}</td></tr>
        <tr><td>Platform</td><td>${listing?.platform || "N/A"}</td></tr>
        <tr><td>Amount</td><td>₦${Number(order.amount).toLocaleString()}</td></tr>
        <tr><td>Payment Method</td><td>${paymentMethodLabel}</td></tr>
        <tr><td>Status</td><td>${order.status?.replace(/_/g, " ").toUpperCase()}</td></tr>
      </table>
      ${
        order.payment_method === "bank_transfer"
          ? `<div class="info-box">This order uses bank transfer. You'll receive another notification when payment proof is submitted.</div>`
          : `<div class="success-box">Wallet payment was processed automatically.</div>`
      }
      <p>Review this order in the admin dashboard.</p>
      `
    ),
  };
}

function adminPaymentSubmittedEmail(order: any, listing: any, userEmail: string): { subject: string; html: string } {
  return {
    subject: `Payment Submitted – Approval Required`,
    html: baseLayout(
      "Payment Submitted – Admin",
      `
      <h2>Payment Submitted – Approval Required</h2>
      <p>A user has submitted payment proof for an order.</p>
      <table class="detail-table">
        <tr><td>Order ID</td><td>${order.order_code}</td></tr>
        <tr><td>User Email</td><td>${userEmail}</td></tr>
        <tr><td>Amount</td><td>₦${Number(order.amount).toLocaleString()}</td></tr>
        <tr><td>Listing</td><td>${listing?.title || "N/A"}</td></tr>
        <tr><td>Payment Method</td><td>Bank Transfer</td></tr>
      </table>
      <div class="alert-box">
        <strong>Action Required:</strong> Please review the payment proof and approve or reject this order in the admin dashboard.
      </div>
      `
    ),
  };
}

// ─── Send Email via Resend ─────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: `${PLATFORM_NAME} <no-reply@accountshaven.site>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Resend API error:", res.status, errorBody);
    throw new Error(`Failed to send email: ${res.status} ${errorBody}`);
  }

  const result = await res.json();
  console.log("Email sent successfully:", result.id);
}

// ─── Main Handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { event_type, record, old_record } = payload;

    console.log("Notification event:", event_type, "record:", JSON.stringify(record?.id || record?.email));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event_type) {
      // ── Welcome Email ──────────────────────────────────────────
      case "user_created": {
        const email = record?.email;
        if (!email) break;
        const tpl = welcomeEmail(email);
        await sendEmail(email, tpl.subject, tpl.html);
        break;
      }

      // ── Order Created ──────────────────────────────────────────
      case "order_created": {
        const orderId = record?.id;
        if (!orderId) break;

        // Fetch full order + listing + user profile
        const { data: order } = await supabase
          .from("orders")
          .select("*, listing:listings(*)")
          .eq("id", orderId)
          .single();

        if (!order) break;

        // Get user email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", order.user_id)
          .single();

        const userEmail = profile?.email || "";

        // Send to user
        const userTpl = orderCreatedEmail(order, order.listing, userEmail);
        if (userEmail) {
          await sendEmail(userEmail, userTpl.subject, userTpl.html);
        }

        // Send to admin
        if (adminEmail) {
          const adminTpl = adminNewOrderEmail(order, order.listing, userEmail);
          await sendEmail(adminEmail, adminTpl.subject, adminTpl.html);
        }
        break;
      }

      // ── Payment Submitted (bank transfer) ──────────────────────
      case "order_payment_submitted": {
        const orderId = record?.id;
        if (!orderId) break;

        const { data: order } = await supabase
          .from("orders")
          .select("*, listing:listings(*)")
          .eq("id", orderId)
          .single();

        if (!order) break;

        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", order.user_id)
          .single();

        const userEmail = profile?.email || "";

        if (adminEmail) {
          const adminTpl = adminPaymentSubmittedEmail(order, order.listing, userEmail);
          await sendEmail(adminEmail, adminTpl.subject, adminTpl.html);
        }
        break;
      }

      // ── Order Delivered ────────────────────────────────────────
      case "order_delivered": {
        const orderId = record?.id;
        if (!orderId) break;

        const { data: order } = await supabase
          .from("orders")
          .select("*, listing:listings(*)")
          .eq("id", orderId)
          .single();

        if (!order) break;

        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", order.user_id)
          .single();

        const userEmail = profile?.email || "";

        if (userEmail) {
          const tpl = orderDeliveredEmail(order, order.listing);
          await sendEmail(userEmail, tpl.subject, tpl.html);
        }
        break;
      }

      default:
        console.log("Unknown event type:", event_type);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
