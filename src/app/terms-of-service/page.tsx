import Link from "next/link";
import { PageChrome } from "@/components/page-chrome";

const sections = [
  {
    title: "1. About Khazana Scoop",
    paragraphs: [
      "Khazana Scoop is an online gifting and lifestyle store offering products including mystery scoops, build-your-own boxes, gift hampers, jewellery, hair accessories, stationery, beauty and self-care products, candles, soaps, keychains, charms, festive products and other gifting items.",
      "Products and collections may be added, removed, updated or modified from time to time.",
    ],
  },
  {
    title: "2. Product Information",
    paragraphs: ["We make reasonable efforts to ensure that product photographs, descriptions, prices and other information displayed on our website are accurate."],
    intro: "However:",
    bullets: [
      "Actual colours may vary slightly due to lighting, photography and screen settings.",
      "Certain handmade or decorative products may have minor variations.",
      "Packaging may occasionally vary depending on availability.",
      "Products containing assorted colours or designs may be supplied according to available stock where this is clearly mentioned on the product page.",
    ],
    outro: "Minor variations that do not materially affect the nature or functionality of a product will not be considered defects.",
  },
  {
    title: "3. Mystery Scoops",
    paragraphs: [
      "Mystery Scoops are intentionally surprise-based products.",
      "Customers may provide the preferences permitted for their selected scoop. We will make reasonable efforts to consider those preferences; however, preferences do not guarantee any specific product, design, colour or item unless expressly confirmed by Khazana Scoop.",
      "The exact contents of a Mystery Scoop may vary according to:",
    ],
    bullets: ["selected scoop size;", "customer preferences;", "product availability;", "stock;", "theme; and", "curation by Khazana Scoop."],
    outro: "A customer cannot request a return or refund solely because they did not personally like a mystery item received, provided the order reasonably matches the description and selected scoop category. This does not affect claims involving damaged, defective, incorrect or materially misdescribed products.",
  },
  {
    title: "4. Build Your Own Box and Customised Orders",
    paragraphs: [
      "For Build Your Own Box, customised hampers, personalised gifting and similar orders, customers are responsible for carefully reviewing their selections and information before submitting the order.",
      "Once preparation, personalisation or packing of a customised order has started, changes or cancellations may not always be possible.",
    ],
  },
  {
    title: "5. Pricing",
    paragraphs: [
      "All prices displayed on the website are in Indian Rupees (INR) unless otherwise stated.",
      "Prices may change without prior notice. However, a price change will not affect an order that has already been successfully placed and paid for, unless there has been an obvious technical or pricing error.",
      "Any applicable delivery charge will be displayed before the order is completed.",
    ],
  },
  {
    title: "6. Payments",
    paragraphs: [
      "Khazana Scoop accepts online payments through authorised third-party payment gateway providers, including Cashfree Payments, once enabled on the website.",
      "Available payment methods may include UPI, cards, net banking and other payment options supported by the payment gateway.",
      "We do not require customers to provide their UPI PIN, banking password or other banking authentication credentials directly to Khazana Scoop.",
      "An order will be treated as successfully paid only after the payment has been confirmed through our payment system.",
      "If money is deducted but the payment status remains unsuccessful or pending, please contact us with the relevant order/payment information so that the transaction can be reviewed.",
    ],
  },
  {
    title: "7. Order Acceptance",
    paragraphs: ["Submitting payment does not necessarily mean that an order has been finally accepted.", "We may cancel or contact you regarding an order in situations including:"],
    bullets: ["product becoming unavailable;", "incorrect pricing caused by a technical error;", "incomplete delivery information;", "suspected fraudulent activity;", "duplicate orders;", "inability to service the delivery location; or", "other circumstances that make fulfilment reasonably impossible."],
    outro: "If we cancel a successfully paid order for such a reason, the eligible amount will be refunded to the original payment method.",
  },
  {
    title: "8. Shipping",
    paragraphs: [
      "Khazana Scoop currently delivers across India to serviceable PIN codes.",
      "Shipping charges:",
    ],
    bullets: ["Orders of ₹500 or above — Free Shipping", "Orders below ₹500 — ₹80 shipping charge"],
    outro: "Most orders are expected to be delivered within approximately 5–6 days, although delivery times may vary depending on destination, courier availability, festive periods, weather, operational disruptions and other circumstances outside our reasonable control.",
  },
  {
    title: "9. Incorrect Address",
    paragraphs: ["Customers are responsible for providing a complete and correct:"],
    bullets: ["recipient name;", "phone number;", "address;", "city;", "state; and", "PIN code."],
    outro: "If an order cannot be delivered because incorrect or incomplete information was provided, additional shipping charges may apply if the customer requests reshipment.",
  },
  {
    id: "cancellation-returns-and-refunds",
    title: "10. Cancellation, Returns and Refunds",
    paragraphs: [
      "Cancellation, return and refund requests are governed by our Cancellation, Return & Refund Policy.",
      "Certain customised, curated, mystery, hygiene-sensitive or used/opened products may not be eligible for return merely because of change of mind.",
      "However, customers may contact us regarding products that arrive damaged, defective, incorrect or materially different from what was ordered.",
    ],
  },
  {
    title: "11. Promotions, Discounts and Freebies",
    paragraphs: ["Discount codes, promotional offers, lucky draws, free gifts, freebies or other promotional benefits:"],
    bullets: ["may be available for limited periods;", "may be subject to separate conditions;", "cannot normally be exchanged for cash;", "may not be combinable with other offers; and", "may be changed or withdrawn where permitted."],
    outro: "Free products provided as promotional gifts generally do not carry an independent cash value.",
  },
  { title: "12. Intellectual Property", paragraphs: ["All original website content belonging to Khazana Scoop, including our branding, photographs, graphics, product descriptions, designs, website content and promotional material, may not be copied, reproduced or commercially used without permission.", "Third-party trademarks, payment gateway names and other intellectual property remain the property of their respective owners."] },
  { title: "13. Prohibited Use", paragraphs: ["You must not use the website:"], bullets: ["for fraudulent transactions;", "to interfere with website security;", "to submit false order or delivery information;", "to attempt unauthorised access to the website or systems;", "to misuse promotions or payment systems; or", "for any unlawful activity."] },
  { title: "14. Limitation of Liability", paragraphs: ["Khazana Scoop will make reasonable efforts to provide accurate information and fulfil accepted orders properly.", "To the extent permitted by applicable law, we will not be responsible for losses caused solely by circumstances beyond our reasonable control, including courier disruptions, network failures, payment-system outages or force majeure events.", "Nothing in these Terms is intended to restrict any rights or remedies that cannot legally be excluded."] },
  { title: "15. Changes to These Terms", paragraphs: ["We may update these Terms and Conditions from time to time. The revised version will be published on this website with an updated revision date."] },
  { title: "16. Governing Law", paragraphs: ["These Terms shall be governed by the applicable laws of India."] },
];

