function hashFnv32a(str) {
  var i, l,
    hval = 0x811c9dc5;

  for (i = 0, l = str.length; i < l; i++) {
    hval ^= str.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) +
      (hval << 24);
  }
  return hval >> 0;
}
