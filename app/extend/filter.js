module.exports = () => {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  };
  return {
    stringify(o) {
      const str = JSON.stringify(o);
      return str.replace(/[&<>]/g, ch => {
        return escapeMap[ch];
      });
    },
  };
};
