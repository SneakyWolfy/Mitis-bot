/**
 * @param {map} map
 * @returns {Array} array of unique values
 */
module.exports = (map) => [...new Set([...map.values()])];
