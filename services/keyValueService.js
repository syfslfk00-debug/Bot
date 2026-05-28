const KeyValueStore = require('../models/KeyValueStore');

const CACHE_TTL = 60 * 1000;
const cache = new Map();

function cacheKey(namespace, key) {
  return `${namespace}:${key}`;
}

function cloneValue(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

function readCache(namespace, key) {
  const id = cacheKey(namespace, key);
  const entry = cache.get(id);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(id);
    return undefined;
  }
  return cloneValue(entry.value);
}

function writeCache(namespace, key, value) {
  cache.set(cacheKey(namespace, key), {
    value: cloneValue(value),
    expiresAt: Date.now() + CACHE_TTL,
  });
}

function clearCache(namespace, key) {
  cache.delete(cacheKey(namespace, key));
}

async function get(namespace, key) {
  const cached = readCache(namespace, key);
  if (cached !== undefined) return cached;
  const doc = await KeyValueStore.findOne({ namespace, key }).lean();
  const value = doc ? doc.value : undefined;
  if (value !== undefined) writeCache(namespace, key, value);
  return value;
}

async function set(namespace, key, value) {
  await KeyValueStore.updateOne(
    { namespace, key },
    { $set: { value } },
    { upsert: true }
  );
  writeCache(namespace, key, value);
  return value;
}

async function del(namespace, key) {
  await KeyValueStore.deleteOne({ namespace, key });
  clearCache(namespace, key);
  return true;
}

async function has(namespace, key) {
  const cached = readCache(namespace, key);
  if (cached !== undefined) return true;
  const count = await KeyValueStore.countDocuments({ namespace, key });
  return count > 0;
}

async function push(namespace, key, value) {
  const current = (await get(namespace, key)) || [];
  if (!Array.isArray(current)) throw new Error(`لا يمكن إضافة قيمة إلى مفتاح ليس مصفوفة: ${key}`);
  current.push(value);
  await set(namespace, key, current);
  return current;
}

module.exports = { get, set, delete: del, has, push, clearCache };
