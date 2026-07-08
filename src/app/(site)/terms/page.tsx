import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | KarmaKnocksBack",
  description: "Terms and Conditions for using KarmaKnocksBack platform.",
};

export default function TermsPage() {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By accessing and using KarmaKnocksBack (karmaknocksback.com), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform." },
    { title: "2. Platform Description", content: "KarmaKnocksBack is a Jain educational and entertainment platform providing spiritual games, learning resources, the Jain Learning Academy, and related content for families and children." },
    { title: "3. User Accounts", content: "You may create an account using email or Google Sign-In. You are responsible for maintaining the confidentiality of your account. Users must provide accurate information during registration. Accounts found with false information may be suspended." },
    { title: "4. Children's Privacy (COPPA)", content: "KarmaKnocksBack is designed to be family-friendly. Children under 13 should use this platform under parental supervision. We do not knowingly collect personal information from children under 13 without parental consent. Parents may contact us to review, delete, or restrict their child's data." },
    { title: "5. Acceptable Use", content: "You agree not to: (a) use the platform for any unlawful purpose; (b) attempt to gain unauthorized access to any part of the platform; (c) upload harmful, offensive, or inappropriate content; (d) impersonate others; (e) use automated systems to scrape or access the platform without permission." },
    { title: "6. Intellectual Property", content: "All content on KarmaKnocksBack — including games, educational materials, images, videos, and text — is the property of KarmaKnocksBack or its content suppliers. You may not reproduce, distribute, or create derivative works without written permission." },
    { title: "7. Educational Content", content: "The Jain Learning Academy and educational content are provided for informational and spiritual learning purposes. We strive for accuracy but make no warranties regarding the completeness of religious or philosophical information." },
    { title: "8. Third-Party Services", content: "We use YouTube for video content delivery. By using the Academy, you also agree to YouTube's Terms of Service. We use Google OAuth for sign-in. We use Turso for secure data storage." },
    { title: "9. Stars, Points & Virtual Currency", content: "Stars, Karma Points, Punya Points, and similar items earned on the platform are virtual and have no real-world monetary value. They cannot be exchanged for cash or transferred outside the platform." },
    { title: "10. Limitation of Liability", content: "KarmaKnocksBack shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. The platform is provided 'as is' without warranties of any kind." },
    { title: "11. Changes to Terms", content: "We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the platform after changes constitutes acceptance." },
    { title: "12. Contact Us", content: "For questions about these Terms, please contact us at: karmaknocksback@gmail.com" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-20">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">📋</div>
        <h1 className="font-display-hi text-3xl font-black text-amber-900 mb-2">Terms & Conditions</h1>
        <p className="font-sans text-sm text-gray-500">Last updated: July 2026</p>
      </div>
      <div className="space-y-6">
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <h2 className="font-sans font-black text-base text-amber-900 mb-3">{s.title}</h2>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl p-5 text-center" style={{background:"rgba(255,215,0,0.1)",border:"2px solid rgba(255,215,0,0.3)"}}>
        <p className="font-hindi text-sm text-amber-700">🙏 जय जिनेन्द्र! हमारे नियम पढ़ने के लिए धन्यवाद।</p>
        <p className="font-sans text-xs text-gray-500 mt-1">Thank you for being part of our spiritual learning community.</p>
      </div>
    </div>
  );
}
