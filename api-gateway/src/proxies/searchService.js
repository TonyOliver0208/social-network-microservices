const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const proxyConfigs = {
  proxyReqPathResolver: function (req) {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    if (err) {
      logger.error(`Proxy error for search service: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: "Internal server error from search service",
      });
    }
    next();
  },
};

const searchServiceProxy = proxy(process.env.SEARCH_SERVICE_URL, {
  ...proxyConfigs,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user?.userId;

    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from Search service: ${proxyRes.statusCode}`
    );

    return proxyResData;
  },
});

module.exports = searchServiceProxy;
