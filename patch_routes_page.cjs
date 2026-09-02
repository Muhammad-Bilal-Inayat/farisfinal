const fs = require('fs');
let code = fs.readFileSync('src/pages/RoutesRates.tsx', 'utf8');

// Insert the state and fetch logic
const hookInsert = `
  const [dynamicVehicles, setDynamicVehicles] = useState<VehicleFleet[]>(FLEET_VEHICLES_DATA);

  useEffect(() => {
    Promise.all([
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/routes').then(r => r.json())
    ]).then(([vehicles, routes]) => {
      if (Array.isArray(vehicles) && Array.isArray(routes)) {
        const enriched = vehicles.map((v: any) => {
          const vRoutes = [];
          routes.forEach((route: any) => {
            const rate = route.rates?.find((r: any) => r.vehicleId === v.id);
            if (rate) {
              const priceText = rate.priceMax && rate.priceMax > rate.price 
                ? \`\${rate.price} - \${rate.priceMax}\` 
                : \`\${rate.price}\`;
              vRoutes.push({
                routeId: route.id.toString(),
                routeNameEn: route.nameEn,
                routeNameAr: route.nameAr,
                price: priceText,
                pickup: route.pickup,
                destination: route.destination
              });
            }
          });
          return {
            id: v.id.toString(),
            name: v.name,
            nameAr: v.name,
            category: (v.category || 'Sedan') as any,
            passengers: v.passengerCapacity?.toString() || '4',
            passengersAr: v.passengerCapacity?.toString() || '4',
            luggage: v.luggageCapacity?.toString() || '3',
            luggageAr: v.luggageCapacity?.toString() || '3',
            image: v.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
            routes: vRoutes
          };
        });
        if (enriched.length > 0) {
          setDynamicVehicles(enriched);
        }
      }
    }).catch(console.error);
  }, []);
`;

code = code.replace(
  "const [searchQuery, setSearchQuery] = useState<string>('');",
  "const [searchQuery, setSearchQuery] = useState<string>('');\n" + hookInsert
);

code = code.replace(
  "let list = FLEET_VEHICLES_DATA;",
  "let list = dynamicVehicles;"
);

// We need to fix the price display to string instead of number since we use a range
// In FLEET_VEHICLES_DATA, price is number. So TypeScript might complain.
code = code.replace(
  "price: number;",
  "price: string | number;"
);

fs.writeFileSync('src/pages/RoutesRates.tsx', code);
