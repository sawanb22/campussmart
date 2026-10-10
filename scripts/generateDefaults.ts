import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src/pages');
const outFileAdmin = path.join(process.cwd(), 'src/admin/pageDefaults.ts');
const outFileBackend = path.join(process.cwd(), 'backend/src/pageDefaults.data.ts');

const allFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.data.ts'));

let exportsCode = `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT DIRECTLY.
// It extracts the DEFAULTS object from all page components for deployment bootstrapping and Admin Dashboard.

export const pageDefaults: Record<string, any> = {
`;

const processedSlugs = new Set<string>();

// Process .data.ts files first so canonical data modules take precedence
const sortedFiles = [...allFiles].sort((a, b) => {
  if (a.endsWith('.data.ts') && !b.endsWith('.data.ts')) return -1;
  if (!a.endsWith('.data.ts') && b.endsWith('.data.ts')) return 1;
  return a.localeCompare(b);
});

for (const file of sortedFiles) {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  const slug = file.replace('.data.ts', '').replace('.tsx', '');
  
  if (processedSlugs.has(slug)) continue;

  // Match const DEFAULTS = { ... } or const [NAME]_DEFAULTS = { ... }
  const match = content.match(/(?:export\s+)?const\s+(?:[A-Za-z0-9_]*DEFAULTS)\s*=\s*({[\s\S]*?});/);
  
  if (match) {
    let defaultsObjStr = match[1];
    
    // Clean up TypeScript casts (e.g. `] as Card[],`, `] as CardItem[]`, `as Listing[]`)
    defaultsObjStr = defaultsObjStr.replace(/\]\s*as\s+[a-zA-Z0-9_\[\]<>]+\s*,/g, '],');
    defaultsObjStr = defaultsObjStr.replace(/\]\s*as\s+[a-zA-Z0-9_\[\]<>]+/g, ']');
    defaultsObjStr = defaultsObjStr.replace(/\s+as\s+[a-zA-Z0-9_\[\]<>]+/g, '');

    processedSlugs.add(slug);
    exportsCode += `  '${slug}': ${defaultsObjStr},\n`;
  }
}

exportsCode += `};
`;

fs.writeFileSync(outFileAdmin, exportsCode);
fs.writeFileSync(outFileBackend, exportsCode);
console.log('Successfully generated pageDefaults.ts and backend/src/pageDefaults.data.ts');
