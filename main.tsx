import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance and service worker utilities
import { initializePerformanceOptimizations } from "./utils/serviceWorker";
import { performanceMonitor } from "./utils/performance";

// Initialize performance optimizations
initializePerformanceOptimizations();

// Register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New version available!');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

// Initialize performance monitoring
if (import.meta.env.DEV) {
  // Development-only performance monitoring
  performanceMonitor.onMetric((metric) => {
    if (metric.rating === 'poor') {
      console.warn(`Poor performance detected: ${metric.name} = ${metric.value.toFixed(2)}ms`);
    }
  });
}

// Error event listener for global error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // In production, you would send this to your error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.error);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // In production, you would send this to your error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.reason);
  }
});

// Report web vitals to analytics (placeholder)
if (import.meta.env.PROD && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    performanceMonitor.onMetric((metric) => {
      // Send to analytics service
      // Example: gtag('event', metric.name, { value: metric.value });
      console.log(`Analytics: ${metric.name} = ${metric.value}ms (${metric.rating})`);
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
