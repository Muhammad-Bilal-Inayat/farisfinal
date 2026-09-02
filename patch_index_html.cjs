const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const criticalCSS = `
    <!-- Critical CSS for Mobile App Shell -->
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #F1F4F8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        overflow-x: hidden;
      }
      #app-shell-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 64px; /* Mobile header height */
        background-color: #087A5A; /* saudi-green */
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      @media (min-width: 768px) {
        #app-shell-header { height: 80px; padding: 0 32px; }
      }
      .shell-logo-box {
        width: 140px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        animation: shell-pulse 1.5s infinite;
      }
      .shell-menu-box {
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
      }
      .shell-hero-placeholder {
        margin-top: 64px;
        width: 100%;
        height: 300px;
        background: linear-gradient(135deg, #05513F 0%, #087A5A 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .shell-title {
        width: 60%;
        height: 24px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        margin-bottom: 16px;
        animation: shell-pulse 1.5s infinite;
      }
      @keyframes shell-pulse {
        0% { opacity: 0.6; }
        50% { opacity: 0.3; }
        100% { opacity: 0.6; }
      }
    </style>
`;

// Inject critical CSS right before </head>
html = html.replace('</head>', criticalCSS + '</head>');

// Replace the old initial-loader with the new app shell
const newRootContent = `
      <!-- Mobile-optimized Critical App Shell -->
      <div id="app-shell-header">
        <div class="shell-logo-box"></div>
        <div class="shell-menu-box"></div>
      </div>
      <div class="shell-hero-placeholder">
        <div class="shell-title"></div>
        <div class="shell-title" style="width: 40%"></div>
      </div>
`;

html = html.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root">' + newRootContent + '</div>');

fs.writeFileSync('index.html', html);
