import './style.css'

const app = document.getElementById('app')

app.innerHTML = `
  <header>
    <h1>TinyCoder</h1>
    <p>Web Toolbox — developer utilities in your browser</p>
  </header>
  <main>
    <section class="tools">
      <div class="tool-card" data-tool="json">
        <h2>JSON Formatter</h2>
        <p>Format, validate, and minify JSON</p>
      </div>
      <div class="tool-card" data-tool="base64">
        <h2>Base64 Encoder</h2>
        <p>Encode and decode Base64 strings</p>
      </div>
      <div class="tool-card" data-tool="regex">
        <h2>Regex Tester</h2>
        <p>Test regular expressions with live highlights</p>
      </div>
      <div class="tool-card" data-tool="url">
        <h2>URL Encoder</h2>
        <p>Encode and decode URLs</p>
      </div>
      <div class="tool-card" data-tool="uuid">
        <h2>UUID Generator</h2>
        <p>Generate UUIDs instantly</p>
      </div>
    </section>
  </main>
  <footer>
    <p>Privacy-first. Client-side only. Zero backend.</p>
  </footer>
`

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('Service Worker registered')
    }).catch((err) => {
      console.log('Service Worker registration failed:', err)
    })
  })
}