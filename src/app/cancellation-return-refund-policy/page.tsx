import { PageChrome } from "@/components/page-chrome";

const sections = [
  { title: "1. Order Cancellation", paragraphs: ["If you wish to cancel an order, contact us as soon as possible after placing it.", "A standard order may be cancelled if it has not yet been processed, packed or dispatched.", "Once an order has been dispatched, cancellation is generally no longer possible."] },
  { title: "2. Customised Orders", paragraphs: ["The following may not be cancellable once preparation or packing has begun:"], bullets: ["customised hampers;", "Build Your Own Box orders;", "personalised products;", "curated Mystery Scoops; and", "special made-to-order requests."], outro: "This is because products may already have been selected, prepared or packed specifically for the customer." },
  { title: "3. Change-of-Mind Returns", paragraphs: ["Because many Khazana Scoop orders include curated, customised, personal-use, gifting or hygiene-sensitive products, we generally do not accept returns simply because:"], bullets: ["the customer changed their mind;", "the customer no longer wants the product;", "a Mystery Scoop item was not their personal favourite;", "the customer expected a different mystery item;", "there is a minor colour variation caused by photography or screen settings; or", "an assorted design/colour differs where the product page clearly stated that variants may vary."], outro: "This does not apply where a product is damaged, defective, incorrect or materially different from what was represented." },
  { title: "4. Products Eligible for Review", paragraphs: ["Please contact us if you receive:"], bullets: ["a damaged product;", "a defective product;", "an incorrect product;", "a missing paid item;", "an incorrect quantity; or", "a product materially different from the product ordered."] },
  { title: "5. Reporting a Problem", paragraphs: ["Please contact us preferably within 48 hours of delivery so that we can investigate the issue promptly.", "Include:"], bullets: ["Order ID;", "name and phone number used for the order;", "description of the issue; and", "clear photographs of the product and packaging."], outro: "An unboxing video is strongly recommended, particularly for damaged, missing or incorrect-item claims, because it helps us verify what occurred during packing or transit. We may request additional information where reasonably necessary to review a claim." },
  { title: "6. Items That Cannot Normally Be Returned After Use", paragraphs: ["For hygiene and safety reasons, opened or used personal-use products normally cannot be returned unless they were defective when received.", "This may include products such as:"], bullets: ["beauty and self-care products;", "soaps;", "cosmetics;", "hair accessories after use; and", "other hygiene-sensitive products."] },
  { title: "7. Resolution", paragraphs: ["After reviewing an eligible claim, depending on the circumstances and product availability, we may offer:"], bullets: ["replacement;", "reshipment of a missing item;", "store credit, where accepted by the customer; or", "partial or full refund."], outro: "The appropriate resolution will depend on the nature of the issue." },
  { title: "8. Refund Method", paragraphs: ["Approved refunds for online payments will normally be initiated to the original payment method used for the order.", "We will not normally process an online payment refund to an unrelated bank account or payment instrument."] },
  { title: "9. Refund Processing Time", paragraphs: ["Once we approve and initiate a refund, the time taken for the amount to appear in your account depends on the payment method, payment gateway and banking system.", "Cashfree currently states that customer refunds typically take around 5–10 working days, depending on the payment method."] },
  { title: "10. Shipping Charges", paragraphs: ["Original shipping charges may not be refundable where an otherwise correctly fulfilled order is returned for a reason attributable to the customer.", "If the refund is due to a verified error by Khazana Scoop, such as an incorrect or defective item, the appropriate shipping treatment will be determined as part of the resolution."] },
  { title: "11. Sale / Promotional Products", paragraphs: ["Products purchased during a sale remain eligible for review if they arrive damaged, defective or incorrect.", "However, a discount alone does not create an entitlement to a change-of-mind return."] },
  { title: "12. Free Gifts and Promotional Items", paragraphs: ["Complimentary freebies or promotional gifts cannot generally be exchanged for cash.", "Where a complimentary item arrives damaged, we may decide whether replacement is reasonably available."] },
  { title: "13. Refund Abuse", paragraphs: ["Khazana Scoop reserves the right to investigate repeated, fraudulent or suspicious refund claims.", "This does not affect genuine customer complaints or applicable consumer rights."] },
];

export default function CancellationReturnRefundPolicyPage(): React.ReactElement {
  return (
    <PageChrome currentPath="/cancellation-return-refund-policy" title="Cancellation, Return & Refund Policy" subtitle="When cancellations, replacements, returns, and refunds may be available for Khazana Scoop orders.">
      <article className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">Last Updated: 16 August 2026</p>
        <p className="mt-5 text-base leading-8 text-[#627771]">We want customers to receive their Khazana Scoop orders in good condition and as described.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">This policy explains when cancellations, replacements, returns and refunds may be available.</p>
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
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">14. Contact for Cancellation or Refund</h2>
            <div className="mt-4 text-sm leading-7 text-[#627771]"><p>Contact:</p><p className="mt-4">Khazana Scoop</p><p className="mt-4">Email: khazanascoop@gmail.com<br />WhatsApp / Customer Support: +91 9871254544<br />Alternate Support Number: +91 98730 79479</p><p className="mt-4">Please mention your Order ID and registered phone number.</p></div>
          </section>
        </div>
      </article>
    </PageChrome>
  );
}
