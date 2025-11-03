/**
 * Load pricing configuration dynamically based on platform (web vs app)
 * @returns {Promise<Array>} Array of pricing packages with display formatting
 */
export async function loadPricing() {
  try {
    // Detect if user is on mobile app
    const isApp = /feelynx-app|android|iphone|ios/i.test(navigator.userAgent);
    const file = isApp ? '/config/pricingApp.json' : '/config/pricing.json';
    
    console.log(`📦 Loading pricing from: ${file} (${isApp ? 'app' : 'web'} platform)`);
    
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
    }
    
    const pricing = await response.json();

    return pricing.map((pkg) => ({
      ...pkg,
      displayPrice: `$${pkg.price.toFixed(2)}`,
      bonus: pkg.web_bonus || '',
      platform: isApp ? 'app' : 'web',
    }));
  } catch (err) {
    console.error('⚠️  Failed to load pricing config:', err);
    // Return empty array to prevent crashes
    return [];
  }
}

/**
 * Get a single package by ID
 * @param {number} id - Package ID
 * @returns {Promise<Object|null>} Package object or null if not found
 */
export async function getPackageById(id) {
  const packages = await loadPricing();
  return packages.find((pkg) => pkg.id === id) || null;
}

/**
 * Get the most popular package
 * @returns {Promise<Object|null>} Package object or null if none marked popular
 */
export async function getPopularPackage() {
  const packages = await loadPricing();
  return packages.find((pkg) => pkg.popular) || packages[6]; // Default to package 7 if none marked
}
