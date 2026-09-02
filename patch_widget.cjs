const fs = require('fs');
let code = fs.readFileSync('src/components/BookingWidget.tsx', 'utf8');

code = code.replace(
  "const [passengers, setPassengers] = useState(2);",
  "const [passengers, setPassengers] = useState<number | ''>(2);"
);
code = code.replace(
  "const [luggage, setLuggage] = useState(2);",
  "const [luggage, setLuggage] = useState<number | ''>(2);"
);

code = code.replace(
  "const isPaxValid = passengers >= 1 && passengers <= 50;",
  "const isPaxValid = passengers !== '' && Number(passengers) >= 0 && Number(passengers) <= 50;"
);

code = code.replace(
  "const isOverCapacity = selectedVehicleObj ? passengers > selectedVehicleObj.passengerCapacity : false;",
  "const isOverCapacity = selectedVehicleObj ? Number(passengers) > selectedVehicleObj.passengerCapacity : false;"
);

// Passengers input
code = code.replace(
  /min="1"\s*max="50"\s*value=\{passengers\}\s*onChange=\{\(e\) => setPassengers\(Math\.max\(1, Number\(e\.target\.value\)\)\)\}/g,
  `min="0"
                  max="50"
                  value={passengers}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassengers(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                  }}`
);

// Luggage input
code = code.replace(
  /min="0"\s*max="50"\s*value=\{luggage\}\s*onChange=\{\(e\) => setLuggage\(Math\.max\(0, Number\(e\.target\.value\)\)\)\}/g,
  `min="0"
                max="50"
                value={luggage}
                onChange={(e) => {
                  const val = e.target.value;
                  setLuggage(val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                }}`
);

fs.writeFileSync('src/components/BookingWidget.tsx', code);
