const fs = require('fs');
const pkg = require('./package.json');

console.log('=== Dependencies ===');
console.log(JSON.stringify(pkg.dependencies, null, 2));

console.log('\n=== Checking App.js ===');
const code = fs.readFileSync('./App.js', 'utf8');

const imports = code.match(/import\s+.*from\s+['"].+['"]/g);
console.log('Imports:');
imports.forEach(i => console.log('  ', i));

// Check all named imports exist in styles
const styleObj = code.match(/const s = StyleSheet\.create\(\{([^}]+)\}\);/s);
if (!styleObj) {
  // try multi-line match
  const start = code.indexOf('const s = StyleSheet.create({');
  const end = code.indexOf('})', start) + 2;
  if (start > 0) {
    const styleBlock = code.slice(start, end);
    const styleKeys = [...styleBlock.matchAll(/\n\s+(\w+):/g)].map(m => m[1]);
    console.log('\nStyle keys defined:', styleKeys.join(', '));
  }
}

// Check for potential issues
const issues = [];
if (code.includes('http://localhost')) issues.push('WARNING: hardcoded localhost URL');
if (!code.includes('catch')) issues.push('WARNING: no error handling found');
if (code.includes('undefined')) issues.push('WARNING: undefined reference');

console.log('\n=== Metro Bundle Check ===');
const { execSync } = require('child_process');
try {
  const result = execSync('npx expo export --platform android 2>&1', { timeout: 60000 });
  const output = result.toString();
  if (output.includes('Bundled')) {
    const match = output.match(/Android Bundled \d+ms App\.js \((\d+) modules\)/);
    console.log('Bundle OK:', match ? match[1] + ' modules' : 'success');
  } else {
    console.log('Bundle output:', output.slice(-200));
  }
} catch (e) {
  console.log('Bundle FAILED:', e.message);
}

if (issues.length > 0) {
  console.log('\n=== Issues Found ===');
  issues.forEach(i => console.log('  ', i));
} else {
  console.log('\n=== No issues found ===');
}
