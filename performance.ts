// Performance configuration for the ErpMax application

export const PERFORMANCE_CONFIG = {
  // Service Worker settings
  serviceWorker: {
    enabled: true,
    updateCheckInterval: 60000, // 1 minute
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxCacheSize: 50 * 1024 * 1024, // 50MB
  },

  // Network settings
  network: {
    timeout: 10000, // 10 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    offlineCacheDuration: 5 * 60 * 1000, // 5 minutes
  },

  // Lazy loading settings
  lazyLoading: {
    intersectionThreshold: 0.1,
    rootMargin: '50px',
    imageQuality: 0.8,
    enableProgressiveImages: true,
  },

  // Bundle optimization
  bundling: {
    chunkSizeLimit: 500, // KB
    enableGzip: true,
    enableBrotli: true,
    treeShaking: true,
    minify: true,
  },

  // Performance monitoring thresholds
  metrics: {
    // Core Web Vitals thresholds
    lcp: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    fid: { good: 100, poor: 300 },   // First Input Delay (ms)
    cls: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift

    // Custom metrics
    ttfb: { good: 600, poor: 1000 }, // Time to First Byte (ms)
    fcp: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    tti: { good: 3800, poor: 7300 }, // Time to Interactive (ms)

    // Memory usage
    memoryUsage: { good: 50, poor: 75 }, // Percentage of heap limit
  },

  // Error tracking
  errorTracking: {
    enabled: true,
    maxErrors: 10, // Maximum errors to store locally
    sendToService: false, // Enable when error service is configured
  },

  // Cache strategies by resource type
  cacheStrategies: {
    static: {
      strategy: 'cache-first',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxEntries: 100,
    },
    api: {
      strategy: 'network-first',
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 50,
    },
    images: {
      strategy: 'cache-first',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 200,
    },
    documents: {
      strategy: 'stale-while-revalidate',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 30,
    },
  },

  // Development settings
  development: {
    enablePerformanceLogging: true,
    enableMemoryMonitoring: true,
    enableBundleAnalysis: true,
    logLevel: 'debug',
  },

  // Production settings
  production: {
    enableAnalytics: true,
    enableErrorReporting: true,
    compressionLevel: 'high',
    enablePreloading: true,
  },
};

// Feature flags for enabling/disabling performance features
export const FEATURE_FLAGS = {
  serviceWorker: true,
  offlineSupport: true,
  performanceMonitoring: true,
  lazyLoading: true,
  codesplitting: true,
  bundleOptimization: true,
  errorBoundaries: true,
  accessibilityFeatures: true,
  networkRetry: true,
  caching: true,
};

// Runtime environment detection
export const ENVIRONMENT = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
};

// Browser capability detection
export const BROWSER_SUPPORT = {
  serviceWorker: 'serviceWorker' in navigator,
  intersectionObserver: 'IntersectionObserver' in window,
  performanceObserver: 'PerformanceObserver' in window,
  webp: (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })(),
  localStorage: (() => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  })(),
  connection: 'connection' in navigator,
  memory: 'memory' in performance,
};

// Default cache configuration for different environments
export const getCacheConfig = () => {
  const baseConfig = PERFORMANCE_CONFIG.cacheStrategies;
  
  if (ENVIRONMENT.isDevelopment) {
    // Shorter cache times in development
    return {
      ...baseConfig,
      api: { ...baseConfig.api, maxAge: 30 * 1000 }, // 30 seconds
      static: { ...baseConfig.static, maxAge: 60 * 1000 }, // 1 minute
    };
  }
  
  return baseConfig;
};

// Performance budget configuration
export const PERFORMANCE_BUDGET = {
  // Bundle size limits (KB)
  javascript: 500,
  css: 100,
  images: 1000,
  fonts: 200,
  total: 2000,

  // Runtime performance limits
  firstLoad: 3000, // ms
  routeChange: 1000, // ms
  apiResponse: 2000, // ms

  // Resource limits
  requestCount: 50,
  domElements: 1500,
  memoryUsage: 50, // MB
};

// Analytics events for performance tracking
export const ANALYTICS_EVENTS = {
  PERFORMANCE_METRIC: 'performance_metric',
  BUNDLE_LOADED: 'bundle_loaded',
  API_CALL: 'api_call',
  ERROR_BOUNDARY: 'error_boundary_triggered',
  OFFLINE_MODE: 'offline_mode_activated',
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  SERVICE_WORKER_UPDATE: 'service_worker_update',
};

export default PERFORMANCE_CONFIG;