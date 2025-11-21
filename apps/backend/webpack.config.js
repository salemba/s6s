const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = function(options) {
  return {
    ...options,
    externals: [
      nodeExternals({
        modulesDir: path.join(__dirname, '../../node_modules'),
      }),
      nodeExternals({
        modulesDir: path.join(__dirname, 'node_modules'),
      }),
    ],
  };
};
