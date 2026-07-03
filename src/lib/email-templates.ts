/**
 * Beautiful HTML email templates for KarmaKnocksBack
 * All templates share a consistent spiritual gold/maroon brand design.
 */

const BRAND_COLOR = "#c89b3c";
const DARK_BG = "#1a0800";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://karmaknocksback.com";

function baseTemplate(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KarmaKnocksBack</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: ${DARK_BG}; padding: 32px 40px; text-align: center; }
    .header-logo { font-size: 13px; letter-spacing: 3px; color: ${BRAND_COLOR}; text-transform: uppercase; margin-bottom: 4px; }
    .header-title { font-size: 26px; color: #fff9f0; font-weight: 600; }
    .header-divider { width: 40px; height: 2px; background: ${BRAND_COLOR}; margin: 12px auto 0; }
    .body { background: #ffffff; padding: 40px; }
    .greeting { font-size: 18px; color: #1a0800; font-weight: 600; margin-bottom: 8px; }
    .text { font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 16px; }
    .highlight-box { background: #fff9f0; border-left: 4px solid ${BRAND_COLOR}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight-box p { font-size: 14px; color: #333; line-height: 1.6; }
    .detail-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .detail-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0ebe0; }
    .detail-table td:first-child { color: #888; width: 35%; }
    .detail-table td:last-child { color: #222; font-weight: 500; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f7d8a3, ${BRAND_COLOR}); color: #1a0800; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 999px; margin: 20px 0; }
    .divider { height: 1px; background: #f0ebe0; margin: 24px 0; }
    .footer { background: #f5f0e8; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 11px; color: #999; line-height: 1.6; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; }
    .mantra { font-size: 16px; color: ${BRAND_COLOR}; text-align: center; letter-spacing: 1px; padding: 16px; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#f5f0e8;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="wrapper">
    <div class="header">
      <p class="header-logo">🕉️ KarmaKnocksBack</p>
      <p class="header-title">कर्म की वापसी</p>
      <div class="header-divider"></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p class="mantra">🙏 णमो अरिहंताणं 🙏</p>
      <div style="height:12px;"></div>
      <p>
        <a href="${SITE_URL}">karmaknocksback.com</a> &nbsp;|&nbsp;
        <a href="${SITE_URL}/jap-library">जाप लाइब्रेरी</a> &nbsp;|&nbsp;
        <a href="${SITE_URL}/karma-mirror">Karma Mirror</a>
      </p>
      <p style="margin-top:8px;">© 2026 KarmaKnocksBack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ---- 1. Contact Message Acknowledgment ----
export function contactAckTemplate(name: string, subject: string): string {
  return baseTemplate(`
    <p class="greeting">नमस्ते ${name} जी 🙏</p>
    <p class="text">आपका संदेश हमें प्राप्त हो गया है। हम जल्द से जल्द उत्तर देने का प्रयास करेंगे।</p>

    <div class="highlight-box">
      <p><strong>विषय:</strong> ${subject}</p>
    </div>

    <p class="text">हमारी टीम सामान्यतः <strong>24–48 घंटों</strong> में उत्तर देती है।</p>
    <p class="text">इस बीच आप हमारी जाप लाइब्रेरी का आनंद ले सकते हैं:</p>

    <div style="text-align:center;">
      <a href="${SITE_URL}/jap-library" class="btn">जाप लाइब्रेरी खोलें</a>
    </div>

    <div class="divider"></div>
    <p class="text" style="font-size:13px;color:#888;">यह एक स्वचालित संदेश है। कृपया इसका उत्तर न दें।</p>
  `, `आपका संदेश प्राप्त हुआ — ${name} जी`);
}

// ---- 2. Custom Jap Request Acknowledgment ----
export function customJapAckTemplate(name: string, purpose: string): string {
  return baseTemplate(`
    <p class="greeting">नमस्ते ${name} जी 🙏</p>
    <p class="text">आपका Custom Jap Request हमें प्राप्त हो गया है। हम आपकी आवश्यकता के अनुसार जाप तैयार करने पर कार्य करेंगे।</p>

    <div class="highlight-box">
      <p><strong>उद्देश्य:</strong> ${purpose}</p>
    </div>

    <table class="detail-table">
      <tr><td>प्रतीक्षा समय</td><td>3–7 कार्यदिवस</td></tr>
      <tr><td>संपर्क माध्यम</td><td>Email / WhatsApp</td></tr>
      <tr><td>भुगतान</td><td>जाप तैयार होने के बाद</td></tr>
    </table>

    <p class="text">जब आपका जाप तैयार होगा, हम आपको सूचित करेंगे और भुगतान लिंक भेजेंगे।</p>

    <div style="text-align:center;">
      <a href="${SITE_URL}/jap-library" class="btn">अन्य जाप सुनें</a>
    </div>
  `, `Custom Jap Request प्राप्त — ${name} जी`);
}

// ---- 3. Admin notification for new request ----
export function adminNotificationTemplate(type: string, details: Record<string, string>): string {
  const rows = Object.entries(details)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v || "—"}</td></tr>`)
    .join("");

  return baseTemplate(`
    <p class="greeting">नया ${type} 🔔</p>
    <p class="text">एक नया अनुरोध प्राप्त हुआ है। कृपया नीचे विवरण देखें:</p>

    <table class="detail-table">${rows}</table>

    <div style="text-align:center;">
      <a href="${SITE_URL}/admin" class="btn">Admin Panel खोलें</a>
    </div>
  `, `नया ${type} प्राप्त हुआ`);
}

// ---- 4. Karma Mirror Report Ready ----
export function karmaReportTemplate(name: string, archetypeHi: string, sessionId: string): string {
  const reportUrl = `${SITE_URL}/karma-mirror/results/${sessionId}`;
  return baseTemplate(`
    <p class="greeting">नमस्ते ${name} जी 🙏</p>
    <p class="text">आपकी <strong>Karma Mirror रिपोर्ट</strong> तैयार है!</p>

    <div class="highlight-box">
      <p style="font-size:18px;font-weight:700;color:#1a0800;margin-bottom:4px;">${archetypeHi}</p>
      <p style="font-size:13px;color:#666;">आपका Karma Mirror आर्किटाइप</p>
    </div>

    <p class="text">यह रिपोर्ट आपके 48 प्रश्नों के उत्तरों के आधार पर तैयार की गई है। इसमें आपके कषाय-स्वर, भावनात्मक पैटर्न और आत्मशुद्धि के उपाय शामिल हैं।</p>

    <div style="text-align:center;">
      <a href="${reportUrl}" class="btn">पूरी रिपोर्ट देखें</a>
    </div>

    <p class="text" style="font-size:13px;color:#888;">या यह लिंक खोलें: <a href="${reportUrl}" style="color:${BRAND_COLOR};">${reportUrl}</a></p>

    <div class="divider"></div>
    <p class="text">यदि आप अपनी पूरी रिपोर्ट अनलॉक करना चाहते हैं, तो ₹99 में उपलब्ध है।</p>
  `, `आपकी Karma Mirror रिपोर्ट तैयार है — ${archetypeHi}`);
}

// ---- 5. Payment Confirmation ----
export function paymentConfirmTemplate(name: string, amount: string, note: string, referenceCode: string): string {
  return baseTemplate(`
    <p class="greeting">नमस्ते ${name} जी 🙏</p>
    <p class="text">आपका भुगतान सफलतापूर्वक प्राप्त हो गया है। धन्यवाद!</p>

    <div class="highlight-box">
      <p style="font-size:24px;font-weight:700;color:${BRAND_COLOR};">✓ ₹${amount}</p>
      <p style="font-size:13px;color:#666;margin-top:4px;">${note}</p>
    </div>

    <table class="detail-table">
      <tr><td>Reference Code</td><td>${referenceCode}</td></tr>
      <tr><td>स्थिति</td><td style="color:green;font-weight:600;">✓ भुगतान सफल</td></tr>
    </table>

    <div style="text-align:center;">
      <a href="${SITE_URL}" class="btn">KarmaKnocksBack खोलें</a>
    </div>
  `, `भुगतान सफल — ₹${amount}`);
}
