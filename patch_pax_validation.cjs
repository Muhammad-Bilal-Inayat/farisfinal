const fs = require('fs');
let code = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

// Update isPaxValid to require at least 1
code = code.replace(
  "const isPaxValid = passengers !== '' && Number(passengers) >= 0 && Number(passengers) <= 50;",
  "const isPaxValid = passengers !== '' && Number(passengers) >= 1 && Number(passengers) <= 50;\n  const isZeroPax = passengers !== '' && Number(passengers) === 0;"
);

// Update passengers input className
code = code.replace(
  "isOverCapacity ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'",
  "(isOverCapacity || isZeroPax) ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-gray-300 focus:ring-1 focus:ring-[var(--color-luxury-gold)]'"
);

// Add onKeyDown to passengers input
code = code.replace(
  /onChange=\{\(e\) => \{\s*const val = e\.target\.value;\s*setPassengers\(val === '' \? '' : Math\.max\(0, parseInt\(val, 10\) \|\| 0\)\);\s*\}\}/,
  `onChange={(e) => {
                    const val = e.target.value;
                    setPassengers(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}`
);

// Add onKeyDown to luggage input
code = code.replace(
  /onChange=\{\(e\) => \{\s*const val = e\.target\.value;\s*setLuggage\(val === '' \? '' : Math\.max\(0, parseInt\(val, 10\) \|\| 0\)\);\s*\}\}/,
  `onChange={(e) => {
                  const val = e.target.value;
                  setLuggage(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}`
);

// Add error message for zero passengers
code = code.replace(
  /\{isOverCapacity && selectedVehicleObj && \(/,
  `{isZeroPax && (
                  <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 p-1.5 rounded-lg border border-rose-100 flex items-start gap-1 leading-tight mt-1">
                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                    {isAr ? 'مطلوب راكب واحد على الأقل' : 'At least 1 passenger is required'}
                  </span>
                )}
                {isOverCapacity && selectedVehicleObj && (`
);

fs.writeFileSync('src/components/BookingWidget.tsx', code);
