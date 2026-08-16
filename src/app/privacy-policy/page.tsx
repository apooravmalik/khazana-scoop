import { PageChrome } from "@/components/page-chrome";

const sections = [
  { title: "1. Information We May Collect", paragraphs: ["When you browse our website, contact us or place an order, we may collect information such as:"], bullets: ["name;", "email address;", "phone number;", "delivery address;", "city;", "state;", "PIN code;", "order details;", "product preferences;", "gift messages or customisation information;", "payment transaction reference;", "payment status;", "communications sent to customer support; and", "basic technical information necessary to operate and secure the website."] },
  { title: "2. Payment Information", paragraphs: ["Payments may be processed through third-party payment providers such as Cashfree Payments.", "Your payment provider may independently collect information required to process your transaction.", "Khazana Scoop does not need access to sensitive banking authentication information such as your UPI PIN, OTP, CVV or banking password.", "We may receive transaction-related information such as:"], bullets: ["payment status;", "payment reference/ID;", "amount paid;", "payment method category; and", "refund status."] },
  { title: "3. How We Use Your Information", paragraphs: ["Your information may be used to:"], bullets: ["process and fulfil orders;", "deliver products;", "contact you regarding an order;", "provide order updates;", "process eligible cancellations or refunds;", "provide customer support;", "personalise Mystery Scoops or customised boxes based on information you provide;", "prevent fraud and misuse;", "maintain transaction and business records;", "improve our website and services;", "comply with applicable legal obligations; and", "send promotional communication where you have chosen to receive it or where otherwise permitted."] },
  { title: "4. Sharing of Information", paragraphs: ["We may share information only where reasonably necessary with service providers involved in operating our business, such as:"], bullets: ["payment gateways;", "courier and logistics providers;", "website hosting providers;", "technology providers;", "communication providers; and", "professional or regulatory authorities where required."], outro: "These parties may process information necessary to perform their respective services. We do not sell your personal information to advertisers." },
  { title: "5. Shipping Information", paragraphs: ["To deliver an order, necessary details such as the recipient's name, phone number, delivery address and PIN code may be shared with the courier or logistics provider assigned to the shipment."] },
  { title: "6. Cookies and Website Data", paragraphs: ["Our website may use cookies or similar technologies necessary for functions such as:"], bullets: ["maintaining the shopping cart;", "remembering website preferences;", "security;", "analytics;", "performance; and", "understanding how the website is used."], outro: "Where legally required, appropriate choices or consent mechanisms may be provided." },
  { title: "7. Data Retention", paragraphs: ["We retain personal information only for as long as reasonably necessary for the purposes for which it was collected, including order fulfilment, customer support, accounting, fraud prevention and applicable legal or regulatory requirements.", "Information that is no longer required may be deleted or anonymised where appropriate."] },
  { title: "8. Data Security", paragraphs: ["We take reasonable technical and organisational measures to protect customer information against unauthorised access, misuse, alteration or disclosure.", "However, no online system or transmission method can be guaranteed to be completely secure."] },
  { title: "9. Your Information and Choices", paragraphs: ["You may contact us to request, where applicable:"], bullets: ["access to information we hold about you;", "correction of inaccurate information;", "updating of your information;", "deletion of information that is no longer required to be retained;", "withdrawal of optional marketing consent; or", "assistance with a privacy-related concern."], outro: "The DPDP framework provides rights relating to access, correction, updating, erasure and grievance redressal, subject to applicable provisions and lawful retention requirements." },
  { title: "10. Marketing Communications", paragraphs: ["If you receive optional promotional messages from us, you may request to stop receiving such promotional communications.", "Transactional messages relating to an existing order may still be sent where necessary to fulfil the order or provide support."] },
  { title: "11. Children's Privacy", paragraphs: ["Our website is intended to be used responsibly. Customers below the age required to independently enter into transactions should place orders with the involvement of a parent or legal guardian.", "We do not knowingly use children's personal information for targeted advertising."] },
  { title: "12. Third-Party Services", paragraphs: ["Our website may contain links or integrations involving third-party services.", "Their handling of information may be governed by their own privacy policies, and Khazana Scoop does not control independent third-party privacy practices."] },
  { title: "13. Changes to This Policy", paragraphs: ["We may update this Privacy Policy when our services, technology or legal requirements change.", "The latest version will be displayed on this page with the updated date."] },
];

export default function PrivacyPolicyPage(): React.ReactElement {
  return (
    <PageChrome currentPath="/privacy-policy" title="Privacy Policy" subtitle="How Khazana Scoop collects, uses, stores, and shares customer information.">
      <article className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 lg:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#708680]">Last Updated: 16 August 2026</p>
        <p className="mt-5 text-base leading-8 text-[#627771]">Khazana Scoop respects your privacy and is committed to handling personal information responsibly.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">Khazana Scoop is owned and operated by Pari Rajput.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">This Privacy Policy explains what information we may collect when you use our website, why we collect it and how it may be used or shared.</p>
        <p className="mt-4 text-base leading-8 text-[#627771]">India&apos;s digital-data framework provides for purposes-based processing, clear notices, reasonable security safeguards, correction/erasure rights and grievance mechanisms as applicable.</p>
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
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">14. Privacy Contact</h2>
            <div className="mt-4 text-sm leading-7 text-[#627771]"><p>For privacy-related requests or questions:</p><p className="mt-4">Khazana Scoop<br />Owned and operated by Pari Rajput</p><p className="mt-4">Email: khazanascoop@gmail.com<br />WhatsApp / Customer Support: +91 9871254544<br />Alternate Support Number: +91 9873078479</p></div>
          </section>
        </div>
      </article>
    </PageChrome>
  );
}
