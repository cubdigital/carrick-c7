#!/usr/bin/env node

const REPO = 'cubdigital/carrick-c7';
const REF = 'latest';

const ASSETS = [
  'sitewide.css',
  'sitewide.js',
  'profile-head.css',
  'shop-head.css',
  'shop-script.js',
  'cart-head.css',
  'cart-script.js',
];

async function purgeAsset(asset) {
  const url = `https://purge.jsdelivr.net/gh/${REPO}@${REF}/${asset}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    let body;

    try {
      body = JSON.parse(text);
    } catch {
      body = text.trim();
    }

    const finished = body && typeof body === 'object' && body.status === 'finished';

    return {
      asset,
      url,
      ok: response.ok && finished,
      status: response.status,
      body,
    };
  } catch (error) {
    return {
      asset,
      url,
      ok: false,
      error: error.message,
    };
  }
}

async function main() {
  console.log(`Purging jsDelivr cache for gh/${REPO}@${REF}\n`);

  const results = await Promise.all(ASSETS.map(purgeAsset));
  let failed = 0;

  for (const result of results) {
    if (result.ok) {
      console.log(`OK  ${result.asset} (${result.status}) ${JSON.stringify(result.body)}`);
      continue;
    }

    failed += 1;

    if (result.error) {
      console.log(`ERR ${result.asset} ${result.error}`);
      continue;
    }

    console.log(
      `ERR ${result.asset} (${result.status}) ${JSON.stringify(result.body)}`
    );
  }

  console.log(`\nDone: ${results.length - failed}/${results.length} purged.`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
