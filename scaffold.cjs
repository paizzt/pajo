const fs = require('fs');
const path = require('path');

const pages = [
  'Login', 'Dashboard', 'DataUlasan', 'AnalisisSentimen', 'Preprocessing', 
  'TfIdfNGrams', 'ModelSvm', 'EvaluasiModel', 'Visualisasi', 'Insight', 
  'Pengaturan', 'DataCollection'
];

const dir = path.join(__dirname, 'src', 'pages');

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${page}</h1>
      <p>Halaman ${page} dalam pengembangan.</p>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.jsx`), content);
});

console.log('Pages created.');
