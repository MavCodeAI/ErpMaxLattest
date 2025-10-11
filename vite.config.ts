import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from 'vite-bundle-analyzer';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Bundle analysis in development
    mode === "development" && analyzer({
      analyzerMode: 'server',
      analyzerPort: 8888,
      openAnalyzer: false,
    }),
    // Bundle visualizer for production builds
    mode === "production" && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers for better performance
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
    
    // Optimize chunks
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Application chunks
          'utils': [
            './src/utils/offline.ts',
            './src/utils/performance.ts',
            './src/utils/serviceWorker.ts',
            './src/utils/lazyLoading.ts',
            './src/utils/accessibility.ts',
            './src/utils/validation.ts',
          ],
          'components-ui': [
            './src/components/ui/button.tsx',
            './src/components/ui/card.tsx',
            './src/components/ui/dialog.tsx',
            './src/components/ui/input.tsx',
            './src/components/ui/select.tsx',
            './src/components/ui/table.tsx',
            './src/components/ui/data-table.tsx',
          ],
          'components-forms': [
            './src/components/AddInvoiceDialog.tsx',
            './src/components/AddItemDialog.tsx',
            './src/components/AddEmployeeDialog.tsx',
            './src/components/AddProjectDialog.tsx',
            './src/components/AddPurchaseOrderDialog.tsx',
            './src/components/AddTransactionDialog.tsx',
          ],
        },
        
        // Generate separate chunks for each page
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '')
            : 'chunk';
          return `assets/js/[name]-[hash].js`;
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // External dependencies (if using CDN)
      external: mode === 'production' ? [] : [],
    },
    
    // Compression and minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.warn'] : [],
      },
      mangle: {
        safari10: true,
      },
      format: {
        safari10: true,
      },
    },
    
    // Source maps for development
    sourcemap: mode === 'development',
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 500,
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb
    
    // Report compressed file sizes
    reportCompressedSize: true,
  },
  
  // Optimization options
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
      'recharts',
      'zod',
      'react-hook-form',
      '@hookform/resolvers/zod',
    ],
    exclude: [
      // Exclude large libraries that should be code-split
    ],
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEVELOPMENT__: JSON.stringify(mode === 'development'),
  },
  
  // Preview server config (for production testing)
  preview: {
    port: 8080,
    host: true,
  },
}));
