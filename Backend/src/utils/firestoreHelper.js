/**
 * Convert a Firestore Timestamp (or any nested value) to a plain JS value.
 * Timestamps become ISO strings so they serialize cleanly to JSON.
 */
const convertValue = (val) => {
  if (val === null || val === undefined) return val;
  // Firestore Timestamp
  if (typeof val === 'object' && typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  // Plain array
  if (Array.isArray(val)) return val.map(convertValue);
  // Plain object (but not a special class)
  if (typeof val === 'object' && val.constructor === Object) {
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, convertValue(v)]));
  }
  return val;
};

/**
 * Convert a Firestore DocumentSnapshot to a plain object with id.
 * All Timestamp fields are converted to ISO strings.
 */
const docToObj = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  const converted = {};
  for (const [key, value] of Object.entries(data)) {
    converted[key] = convertValue(value);
  }
  return { id: doc.id, ...converted };
};

/**
 * Convert a Firestore QuerySnapshot to an array of plain objects.
 */
const queryToArr = (snap) => snap.docs.map(docToObj);

module.exports = { docToObj, queryToArr };
