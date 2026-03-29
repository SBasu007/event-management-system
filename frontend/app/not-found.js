import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card not-found">
      <p className="eyebrow">404</p>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  );
}
