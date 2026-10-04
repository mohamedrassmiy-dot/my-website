import fs from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('Target function file is required.');
let src = fs.readFileSync(file, 'utf8');

const oldStore = `function storeForContext() {\n  const production = Netlify?.context?.deploy?.context === 'production';\n  return production\n    ? getStore('rassmiy-cms', { consistency: 'strong' })\n    : getDeployStore('rassmiy-cms', { consistency: 'strong' });\n}\n\nasync function loadState() {\n  const store = storeForContext();\n  const state = await store.get('state', { type: 'json' });`;

const newStore = `function storeForContext() {\n  return getStore('rassmiy-cms', { consistency: 'strong' });\n}\n\nfunction legacyDeployStore() {\n  return getDeployStore('rassmiy-cms', { consistency: 'strong' });\n}\n\nasync function loadState() {\n  const store = storeForContext();\n  let state = await store.get('state', { type: 'json' });\n  if (!state) {\n    try {\n      const legacyState = await legacyDeployStore().get('state', { type: 'json' });\n      if (legacyState) {\n        state = legacyState;\n        await store.setJSON('state', legacyState);\n      }\n    } catch {}\n  }`;

const oldMedia = `function mediaStoreForContext(){ const production=Netlify?.context?.deploy?.context==='production'; return production?getStore('rassmiy-media',{consistency:'strong'}):getDeployStore('rassmiy-media',{consistency:'strong'}); }`;
const newMedia = `function mediaStoreForContext(){ return getStore('rassmiy-media',{consistency:'strong'}); }`;

if (!src.includes(oldStore)) throw new Error('CMS state storage signature not found.');
if (!src.includes(oldMedia)) throw new Error('CMS media storage signature not found.');
src = src.replace(oldStore, newStore).replace(oldMedia, newMedia);
fs.writeFileSync(file, src);
