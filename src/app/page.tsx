import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Highlights from "@/components/Highlights";
import Partners from "@/components/Partners";
import Offerings from "@/components/Offerings";
import Programs from "@/components/Programs";
import Mentors from "@/components/Mentors";
import VideoBreak from "@/components/VideoBreak";
import ImpactStats from "@/components/ImpactStats";
import Testimonials from "@/components/Testimonials";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import ParticulierCTA from "@/components/ParticulierCTA";
import { faqs } from "@/lib/content";

const siteUrl = "https://www.hypethebeats.nl";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Hype The Beats",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description:
        "Muziekworkshops met meetbare impact voor gemeenten, scholen, zorginstellingen en jongerenorganisaties.",
      parentOrganization: { "@type": "Organization", name: "Vunga Film" },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Markengouw 53",
        addressLocality: "Amsterdam",
        addressCountry: "NL",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+31640040507",
        email: "hallo@hypethebeats.nl",
        contactType: "customer service",
        areaServed: "NL",
        availableLanguage: "Dutch",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        {/* Eerste scherm: op desktop vult de hero exact de viewport met de ticker onderaan.
            Op mobiel is er te veel inhoud voor één scherm, dus laten we alles natuurlijk stromen. */}
        <div className="flex flex-col md:h-[100svh] md:overflow-hidden">
          <div className="flex flex-col md:min-h-0 md:flex-1">
            <Hero />
          </div>
          <Ticker />
        </div>
        <Offerings />
        <Partners />
        <Highlights />
        <Programs />
        <ImpactStats />
        <Testimonials />
        <VideoBreak />
        <Mentors />
        <About />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <ParticulierCTA />
    </>
  );
}
