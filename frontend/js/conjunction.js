fetch('http://localhost:8000/api/conjunctions')
  .then(res => res.json())
  .then(data => {
    console.log('Conjunction Data from Backend:', data);
  });
