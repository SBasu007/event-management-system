import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "../styles/globals.css";

export const metadata = {
  title: "EventZen",
  description: "Event management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="">
            <Navbar />
            <main className="">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}