export default function TermsOfServicePage(): React.ReactElement {
  return (
    <PageChrome currentPath="/terms-of-service" title="Terms & Conditions" subtitle="The terms that apply when you browse, shop, or place an order with Khazana Scoop.">
      <article className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">Last Updated: 16 August 2026</p>
        <p className="mt-5 text-base leading-8 text-[#627771]">Welcome to Khazana Scoop. These Terms and Conditions govern your access to and use of our website, products, services, and purchases.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">Khazana Scoop is owned and operated by Pari Rajput. By accessing our website or placing an order with us, you agree to these Terms and Conditions.</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section id={section.id} key={section.title} className="scroll-mt-28">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p className="mt-4 text-sm leading-7 text-[#627771]" key={paragraph}>{paragraph}</p>)}
              {section.intro ? <p className="mt-4 text-sm leading-7 text-[#627771]">{section.intro}</p> : null}
              {section.bullets ? <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[#627771]">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              {section.outro ? <p className="mt-4 text-sm leading-7 text-[#627771]">{section.outro}</p> : null}
              {section.title.startsWith("8.") ? <p className="mt-4 text-sm leading-7 text-[#627771]">More information is available in our <Link className="font-semibold text-[#6f58a8] underline" href="/shipping-delivery-policy">Shipping &amp; Delivery Policy</Link>.</p> : null}
              {section.title.startsWith("10.") ? <p className="mt-4 text-sm leading-7 text-[#627771]">Read our <Link className="font-semibold text-[#6f58a8] underline" href="/cancellation-return-refund-policy">Cancellation, Return &amp; Refund Policy</Link>.</p> : null}
            </section>
          ))}
          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">17. Contact</h2>
            <div className="mt-4 text-sm leading-7 text-[#627771]">
              <p>For questions regarding these Terms:</p><p className="mt-4">Khazana Scoop<br />Owned and operated by Pari Rajput</p><p className="mt-4">Email: khazanascoop@gmail.com<br />WhatsApp / Customer Support: +91 9871254544<br />Alternate Support Number: +91 9873078479<br />Address: Main Sagarpur, New Delhi : 110046</p>
            </div>
          </section>
        </div>
      </article>
    </PageChrome>
  );
}
