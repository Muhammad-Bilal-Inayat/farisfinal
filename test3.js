fetch('http://localhost:3000/api/vehicles').then(r=>r.json()).then(d=>console.log(d.length))
