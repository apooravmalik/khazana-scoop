import { PageChrome } from "@/components/page-chrome";

const sections = [
  { title: "1. Shipping Coverage", paragraphs: ["We offer delivery across India, subject to courier serviceability at the customer's PIN code.", "Certain remote or restricted areas may experience longer delivery times or may not be serviceable."] },
  { title: "2. Shipping Charges", paragraphs: ["Our standard shipping charges are:"], bullets: ["Orders of ₹500 or above: FREE shipping", "Orders below ₹500: ₹80 shipping charge"], outro: "The applicable shipping charge will be shown during checkout before payment." },
  { title: "3. Delivery Time", paragraphs: ["Most orders are expected to be delivered within approximately 5–6 days.", "Delivery timelines are estimates and may vary because of:"], bullets: ["delivery location;", "courier availability;", "public holidays;", "festivals;", "high-volume periods;", "weather;", "natural events;", "transport disruption; or", "circumstances outside our reasonable control."], outro: "We will make reasonable efforts to ensure your order reaches you as quickly as possible." },
  { title: "4. Customised and Special Orders", paragraphs: ["Customised hampers, personalised orders, Mystery Scoops or made-to-order products may require additional preparation time where applicable.", "Any significant additional preparation period will be communicated where reasonably possible."] },
  { title: "5. Tracking", paragraphs: ["Where shipment tracking is available, tracking details may be shared through the website, email, SMS, WhatsApp or another contact method provided with the order.", "Tracking information can sometimes take time to update after a courier pickup."] },
  { title: "6. Incorrect or Incomplete Addresses", paragraphs: ["Customers must provide complete and accurate delivery details.", "Please verify your:"], bullets: ["recipient name;", "mobile number;", "house/flat number;", "street/locality;", "city;", "state; and", "PIN code."], outro: "If you notice an error, contact us as soon as possible. Once an order has been dispatched, we cannot guarantee that the delivery address can be changed." },
  { title: "7. Failed Delivery / Return to Origin", paragraphs: ["If delivery fails because:"], bullets: ["the address provided was incorrect;", "the recipient was repeatedly unavailable;", "the recipient refused delivery; or", "the courier could not contact the recipient,"], outro: "the package may be returned to us. If the customer requests reshipment after a return caused by incorrect customer information or recipient unavailability, additional shipping charges may apply." },
  { title: "8. Delayed Orders", paragraphs: ["A delay caused by the courier does not automatically mean that an order is lost.", "Please contact us if your order has significantly exceeded the expected delivery period and we will assist in checking the shipment status."] },
  { title: "9. Lost Packages", paragraphs: ["If a courier confirms that a shipment has been lost in transit, we will review the order and provide an appropriate resolution, which may include replacement or refund depending on product availability and circumstances."] },
  { title: "10. Damaged Packages", paragraphs: ["If your order arrives visibly damaged, please photograph the package before discarding the packaging and contact us promptly.", "Clear photographs and/or an unboxing video can help us resolve the issue with the courier or fulfilment team."] },
];

export default function ShippingDeliveryPolicyPage(): React.ReactElement {
  return (
    <PageChrome currentPath="/shipping-delivery-policy" title="Shipping & Delivery Policy" subtitle="How Khazana Scoop ships orders and supports delivery across India.">
      <article className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">Last Updated: 16 August 2026</p>
        <p className="mt-5 text-base leading-8 text-[#627771]">This Shipping &amp; Delivery Policy applies to orders placed through the Khazana Scoop website.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">Khazana Scoop is owned and operated by Pari Rajput.</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p className="mt-4 text-sm leading-7 text-[#627771]" key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[#627771]">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              {section.outro ? <p className="mt-4 text-sm leading-7 text-[#627771]">{section.outro}</p> : null}
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">11. Contact</h2>
            <div className="mt-4 text-sm leading-7 text-[#627771]"><p>For shipping assistance:</p><p className="mt-4">Email: khazanascoop@gmail.com<br />WhatsApp / Customer Support: +91 9871254544<br />Alternate Support Number: +91 98730 79479</p><p className="mt-4">Please provide your Order ID when contacting us.</p></div>
          </section>
        </div>
      </article>
    </PageChrome>
  );
}
