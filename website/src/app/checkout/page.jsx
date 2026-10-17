import { Suspense } from "react";
import CheckoutClient from "../../components/checkout/CheckoutClient";
import LoadingIndicator from "../../components/common/LoadingIndicator/LoadingIndicator";

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
    <Suspense fallback={<LoadingIndicator label="Loading secure checkout…" />}>
      <CheckoutClient />
    </Suspense>
  );
}
