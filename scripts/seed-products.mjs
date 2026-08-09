import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const isDryRun = process.argv.includes('--dry-run');
const projectId = process.env.FIREBASE_PROJECT_ID ?? 'amavya-shop';

const productsSource = await readFile(new URL('../src/app/products.ts', import.meta.url), 'utf8');
const productsJson = productsSource
  .replace(/^[\s\S]*export const PRODUCTS: Product\[] = /, '')
  .replace(/;\s*$/, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/,\s*]/g, ']')
  .replace(/,\s*}/g, '}')
  .replace(/([,{]\s*)(id|name|category|price|image|gallery):/g, '$1"$2":')
  .replace(/'/g, '"');

const products = JSON.parse(productsJson);

if (isDryRun) {
  console.log(`Parsed ${products.length} products. No Firestore writes made.`);
  process.exit(0);
}

const require = createRequire(import.meta.url);
const globalNodeModules =
  process.env.FIREBASE_TOOLS_NODE_MODULES ??
  (process.platform === 'win32'
    ? `${process.env.APPDATA}/npm/node_modules`
    : '/usr/local/lib/node_modules');
const firebaseToolsRoot = `${globalNodeModules}/firebase-tools`;
const auth = require(`${firebaseToolsRoot}/lib/auth`);
const apiv2 = require(`${firebaseToolsRoot}/lib/apiv2`);
const account = auth.getGlobalDefaultAccount();

if (!account?.tokens?.refresh_token) {
  throw new Error('Firebase CLI is not logged in. Run "firebase login" first.');
}

auth.setRefreshToken(account.tokens.refresh_token);
const accessToken = await apiv2.getAccessToken();
const now = new Date().toISOString();

const toFirestoreValue = (value) => {
  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }

  throw new Error(`Unsupported Firestore value: ${JSON.stringify(value)}`);
};

const writes = products.map((product) => ({
  update: {
    name: `projects/${projectId}/databases/(default)/documents/products/${product.id}`,
    fields: Object.fromEntries(
      Object.entries({
        ...product,
        storeId: 'amavya',
        active: true,
        sortOrder: product.id,
        createdAt: now,
        updatedAt: now,
      }).map(([key, value]) => [key, toFirestoreValue(value)]),
    ),
  },
}));

const response = await fetch(
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
  {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  },
);

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Firestore seed failed: ${response.status} ${body}`);
}

console.log(`Seeded ${products.length} products to Firestore.`);
