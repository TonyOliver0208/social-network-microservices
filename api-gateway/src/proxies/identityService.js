const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const proxyConfigs = {
  proxyReqPathResolver: function (req) {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    if (err) {
      logger.error(`Proxy error for identity service: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: "Internal server error from search service",
      });
    }
    next();
  },
};

const identityServiceProxy = proxy(process.env.IDENTITY_SERVICE_URL, {
  ...proxyConfigs,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`
    );

    return proxyResData;
  },
});

module.exports = identityServiceProxy;
