const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const proxyConfigs = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    logger.error(`Proxy error : ${err.message}`);
    req.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
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
