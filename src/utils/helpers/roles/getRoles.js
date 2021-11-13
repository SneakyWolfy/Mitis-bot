module.exports = cache => [...cache.keys()].map(key => cache.get(key));
