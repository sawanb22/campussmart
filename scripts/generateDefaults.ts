import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
const outFile = path.join(process.cwd(), 'src/admin/pageDefaults.ts');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

let exportsCode = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
// It extracts the DEFAULTS object from all page components for the Admin Dashboard.

export const pageDefaults: Record<string, any> = {
`;

for (const file of files) {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  
  // Try to find const DEFAULTS = { ... };
  const match = content.match(/const\s+DEFAULTS\s*=\s*({[\s\S]*?});/);
  
  if (match) {
    let defaultsObjStr = match[1];
    
    // Clean up TypeScript casts (e.g. `] as Card[],`, `] as CardItem[]`)
    defaultsObjStr = defaultsObjStr.replace(/\]\s*as\s+[a-zA-Z0-9_\[\]]+\s*,/g, '],');
    defaultsObjStr = defaultsObjStr.replace(/\]\s*as\s+[a-zA-Z0-9_\[\]]+/g, ']');

    const slug = file.replace('.tsx', '');
    
    exportsCode += `  '${slug}': ${defaultsObjStr},\n`;
  }
}

exportsCode += `};
`;

fs.writeFileSync(outFile, exportsCode);
console.log('Successfully generated pageDefaults.ts');
