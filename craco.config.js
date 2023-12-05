module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.externals = {
        react: "React", // Case matters here
        "react-dom": "ReactDOM", // Case matters here
      };

      if (env === "production" && process.env.REACT_APP_E2E_TESTING !== "true") {
        webpackConfig.output.library = "inventory-management-system";
        webpackConfig.output.libraryTarget = "window";

        webpackConfig.output.filename = "[name].js";
        webpackConfig.output.chunkFilename = "[name].chunk.js";

        delete webpackConfig.optimization.splitChunks;
        webpackConfig.optimization.runtimeChunk = false;

        webpackConfig.output.clean = {
          keep(asset) {
            // exclude mockServiceWorker.js from build
            return !asset.includes('mockServiceWorker.js');
          },
        };
      }

      return webpackConfig;
    },
  },
};
