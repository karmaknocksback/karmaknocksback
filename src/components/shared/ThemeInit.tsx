export default function ThemeInit() {
  const code = `
    try {
      var stored = localStorage.getItem('kkb-theme');
      var dark = stored === 'dark';
      if (dark) document.documentElement.classList.add('dark');
    } catch (e) {}
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
