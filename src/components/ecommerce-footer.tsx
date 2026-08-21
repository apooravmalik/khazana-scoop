import Link from "next/link";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Mystery Scoop", href: "/mystery-scoops" },
      { label: "Build Your Box", href: "/build-your-own-scoop" },
      { label: "Products", href: "/products" },
      { label: "Gift Hampers", href: "/hampers" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: "/tracking" },
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping & Delivery", href: "/shipping-delivery-policy" },
      { label: "Cancellation & Refunds", href: "/cancellation-return-refund-policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

export function EcommerceFooter(): React.ReactElement {
  return (
    <footer className="site-footer">
      <div className="site-footer-container">
        <section className="footer-links-region" aria-label="Footer navigation">
          <div className="footer-logo-column">
            <Link className="footer-brand-name focus-ring" href="/">
              Khazana Scoop
            </Link>
            <p>Cute finds, thoughtful gifts & little surprises.</p>
          </div>

          <div className="footer-link-grid">
            {footerGroups.map((group) => (
              <div className="footer-link-group" key={group.title}>
                <h3>{group.title}</h3>
                {group.links.length > 0 ? (
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="footer-bottom-bar">
          <p className="footer-copyright">© 2026 Khazana Scoop. All rights reserved.</p>
        </section>
      </div>
    </footer>
  );
}
