const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const proxyConfigs = {
  proxyReqPathResolver: function (req) {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    if (err) {
      logger.error(`Proxy error for post service: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: "Internal server error from post service",
      });
    }
    next();
  },
};

const postServiceProxy = proxy(process.env.POST_SERVICE_URL, {
  ...proxyConfigs,
  proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    return proxyReqOpts;
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);
    return proxyResData;
  },
});

module.exports = postServiceProxy;
