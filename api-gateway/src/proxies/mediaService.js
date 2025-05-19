const proxy = require("express-http-proxy");
const logger = require("../utils/logger");

const proxyConfigs = {
  proxyReqPathResolver: function (req) {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    if (err) {
      logger.error(`Proxy error for media service: ${err.message}`);
      return res.status(500).json({
        success: false,
        message: "Internal server error from search service",
      });
    }
    next();
  },
};

const mediaServiceProxy = proxy(process.env.MEDIA_SERVICE_URL, {
  ...proxyConfigs,
  proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
    if (srcReq.headers["content-type"]?.startsWith("multipart/form-data")) {
      proxyReqOpts.headers["Content-Type"] = srcReq.headers["content-type"];
    } else {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from media service: ${proxyRes.statusCode}`);

    return proxyResData;
  },
  parseReqBody: false,
});

module.exports = mediaServiceProxy;
