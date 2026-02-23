// Path: E:\EduQuest\server\src\middleware\analytics.js

// ══════════════════════════════════════════════════════════════
// IN-MEMORY ANALYTICS STORE
// ══════════════════════════════════════════════════════════════
const analytics = {
  requests: {
    total: 0,
    byEndpoint: {},
    byMethod: {},
    byStatusCode: {},
  },
  errors: [],
  slowRequests: [],
  startTime: Date.now(),
};

// ══════════════════════════════════════════════════════════════
// REQUEST TRACKING MIDDLEWARE
// ══════════════════════════════════════════════════════════════
const trackRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Increment total
  analytics.requests.total++;
  
  // Track by endpoint
  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  analytics.requests.byEndpoint[endpoint] = (analytics.requests.byEndpoint[endpoint] || 0) + 1;
  
  // Track by method
  analytics.requests.byMethod[req.method] = (analytics.requests.byMethod[req.method] || 0) + 1;
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    // Track by status code
    const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;
    analytics.requests.byStatusCode[statusGroup] = (analytics.requests.byStatusCode[statusGroup] || 0) + 1;
    
    // Track errors (4xx, 5xx)
    if (res.statusCode >= 400) {
      analytics.errors.push({
        endpoint,
        method: req.method,
        statusCode: res.statusCode,
        ip: req.ip,
        timestamp: new Date(),
        duration,
      });
      
      // Keep only last 100 errors
      if (analytics.errors.length > 100) {
        analytics.errors.shift();
      }
    }
    
    // Track slow requests (> 1 second)
    if (duration > 1000) {
      analytics.slowRequests.push({
        endpoint,
        method: req.method,
        duration,
        timestamp: new Date(),
      });
      
      // Keep only last 50 slow requests
      if (analytics.slowRequests.length > 50) {
        analytics.slowRequests.shift();
      }
      
      console.warn(`⏱️  Slow request: ${endpoint} took ${duration}ms`);
    }
    
    originalSend.apply(res, arguments);
  };
  
  next();
};

// ══════════════════════════════════════════════════════════════
// ANALYTICS ENDPOINT
// ══════════════════════════════════════════════════════════════
const getAnalytics = (req, res) => {
  const uptime = Date.now() - analytics.startTime;
  const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);
  
  // Top 10 endpoints
  const topEndpoints = Object.entries(analytics.requests.byEndpoint)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }));
  
  // Recent errors (last 20)
  const recentErrors = analytics.errors.slice(-20).reverse();
  
  // Recent slow requests (last 20)
  const recentSlowRequests = analytics.slowRequests.slice(-20).reverse();
  
  return res.json({
    uptime: {
      milliseconds: uptime,
      hours: uptimeHours,
      startedAt: new Date(analytics.startTime).toISOString(),
    },
    requests: {
      total: analytics.requests.total,
      byMethod: analytics.requests.byMethod,
      byStatusCode: analytics.requests.byStatusCode,
      topEndpoints,
    },
    errors: {
      total: analytics.errors.length,
      recent: recentErrors,
    },
    performance: {
      slowRequestCount: analytics.slowRequests.length,
      recent: recentSlowRequests,
    },
  });
};

module.exports = {
  trackRequest,
  getAnalytics,
  analytics,
};