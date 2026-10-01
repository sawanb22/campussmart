import fs from 'fs';
import path from 'path';

const file = 'src/pages/blog.tsx';
const content = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
const match = content.match(/const\s+DEFAULTS\s*=\s*({[\s\S]*?});/);

if (match) {
  console.log('MATCH FOUND:');
  console.log(match[1]);
} else {
  console.log('NO MATCH FOUND');
}
