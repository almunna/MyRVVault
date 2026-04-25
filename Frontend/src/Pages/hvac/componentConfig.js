/**
 * Central config for all RV component types.
 * Used by ComponentsList, ComponentAdd, ComponentUpdate, and HavcApplication.
 *
 * urlPath  – API path prefix (e.g. /air-condition/get)
 * collection – Firestore collection name (used for markAsReplaced endpoint)
 * category   – display grouping
 * replaceable – show "Mark as Replaced" button
 * hasHours    – show install hours + current hours fields
 */
export const COMPONENT_TYPES = {
  airConditioner: {
    label: 'Air Conditioner', urlPath: 'air-condition',
    collection: 'airConditioners', category: 'house',
    replaceable: false, hasHours: false,
    icon: '❄️',
  },
  heater: {
    label: 'Heater', urlPath: 'heater',
    collection: 'heaters', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🔥',
  },
  waterPump: {
    label: 'Water Pump', urlPath: 'water-pump',
    collection: 'waterPumps', category: 'house',
    replaceable: true, hasHours: false,
    icon: '💧',
  },
  washer: {
    label: 'Washer', urlPath: 'washer',
    collection: 'washers', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🫧',
  },
  waterHeater: {
    label: 'Water Heater', urlPath: 'water-heater',
    collection: 'waterHeaters', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🚿',
  },
  dryer: {
    label: 'Dryer', urlPath: 'dryer',
    collection: 'dryers', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🌬️',
  },
  toilet: {
    label: 'Toilet', urlPath: 'toilet',
    collection: 'toilets', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🚽',
  },
  dishwasher: {
    label: 'Dishwasher', urlPath: 'dishwasher',
    collection: 'dishwashers', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🍽️',
  },
  exhaustFans: {
    label: 'Exhaust Fans', urlPath: 'exhaust-fans',
    collection: 'exhaustFans', category: 'house',
    replaceable: false, hasHours: false,
    icon: '💨',
  },
  ventFans: {
    label: 'Vent Fans', urlPath: 'vent-fans',
    collection: 'ventFans', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🌀',
  },
  ceilingFans: {
    label: 'Ceiling Fans', urlPath: 'celling-fans',
    collection: 'cellingFans', category: 'house',
    replaceable: false, hasHours: false,
    icon: '🌀',
  },
  tv: {
    label: 'TV', urlPath: 'tv',
    collection: 'tvs', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '📺',
  },
  dvdPlayer: {
    label: 'DVD Player', urlPath: 'dvd',
    collection: 'dvds', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '💿',
  },
  surroundSound: {
    label: 'Surround Sound', urlPath: 'surround-sound',
    collection: 'surroundSounds', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '🔊',
  },
  wifiRouter: {
    label: 'WiFi Router', urlPath: 'wifi-router',
    collection: 'wifiRouters', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '📡',
  },
  internetSatellite: {
    label: 'Internet/Satellite', urlPath: 'internet-satellite',
    collection: 'internetSatellite', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '🛰️',
  },
  gps: {
    label: 'GPS', urlPath: 'gps',
    collection: 'gpsSystems', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '🗺️',
  },
  outdoorRadio: {
    label: 'Outdoor Radio', urlPath: 'outdoor-radio',
    collection: 'outdoorRadios', category: 'entertainment',
    replaceable: false, hasHours: false,
    icon: '📻',
  },
  tire: {
    label: 'Tires', urlPath: 'tire',
    collection: 'tires', category: 'chassis',
    replaceable: true, hasHours: false,
    icon: '🔧',
  },
};

export const CATEGORY_META = {
  chassis: {
    label: 'Engine & Chassis',
    description: 'Tires, drivetrain, and structural components',
    color: '#1A1A1A',
    bg: '#F5F5F0',
    border: '#E0E0E0',
    accent: '#5A5A5A',
  },
  house: {
    label: 'House Systems',
    description: 'Climate, water, appliances, and plumbing',
    color: '#1D4ED8',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    accent: '#2563EB',
  },
  entertainment: {
    label: 'Entertainment & Connectivity',
    description: 'AV equipment, navigation, and internet',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    accent: '#7C3AED',
  },
};

export const COMPONENT_TYPES_BY_CATEGORY = Object.entries(COMPONENT_TYPES).reduce((acc, [key, cfg]) => {
  if (!acc[cfg.category]) acc[cfg.category] = [];
  acc[cfg.category].push({ key, ...cfg });
  return acc;
}, {});
