import { readFileSync, writeFileSync } from 'fs';

const filePath = './server/routes/index.js';
let content = readFileSync(filePath, 'utf8');

// The stray });  that closes nothing — it appears right after the specializations route });
// Pattern: });  followed by newline });  followed by blank line then // Medora
// We need to remove the second stray });
content = content.replace(
  /(\s*res\.json\(\{ success: true, data: specs \}\);[\r\n]+\}\);[\r\n]+)\}\);([\r\n]+\/\/ Medora Hospital Services API)/,
  '$1$2'
);

writeFileSync(filePath, content, 'utf8');
console.log('Fixed stray }); in routes/index.js');

// Verify no syntax error by checking the pattern is gone
if (content.includes('});\r\n});\r\n\r\n// Medora') || content.includes('});\n});\n\n// Medora')) {
  console.log('ERROR: Pattern still exists!');
} else {
  console.log('OK: Stray brace removed successfully');
}
