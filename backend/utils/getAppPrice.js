/**
 * Adjust app store pricing to cover 30% platform fee
 * @param {number} webPrice - The web price
 * @returns {number} Adjusted price for app stores
 */
function getAppPrice(webPrice) {
  return +(webPrice * 1.3).toFixed(2);
}

/**
 * Calculate the effective price after platform fees
 * @param {number} price - The price
 * @param {boolean} isAppPurchase - Whether this is an app purchase
 * @returns {object} Price breakdown
 */
function calculatePriceBreakdown(price, isAppPurchase = false) {
  const finalPrice = isAppPurchase ? getAppPrice(price) : price;
  const appStoreFee = isAppPurchase ? finalPrice * 0.30 : 0;
  const netRevenue = finalPrice - appStoreFee;
  
  return {
    originalPrice: price,
    finalPrice,
    appStoreFee,
    netRevenue,
    isAppPurchase
  };
}

module.exports = {
  getAppPrice,
  calculatePriceBreakdown
};