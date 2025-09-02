let loader: Promise<any> | null = null;

export function loadRazorpay(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only load in the browser"));
  }
  if ((window as any).Razorpay) return Promise.resolve((window as any).Razorpay);
  if (loader) return loader;

  loader = new Promise((resolve, reject) => {
    const id = "rzp-checkout-sdk";
    if (document.getElementById(id)) {
      const check = () =>
        (window as any).Razorpay ? resolve((window as any).Razorpay) : setTimeout(check, 50);
      return check();
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve((window as any).Razorpay);
    s.onerror = () => reject(new Error("Failed to load Razorpay Checkout"));
    document.body.appendChild(s);
  });

  return loader;
}
