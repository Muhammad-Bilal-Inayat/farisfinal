const fs = require('fs');
let content = fs.readFileSync('src/components/QuickBookPills.tsx', 'utf8');

if (!content.includes('lucide-react')) {
  content = content.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, Link } from 'react-router-dom';\nimport { ArrowRight } from 'lucide-react';");
}

const target = `<h2 className="text-2xl md:text-3xl font-extrabold text-center mb-8 text-[var(--color-dark-charcoal)]">
        {isAr ? 'احجز أسطولك الآن' : 'Book Your Fleet'}
      </h2>`;
const replacement = `<Link to="/routes-rates" className="block w-fit mx-auto group mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-[var(--color-dark-charcoal)] group-hover:text-[var(--color-saudi-green)] transition-colors flex items-center justify-center gap-2">
          {isAr ? 'احجز أسطولك الآن' : 'Book Your Fleet'}
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all rtl:rotate-180" />
        </h2>
      </Link>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/QuickBookPills.tsx', content);
console.log('Patched');
