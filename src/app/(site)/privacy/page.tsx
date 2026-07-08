import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | KarmaKnocksBack",
  description: "Privacy Policy for KarmaKnocksBack platform.",
};

export default function PrivacyPage() {
  const sections = [
    { title: "1. Information We Collect", content: "We collect: (a) Account information — name, email address, and optional location when you register; (b) Usage data — games played, courses watched, quiz results, stars earned; (c) Progress data — video watch percentages, quiz attempts, learning streaks; (d) Technical data — device type, browser type, IP address (for security only)." },
    { title: "2. How We Use Your Information", content: "We use your information to: provide and improve our services; track your learning progress; award stars and certificates; display leaderboards; send educational notifications; improve game and course recommendations; ensure platform security." },
    { title: "3. Google Sign-In", content: "If you sign in with Google, we receive your name, email, and profile picture from Google. We do not receive your Google password. Your Google data is governed by Google's Privacy Policy in addition to ours." },
    { title: "4. Data Storage & Security", content: "Your data is stored securely using Turso (SQLite cloud database). Passwords are encrypted using bcrypt hashing. JWT tokens are used for secure authentication. We implement industry-standard security measures to protect your data." },
    { title: "5. Children's Privacy", content: "We are committed to protecting children's privacy. Users under 13 should use the platform with parental supervision. We do not knowingly collect personal data from children under 13 without parental consent. Parents can request data deletion by contacting us." },
    { title: "6. Cookies & Local Storage", content: "We use browser local storage to remember your player name and preferences across sessions. We use secure HTTP-only cookies for authentication tokens. We do not use advertising cookies or tracking cookies from third parties." },
    { title: "7. Data Sharing", content: "We do not sell your personal information. We do not share your data with advertisers. We may share data with: YouTube (for video delivery); Google (for sign-in); service providers helping us operate the platform. We may disclose data if required by law." },
    { title: "8. Your Rights", content: "You have the right to: access your personal data; correct inaccurate data; delete your account and data; export your data; opt out of email notifications. Contact us at karmaknocksback@gmail.com to exercise these rights." },
    { title: "9. Data Retention", content: "We retain your account data as long as your account is active. Learning progress, quiz results, and stars are retained to provide continuity. If you delete your account, we remove your personal data within 30 days." },
    { title: "10. Third-Party Services", content: "YouTube: Videos are embedded from YouTube. YouTube's privacy policy applies to video viewing. Google OAuth: Sign-in via Google is governed by Google's Privacy Policy. Turso: Database provider with enterprise security." },
    { title: "11. Changes to Privacy Policy", content: "We may update this policy. Changes will be posted here with an updated date. Significant changes will be notified via email if you have an account." },
    { title: "12. Contact Us", content: "For privacy concerns or data requests: Email: karmaknocksback@gmail.com | Website: karmaknocksback.com | We respond to all privacy requests within 7 business days." },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-20">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🔐</div>
        <h1 className="font-display-hi text-3xl font-black text-amber-900 mb-2">Privacy Policy</h1>
        <p className="font-sans text-sm text-gray-500">Last updated: July 2026 · Effective immediately</p>
      </div>
      <div className="space-y-6">
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm" style={{border:"2px solid rgba(255,215,0,0.2)"}}>
            <h2 className="font-sans font-black text-base text-amber-900 mb-3">{s.title}</h2>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl p-5 text-center" style={{background:"rgba(76,175,80,0.1)",border:"2px solid rgba(76,175,80,0.3)"}}>
        <p className="font-sans text-sm font-bold text-green-700">🛡️ Your privacy matters to us. We handle your data with care and respect.</p>
        <p className="font-hindi text-xs text-green-600 mt-1">आपकी गोपनीयता हमारी प्राथमिकता है।</p>
      </div>
    </div>
  );
}
