const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The messed up part starts around <div id="root">
const correctRoot = `<div id="root">
      <!-- Mobile-optimized Critical App Shell -->
      <div id="app-shell-header">
        <div class="shell-logo-box"></div>
        <div class="shell-menu-box"></div>
      </div>
      <div class="shell-hero-placeholder">
        <div class="shell-title"></div>
        <div class="shell-title" style="width: 40%"></div>
      </div>
    </div>`;

// Replace everything from <div id="root"> to the script tag with correctRoot + script tag
html = html.replace(/<div id="root">[\s\S]*?<script type="module" src="\/src\/main\.tsx"><\/script>/, correctRoot + '\n    <script type="module" src="/src/main.tsx"></script>');

fs.writeFileSync('index.html', html);
