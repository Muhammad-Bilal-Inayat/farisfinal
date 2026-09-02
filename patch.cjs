const fs = require('fs');
const file = 'src/pages/admin/PageBuilderAdmin.tsx';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(`  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );`, `  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );`);
fs.writeFileSync(file, code);
