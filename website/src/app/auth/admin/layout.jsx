export const metadata = {
  title: {
    default: "Website admin",
    template: "%s | Innoknowvex Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
