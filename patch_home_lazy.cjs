const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

code = code.replace("import BookingWidget from '../components/BookingWidget';", "import { Suspense, lazy } from 'react';\nconst BookingWidget = lazy(() => import('../components/BookingWidget'));");

// Now replace <BookingWidget /> with <Suspense fallback={<div className="w-full h-[350px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading booking engine...</div>}><BookingWidget /></Suspense>
code = code.replace("<BookingWidget />", '<Suspense fallback={<div className="w-full h-[350px] bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400 text-sm">Loading booking engine...</div>}><BookingWidget /></Suspense>');

fs.writeFileSync('src/pages/Home.tsx', code);
