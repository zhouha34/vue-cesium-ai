const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        cesium: path.resolve(__dirname, 'node_modules/cesium')
      }
    },
    module: {
      unknownContextCritical: false
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].chunksSortMode = 'none';
      return args;
    });
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'https://vuecesium-5scs0pb4z-ha-zhous-projects.vercel.app',
        changeOrigin: true,
        // 移除 pathRewrite，让 /api/chat 直接代理到目标地址的 /api/chat
        secure: false,
        logLevel: 'debug'
      },
    },
  }
};