interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  userId?: string;
  url: string;
  userAgent: string;
  componentStack?: string;
}

interface MonitoringConfig {
  enablePerformance: boolean;
  enableErrorTracking: boolean;
  performanceThresholdMs: number;
  alertEndpoints: string[];
  batchSize: number;
  flushInterval: number;
}

class MonitoringService {
  private config: MonitoringConfig;
  private performanceMetrics: PerformanceMetric[] = [];
  private errorEvents: ErrorEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enablePerformance: true,
      enableErrorTracking: true,
      performanceThresholdMs: 100,
      alertEndpoints: [],
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    if (this.config.enablePerformance) {
      this.setupPerformanceTracking();
    }

    this.startBatchFlush();
  }

  private setupErrorTracking() {
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  private setupPerformanceTracking() {
    // Track navigation timing
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.trackPerformance('page-load-time', navigation.loadEventEnd - navigation.loadEventStart);
        this.trackPerformance('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.trackPerformance('first-paint', performance.getEntriesByName('first-paint')[0]?.startTime || 0);
        this.trackPerformance('first-contentful-paint', performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
      }
    });

    // Track long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > this.config.performanceThresholdMs) {
          this.trackPerformance('long-task', entry.duration, {
            entryType: entry.entryType,
            name: entry.name,
          });
        }
      }
    });

    try {
      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('Long task monitoring not supported');
    }
  }

  private startBatchFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.config.flushInterval);
  }

  public trackPerformance(name: string, value: number, tags?: Record<string, string>) {
    if (!this.config.enablePerformance) return;

    this.performanceMetrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags,
    });

    if (this.performanceMetrics.length >= this.config.batchSize) {
      this.flushMetrics();
    }
  }

  public trackError(error: Omit<ErrorEvent, 'timestamp'>) {
    if (!this.config.enableErrorTracking) return;

    this.errorEvents.push({
      ...error,
      timestamp: Date.now(),
    });

    // Flush errors immediately for critical issues
    this.flushMetrics();
  }

  public trackComponentError(error: Error, errorInfo?: { componentStack: string }) {
    this.trackError({
      message: `React Component Error: ${error.message}`,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  }

  public trackAPIError(endpoint: string, error: Error, statusCode?: number) {
    this.trackError({
      message: `API Error: ${endpoint} - ${error.message}`,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Track API performance metrics
    this.trackPerformance('api-error', 1, {
      endpoint,
      statusCode: statusCode?.toString(),
      method: 'unknown', // TODO: Could be enhanced with actual method
    });
  }

  public trackUserAction(action: string, extraData?: Record<string, string>) {
    this.trackPerformance(`user-action-${action}`, 1, extraData);
  }

  private async flushMetrics() {
    const metrics = [...this.performanceMetrics, ...this.errorEvents];

    if (metrics.length === 0) return;

    // Clear the batches
    this.performanceMetrics = [];
    this.errorEvents = [];

    try {
      // Send to configured endpoints
      for (const endpoint of this.config.alertEndpoints) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              metrics,
              timestamp: Date.now(),
              environment: import.meta.env.MODE,
              version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            }),
          });
        } catch (error) {
          // Fallback to console logging in development
          if (import.meta.env.DEV) {
            console.warn(`Failed to send metrics to ${endpoint}:`, error);
          }
        }
      }

      // Always log to console in development
      if (import.meta.env.DEV) {
        console.group('📊 Monitoring Metrics');
        console.log('Performance:', metrics.filter(m => 'value' in m && typeof (m as PerformanceMetric).value === 'number'));
        console.log('Errors:', metrics.filter(m => 'message' in m));
        console.groupEnd();
      }
    } catch (error) {
      console.error('Failed to flush monitoring metrics:', error);
    }
  }

  public getHealthMetrics() {
    return {
      totalPerformanceMetrics: this.performanceMetrics.length,
      totalErrors: this.errorEvents.length,
      isTrackingEnabled: this.config.enablePerformance || this.config.enableErrorTracking,
      lastFlushTime: Date.now(),
    };
  }

  public destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flushMetrics(); // Final flush
  }
}

// Create and export singleton instance
export const monitoring = new MonitoringService({
  enablePerformance: import.meta.env.PROD,
  enableErrorTracking: true,
  alertEndpoints: import.meta.env.VITE_ALERT_ENDPOINTS?.split(',') || [],
});

// Export types and class for advanced usage
export type { MonitoringConfig, PerformanceMetric, ErrorEvent };
export { MonitoringService };
