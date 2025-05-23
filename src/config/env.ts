/**
 * 环境变量配置
 * 集中管理所有环境变量，避免直接访问 process.env
 */

// 确定当前环境
let currentEnv: string;

// 根据不同的运行环境获取环境变量
if (typeof process !== 'undefined' && process.env) {
  // Node.js 环境
  currentEnv = process.env.NODE_ENV || 'development';
} else {
  // 默认开发环境
  currentEnv = 'development';
  
  // 尝试获取 Vite 环境变量 (使用安全的类型检查和断言)
  try {
    // @ts-ignore - 忽略类型检查以支持 Vite 环境
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE) {
      // @ts-ignore
      currentEnv = import.meta.env.MODE;
    }
  } catch (e) {
    // 忽略错误
  }
}

/**
 * 从环境变量中获取字符串值
 * @param key 环境变量名
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
function getEnvString(key: string, defaultValue: string = ''): string {
  // Node.js 环境
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] || defaultValue;
  }
  
  // Vite 环境 - 使用安全的类型检查
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // 忽略错误
  }
  
  return defaultValue;
}

/**
 * 从环境变量中获取数字值
 * @param key 环境变量名
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = getEnvString(key);
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 从环境变量中获取布尔值
 * @param key 环境变量名
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = getEnvString(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * 从环境变量中获取数组
 * @param key 环境变量名
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
function getEnvArray(key: string, defaultValue: string[] = []): string[] {
  const value = getEnvString(key);
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim());
}

/**
 * 环境变量对象，集中管理所有环境变量
 */
export const ENV = {
  // 当前环境: development, test, production
  NODE_ENV: currentEnv,
  
  // 是否是开发环境
  IS_DEV: currentEnv === 'development',
  
  // 是否是测试环境
  IS_TEST: currentEnv === 'test',
  
  // 是否是生产环境
  IS_PROD: currentEnv === 'production',
  
  // API 服务器配置
  PORT: getEnvNumber('PORT', 3000),
  HOST: getEnvString('HOST', '0.0.0.0'),
  API_BASE_PATH: getEnvString('API_BASE_PATH', '/api'),
  
  // 前端应用URL
  FRONTEND_URL: getEnvString('FRONTEND_URL', 
    currentEnv === 'production' 
      ? 'https://your-production-domain.com'
      : currentEnv === 'test'
        ? 'http://test-domain.com'
        : 'http://192.168.31.177:8080'
  ),
  
  // CORS 配置
  CORS: {
    ORIGINS: getEnvArray('CORS_ORIGINS', 
      currentEnv === 'production'
        ? ['https://your-production-domain.com']
        : currentEnv === 'test'
          ? ['*']
          : ['http://localhost:3000', 'http://localhost:5173', 
             'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 
             'http://192.168.31.177:8080']
    ),
    METHODS: getEnvArray('CORS_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']),
    HEADERS: getEnvArray('CORS_HEADERS', ['Origin', 'Content-Type', 'Accept', 'Authorization', 'X-Requested-With']),
    EXPOSE_HEADERS: getEnvArray('CORS_EXPOSE_HEADERS', ['Content-Length', 'X-Kuma-Revision']),
    CREDENTIALS: getEnvBoolean('CORS_CREDENTIALS', true),
    MAX_AGE: getEnvNumber('CORS_MAX_AGE', 86400),
  },
  
  // Auth0 配置
  AUTH0: {
    DOMAIN: getEnvString('AUTH0_DOMAIN', 'your-auth0-domain.auth0.com'),
    CLIENT_ID: getEnvString('AUTH0_CLIENT_ID', 'your-client-id'),
    CLIENT_SECRET: getEnvString('AUTH0_CLIENT_SECRET', 'your-client-secret'),
    REDIRECT_URI: getEnvString('AUTH0_REDIRECT_URI', 'http://localhost:3000/api/auth/callback'),
  },
  
  // JWT 配置
  JWT: {
    SECRET: getEnvString('JWT_SECRET', 'your-secret-key-change-in-production'),
    EXPIRES_IN: getEnvString('JWT_EXPIRES_IN', '24h'),
    ALGORITHM: getEnvString('JWT_ALGORITHM', 'HS256'),
  },
  
  // 日志级别
  LOG_LEVEL: getEnvString('LOG_LEVEL', currentEnv === 'production' ? 'info' : 'debug'),
};

/**
 * 检测是否存在环境变量并返回值（向下兼容旧代码）
 * @param key 环境变量名称
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return getEnvString(key, defaultValue);
}

export default ENV; 