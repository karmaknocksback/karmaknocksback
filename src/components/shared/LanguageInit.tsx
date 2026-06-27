export default function LanguageInit() {
  const code = `
    try {
      var stored = localStorage.getItem('kkb-lang');
      if (stored === 'en') document.documentElement.lang = 'en';
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
