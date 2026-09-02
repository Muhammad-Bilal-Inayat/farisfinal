const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const loader = `
      <style>
        #initial-loader {
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: #ffffff; display: flex; flex-direction: column;
          align-items: center; justify-content: center; z-index: 99999;
          font-family: sans-serif;
        }
        .spinner {
          width: 50px; height: 50px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #087A5A;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
      <div id="initial-loader">
        <div class="spinner"></div>
        <div style="margin-top: 15px; color: #087A5A; font-weight: bold;">Faris VIP Umrah Transport</div>
      </div>
`;

if (!html.includes('initial-loader')) {
  html = html.replace('<div id="root"></div>', `<div id="root">${loader}</div>`);
  fs.writeFileSync('index.html', html);
  console.log('Added loader to index.html');
}
