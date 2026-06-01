// Preload shim: make `server-only` a no-op so server-tagged modules can run in
// a plain tsx/node script (Next aliases it to an empty module in server builds).
const Module = require('module');
const original = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'server-only') return {};
  return original.call(this, request, ...rest);
};
