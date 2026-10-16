import { Suspense } from "react";
import CheckoutClient from "../../components/checkout/CheckoutClient";

export const metadata = {
  title: "Secure checkout",
  description: "Complete your Innoknowvex program enrollment.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main aria-busy="true">Loading secure checkout…</main>}>
      <CheckoutClient />
    </Suspense>
  );
}
