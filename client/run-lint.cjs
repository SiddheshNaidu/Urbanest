const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx eslint .', { encoding: 'utf8' });
  fs.writeFileSync('lint-errors.txt', output);
  console.log('No lint errors found');
} catch (error) {
  if (error.stdout) {
    fs.writeFileSync('lint-errors.txt', error.stdout);
    console.log('Lint errors written to lint-errors.txt');
  } else {
    fs.writeFileSync('lint-errors.txt', error.message);
    console.log('Error running lint', error.message);
  }
}
