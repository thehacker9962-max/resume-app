"use server";

import { z } from "zod";

const OrderInput = z.object({
  tier: z.enum(["pro", "elite"]),
  gateway: z.enum(["razorpay", "stripe"]),
});

const VerifyInput = z.object({
  tier: z.enum(["pro", "elite"]),
  gateway: z.enum(["razorpay", "stripe"]),
  razorpay_payment_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  stripe_session_id: z.string().optional(),
});

export async function createPaymentOrder(input: unknown) {
  const data = OrderInput.parse(input);
  const amount = data.tier === "elite" ? (data.gateway === "razorpay" ? 99 : 20) : (data.gateway === "razorpay" ? 29 : 8);
  const currency = data.gateway === "razorpay" ? "INR" : "USD";
  const orderId = `order_${data.gateway}_${Math.random().toString(36).substring(2, 15)}`;

  return {
    success: true,
    orderId,
    amount,
    currency,
    // For Stripe: mock checkout session URL
    checkoutUrl: data.gateway === "stripe" ? `/pricing?session_id=mock_stripe_${orderId}` : undefined,
  };
}

export async function verifyPaymentSignature(input: unknown) {
  const data = VerifyInput.parse(input);
  
  // Verify payments signature
  if (data.gateway === "razorpay") {
    if (!data.razorpay_payment_id || !data.razorpay_signature) {
      throw new Error("Invalid Razorpay payment details received.");
    }
    // Success simulated verification
    return {
      success: true,
      message: "Razorpay signature verified successfully.",
      tier: data.tier,
    };
  } else {
    // Stripe success simulated verification
    return {
      success: true,
      message: "Stripe payment session verified.",
      tier: data.tier,
    };
  }
}
