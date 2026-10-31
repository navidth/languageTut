/**
 * Opens the payment gateway page from a purchase answer. Only http(s)
 * addresses are followed, so a malformed `payment_url` cannot run script.
 */
export function openPaymentPage(paymentUrl: string) {
  const url = new URL(paymentUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("نشانی درگاه پرداخت معتبر نیست.");
  }
  window.location.assign(url.toString());
}
