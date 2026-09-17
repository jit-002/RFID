const fs = require('fs');
const [,, target, b64, mode] = process.argv;
const text = Buffer.from(b64, 'base64').toString('utf8');
if (mode === 'append') {
  fs.appendFileSync(target, text, 'utf8');
} else {
  fs.writeFileSync(target, text, 'utf8');
}
