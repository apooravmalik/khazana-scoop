import { Mail, MessageCircle, PackageCheck } from "lucide-react";
import { PageChrome } from "@/components/page-chrome";

export default function ContactPage(): React.ReactElement {
  return (
    <PageChrome
      currentPath="/contact"
      heroAside={
        <div className="rounded-[28px] border border-white/75 bg-white/84 p-5 shadow-[0_20px_44px_rgba(124,146,140,0.14)] backdrop-blur">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#6d807a]">Customer Support</p>
          <p className="mt-3 text-sm leading-7 text-[#5d746d]">
            For order, delivery, payment, and product-related questions.
          </p>
        </div>
      }
      title="Contact Khazana Scoop"
      subtitle="We'd love to help with your order, delivery, payment or product-related questions."
    >
      <article className="rounded-[32px] border border-[#ece3d9] bg-white p-6 shadow-[0_24px_58px_rgba(118,140,134,0.12)] sm:p-8 lg:p-10">
        <div className="grid gap-4 md:grid-cols-3">
          <ContactCard
            icon={<Mail size={20} />}
            title="Email"
            body={<a className="hover:underline" href="mailto:khazanascoop@gmail.com">khazanascoop@gmail.com</a>}
          />
          <ContactCard
            icon={<MessageCircle size={20} />}
            title="WhatsApp / Customer Support"
            body={<a className="hover:underline" href="https://wa.me/919871254544" rel="noreferrer" target="_blank">+91 9871254544</a>}
          />
          <ContactCard icon={<PackageCheck size={20} />} title="Alternate Support Number" body="+91 98730 79479" />
        </div>

        <section className="mt-8 rounded-[24px] bg-[#fff8f8] p-5">
          <h2 className="text-lg font-black tracking-[-0.03em] text-[#35534d]">Customer Support</h2>
          <p className="mt-3 text-sm leading-7 text-[#627771]">Main Sagarpur, New Delhi - 110046</p>
        </section>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">Order Support</h2>
            <p className="mt-4 text-sm leading-7 text-[#627771]">For faster assistance regarding an existing order, please share:</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-[#627771]">
              <li>your Order ID;</li>
              <li>name used while ordering;</li>
              <li>registered phone number; and</li>
              <li>a short description of your concern.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">Payment Support</h2>
            <p className="mt-4 text-sm leading-7 text-[#627771]">If your payment has been deducted but your order does not show as successfully paid, please do not make repeated payments immediately.</p>
            <p className="mt-4 text-sm leading-7 text-[#627771]">Contact us with your Order ID/payment details so that we can check the transaction status.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">Damaged or Incorrect Orders</h2>
            <p className="mt-4 text-sm leading-7 text-[#627771]">For damaged, defective, missing or incorrect products, please contact us as soon as possible with photographs and your Order ID.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#35534d]">Customer Grievances</h2>
            <p className="mt-4 text-sm leading-7 text-[#627771]">Customer concerns can be sent to:</p>
            <p className="mt-4 text-sm leading-7 text-[#627771]">
              Email: <a className="hover:underline" href="mailto:khazanascoop@gmail.com">khazanascoop@gmail.com</a><br />
              WhatsApp / Customer Support: <a className="hover:underline" href="https://wa.me/919871254544" rel="noreferrer" target="_blank">+91 9871254544</a><br />
              Alternate Support Number: +91 98730 79479
            </p>
            <p className="mt-4 text-sm leading-7 text-[#627771]">We will make reasonable efforts to review and respond to customer concerns promptly.</p>
          </section>
        </div>
      </article>
    </PageChrome>
  );
}

function ContactCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }): React.ReactElement {
  return (
    <div className="rounded-[28px] border border-[#ece3d9] bg-white p-5 shadow-[0_18px_48px_rgba(118,140,134,0.12)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgba(24,165,158,0.1)] text-[var(--teal)]">{icon}</span>
      <strong className="mt-4 block text-lg tracking-[-0.03em] text-[#35534d]">{title}</strong>
      <span className="mt-2 block text-sm leading-7 text-[#667b75]">{body}</span>
    </div>
  );
}
