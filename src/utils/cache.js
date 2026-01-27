class Cache {
  constructor(defaultTTL = 300000) {
    // Default TTL: 5 minutes (in milliseconds)
    this.defaultTTL = defaultTTL;
    this.store = new Map();
  }

}
export default Cache;
