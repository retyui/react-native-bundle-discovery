module.exports = {
  toFixed(value, fractionDigits = 2) {
    return Number(value).toFixed(fractionDigits);
  },
  percent(value, fractionDigits = 2) {
    return (100 * value).toFixed(fractionDigits) + "%";
  },
  formatBytes(bytes, decimals) {
    if (bytes == 0) return "0 Bytes";
    const k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },
};
