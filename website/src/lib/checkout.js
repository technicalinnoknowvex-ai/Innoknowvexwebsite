export function getSafePostAuthPath(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return "/auth/student/dashboard";
}

export function startCheckout({ courseName, planKey, programTitle, router }) {
  const query = new URLSearchParams({
    courseName,
    plan: planKey,
    programTitle,
  });
  const checkoutPath = `/checkout?${query.toString()}`;
  const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");

  if (!accessToken) {
    router.push(`/auth/student/login?next=${encodeURIComponent(checkoutPath)}`);
    return;
  }

  router.push(checkoutPath);
}
