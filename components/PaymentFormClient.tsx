// components/PaymentFormClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpay } from "@/lib/loadRazorpay";

export default function PaymentFormClient() {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  async function onRazorpaySuccess(response: any) {
    try {
      await fetch("/api/razorpay/record-payment", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          amount: Math.round((order?.amount ?? 0) / 100), // rupees from order
          currency: order?.currency ?? "INR",
          status: "captured",
        }),
      });
    } catch (err) {
      console.error("⚠️ Failed to record payment:", err);
    }
    router.replace("/plan-builder?paid=true");
  }

  // Create order on server (server decides global price; no amount from client)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/razorpay/order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // no amount; server uses global price
        });
        const data = await res.json();
        if (data?.id) setOrder(data);
        else throw new Error(data?.error || "No order returned");
      } catch (err) {
        console.error("Order creation failed", err);
      }
    })();
  }, []);

  // Open Razorpay only after SDK is loaded AND we have an order
  useEffect(() => {
    if (!order?.id) return;
    (async () => {
      try {
        const Razorpay = await loadRazorpay();
        if (typeof Razorpay !== "function") throw new Error("Razorpay SDK not available");

        const rzp = new Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          order_id: order.id,           // amount comes from the order
          name: "WytMode",
          currency: "INR",
          handler: onRazorpaySuccess,
          prefill: { name: "", email: "" },
          theme: { color: "#0C4A6E" },
        });

        rzp.on("payment.failed", (resp: any) => {
          console.error("payment.failed", resp);
          alert("Payment failed. Please try again.");
        });

        rzp.open();
      } catch (e) {
        console.error(e);
        alert("Could not start payment. Please refresh and try again.");
      }
    })();
  }, [order]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      {!order ? <p className="text-lg">Preparing payment...</p> : <p className="text-lg">Opening checkout...</p>}
    </div>
  );
}
