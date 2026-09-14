// =============================================================================
// SCINSMEDIA — Production-Readiness Traffic & Stability Load Test
// =============================================================================

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3008';
const ENDPOINTS = [
  { method: 'GET', path: '/api/v1/health', weight: 2 },
  { method: 'GET', path: '/api/v1/conferences', weight: 4 },
  { method: 'GET', path: '/api/v1/conferences/biopolymers-bioplastics-2026', weight: 4 },
];

function sendRequest(endpoint) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const url = new URL(endpoint.path, BASE_URL);

    const req = http.request(url, {
      method: endpoint.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Scinsmedia-Load-Auditor/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
        resolve({
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
          durationMs
        });
      });
    });

    req.on('error', (err) => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
      resolve({
        status: 0,
        success: false,
        durationMs,
        error: err.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy(new Error('Request timed out after 5s'));
    });

    req.end();
  });
}

function calculatePercentile(latencies, percentile) {
  if (latencies.length === 0) return 0;
  latencies.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * latencies.length) - 1;
  return latencies[Math.max(0, Math.min(index, latencies.length - 1))];
}

async function runStage(concurrency, totalRequests) {
  console.log(`\n--- Running Stage: Concurrency = ${concurrency}, Target Requests = ${totalRequests} ---`);
  const initialMem = process.memoryUsage();
  const startTime = Date.now();

  const results = [];
  let inFlight = 0;
  let dispatched = 0;

  return new Promise((resolve) => {
    function launchNext() {
      if (dispatched >= totalRequests) {
        if (inFlight === 0) {
          finishStage();
        }
        return;
      }

      while (inFlight < concurrency && dispatched < totalRequests) {
        dispatched++;
        inFlight++;
        
        // Pick endpoint based on weight
        const ep = ENDPOINTS[dispatched % ENDPOINTS.length];
        
        sendRequest(ep).then((res) => {
          results.push(res);
          inFlight--;
          launchNext();
        });
      }
    }

    function finishStage() {
      const totalTimeMs = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      const errorRate = (failed / results.length) * 100;
      const rps = (results.length / (totalTimeMs / 1000)).toFixed(1);

      const latencies = results.map(r => r.durationMs);
      const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
      const minLatency = Math.min(...latencies).toFixed(2);
      const maxLatency = Math.max(...latencies).toFixed(2);
      const p50 = calculatePercentile(latencies, 50).toFixed(2);
      const p95 = calculatePercentile(latencies, 95).toFixed(2);
      const p99 = calculatePercentile(latencies, 99).toFixed(2);
      const endMem = process.memoryUsage();

      const stageReport = {
        concurrency,
        totalRequests: results.length,
        successful,
        failed,
        errorRate: `${errorRate.toFixed(2)}%`,
        totalTimeSec: (totalTimeMs / 1000).toFixed(2),
        throughputRps: Number(rps),
        avgLatencyMs: Number(avgLatency),
        minLatencyMs: Number(minLatency),
        maxLatencyMs: Number(maxLatency),
        p50Ms: Number(p50),
        p95Ms: Number(p95),
        p99Ms: Number(p99),
        rssMb: (endMem.rss / (1024 * 1024)).toFixed(1),
        heapUsedMb: (endMem.heapUsed / (1024 * 1024)).toFixed(1)
      };

      console.log(`Done in ${stageReport.totalTimeSec}s | RPS: ${stageReport.throughputRps} | Avg: ${stageReport.avgLatencyMs}ms | P95: ${stageReport.p95Ms}ms | P99: ${stageReport.p99Ms}ms | Errors: ${stageReport.errorRate}`);
      resolve(stageReport);
    }

    launchNext();
  });
}

async function runAudit() {
  console.log('=============================================================================');
  console.log('SCINSMEDIA TRAFFIC & STABILITY LOAD AUDIT');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('=============================================================================');

  const stages = [
    { concurrency: 10, totalRequests: 100 },   // Baseline
    { concurrency: 25, totalRequests: 250 },   // Moderate
    { concurrency: 50, totalRequests: 500 },   // Peak
    { concurrency: 100, totalRequests: 1000 }, // High Traffic
    { concurrency: 200, totalRequests: 1500 }  // Stress Limit
  ];

  const stageResults = [];

  for (const s of stages) {
    const res = await runStage(s.concurrency, s.totalRequests);
    stageResults.push(res);
    // 500ms breather between stages
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=============================================================================');
  console.log('AUDIT SUMMARY TABLE');
  console.log('=============================================================================');
  console.table(stageResults.map(r => ({
    'Concurrency': r.concurrency,
    'Total Reqs': r.totalRequests,
    'RPS': r.throughputRps,
    'Avg Latency': `${r.avgLatencyMs}ms`,
    'P95 Latency': `${r.p95Ms}ms`,
    'P99 Latency': `${r.p99Ms}ms`,
    'Error Rate': r.errorRate,
    'Heap (MB)': r.heapUsedMb
  })));

  console.log('\nAudit complete.');
}

runAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});
