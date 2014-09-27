function RRCache(capacity) {
  this.capacity = capacity;
  this.list = [];
  this.map = {};
}

RRCache.prototype.get = function (key) {
  return this.map[key];
}

RRCache.prototype.set = function (key, value) {
  if (this.list.length >= this.capacity) {
    var index = Math.floor(Math.random() * this.capacity);
    delete this.map[this.list[index]];
    this.list[index] = key;
  } else {
    this.list.push(key);
  }
  this.map[key] = value;
}
