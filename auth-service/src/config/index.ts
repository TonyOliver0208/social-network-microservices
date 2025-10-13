// Re-export all configuration modules for easy access
export {
  env,
  config,
  validateEnvironment,
  getEnvironmentConfig,
} from "./environment";
export {
  getSecurityConfig,
  getCustomHeaders,
  CSP_DIRECTIVES,
  RATE_LIMIT_CONFIG,
} from "./security";

// Default export for backward compatibility
import { env, config } from "./environment";

export default {
  env,
  config,
};
