const fs = require('fs');
const path = require('path');

let immutablePkg;
try {
  immutablePkg = require('immutable/package.json');
} catch (e) {
  console.error('[immutable-diff] Could not find immutable package. Skipping Record type alias shim.');
  process.exit(0);
}

const version = immutablePkg.version;
const isV3 = version.startsWith('3.');
const src = isV3 ? 'record-alias-v3.d.ts' : 'record-alias-v4.d.ts';
const dest = path.join(__dirname, 'record-alias.d.ts');

try {
  fs.copyFileSync(path.join(__dirname, src), dest);
  console.log(`[immutable-diff] Using ${src} for RecordType (immutable@${version})`);
} catch (e) {
  console.error(`[immutable-diff] Failed to copy ${src} to ${dest}:`, e);
  process.exit(1);
}

if (!isV3 && !version.startsWith('4.') && !version.startsWith('5.')) {
  console.warn(`[immutable-diff] Warning: Detected immutable@${version}. This version is untested. Please report any issues.`);
}
