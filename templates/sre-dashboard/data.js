// SRE Framework UI Kit — utility functions + mock data
(function() {
  function spark(values, w, h, pad) {
    pad = pad == null ? 2 : pad;
    if (!values || !values.length) return '';
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var rng = (max - min) || 1;
    var step = values.length > 1 ? w / (values.length - 1) : 0;
    return values.map(function(v, i) {
      var x = (i * step).toFixed(1);
      var y = (pad + (h - pad * 2) * (1 - (v - min) / rng)).toFixed(1);
      return (i === 0 ? 'M' : 'L') + x + ',' + y;
    }).join(' ');
  }

  function area(values, w, h, pad) {
    var line = spark(values, w, h, pad);
    if (!line) return '';
    return line + ' L' + w + ',' + h + ' L0,' + h + ' Z';
  }

  function fmt(value, digits) {
    if (value === null || value === undefined) return '—';
    return Number(value).toFixed(digits != null ? digits : 1);
  }

  function fmtClock() {
    var d = new Date();
    var p = function(n) { return String(n).padStart(2, '0'); };
    return p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
  }

  function badge(name) {
    var parts = name.split('-');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  window.DashUtils = { spark: spark, area: area, fmt: fmt, fmtClock: fmtClock, badge: badge };

  var SERVICES = ['devex', 'api', 'worker'];

  window.MOCK_DATA = {
    devex: {
      kpis: { composite_slo: 99.97, error_budget_remaining_pct: 62.4, selected_service: 'devex', selected_request_rate: 43.2, selected_latency_p99_ms: 142, selected_error_rate_pct: 0.02 },
      slo_table: [
        { name: 'devex', slo_target: 99.9, sli: 99.98, error_budget_remaining: 80,   sparkline: [99.91,99.94,99.96,99.97,99.97,99.98,99.98,99.97,99.98] },
        { name: 'api',   slo_target: 99.5, sli: 99.72, error_budget_remaining: 44,   sparkline: [99.60,99.70,99.65,99.72,99.69,99.71,99.72,99.70,99.72] },
        { name: 'worker',slo_target: 99.0, sli: 98.91, error_budget_remaining: 9,    sparkline: [99.10,99.05,99.00,98.97,98.92,98.88,98.91,98.90,98.91] },
      ],
      golden_signals: {
        latency_p99_ms: 142, request_rate: 43.2, error_rate_pct: 0.02, saturation_pct: 34,
        series: {
          latency_p99_ms:  [120,135,141,138,145,142,139,144,142],
          request_rate:    [38, 41, 43, 40, 45, 43, 44, 42, 43],
          error_rate_pct:  [0.01,0.02,0.01,0.03,0.02,0.01,0.02,0.02,0.02],
          saturation_pct:  [30, 32, 34, 33, 35, 34, 33, 35, 34],
        }
      },
      error_budget_burn: {
        target: 99.9, budget_pct: 0.1, remaining_pct: 62.4,
        burn_curve: [100,98,96,94,91,88,86,84,82,80,78,77,75,74,73,72,70,69,68,67,66,65,64,63,62.4],
        burn_rate_1h: 0.43, burn_rate_6h: 0.71
      },
      capacity: { vps_cpu_pct: 41, vps_memory_pct: 58, vps_disk_pct: 23, service_container_cpu_pct: 34, service_container_memory_pct: 49 }
    },
    api: {
      kpis: { composite_slo: 99.72, error_budget_remaining_pct: 44, selected_service: 'api', selected_request_rate: 128.4, selected_latency_p99_ms: 287, selected_error_rate_pct: 0.28 },
      slo_table: [
        { name: 'devex', slo_target: 99.9, sli: 99.98, error_budget_remaining: 80,   sparkline: [99.91,99.94,99.96,99.97,99.97,99.98,99.98,99.97,99.98] },
        { name: 'api',   slo_target: 99.5, sli: 99.72, error_budget_remaining: 44,   sparkline: [99.60,99.70,99.65,99.72,99.69,99.71,99.72,99.70,99.72] },
        { name: 'worker',slo_target: 99.0, sli: 98.91, error_budget_remaining: 9,    sparkline: [99.10,99.05,99.00,98.97,98.92,98.88,98.91,98.90,98.91] },
      ],
      golden_signals: {
        latency_p99_ms: 287, request_rate: 128.4, error_rate_pct: 0.28, saturation_pct: 62,
        series: {
          latency_p99_ms:  [240,260,275,268,280,287,285,290,287],
          request_rate:    [120,125,130,128,131,129,128,127,128],
          error_rate_pct:  [0.15,0.20,0.25,0.28,0.22,0.25,0.28,0.30,0.28],
          saturation_pct:  [55, 58, 60, 62, 61, 63, 62, 64, 62],
        }
      },
      error_budget_burn: {
        target: 99.5, budget_pct: 0.5, remaining_pct: 44,
        burn_curve: [100,95,90,85,80,76,72,69,66,63,60,58,56,54,52,50,49,48,47,46,45,44.5,44.2,44.1,44],
        burn_rate_1h: 1.2, burn_rate_6h: 1.8
      },
      capacity: { vps_cpu_pct: 41, vps_memory_pct: 58, vps_disk_pct: 23, service_container_cpu_pct: 62, service_container_memory_pct: 71 }
    },
    worker: {
      kpis: { composite_slo: 98.91, error_budget_remaining_pct: 9, selected_service: 'worker', selected_request_rate: 8.7, selected_latency_p99_ms: 520, selected_error_rate_pct: 1.09 },
      slo_table: [
        { name: 'devex', slo_target: 99.9, sli: 99.98, error_budget_remaining: 80,   sparkline: [99.91,99.94,99.96,99.97,99.97,99.98,99.98,99.97,99.98] },
        { name: 'api',   slo_target: 99.5, sli: 99.72, error_budget_remaining: 44,   sparkline: [99.60,99.70,99.65,99.72,99.69,99.71,99.72,99.70,99.72] },
        { name: 'worker',slo_target: 99.0, sli: 98.91, error_budget_remaining: 9,    sparkline: [99.10,99.05,99.00,98.97,98.92,98.88,98.91,98.90,98.91] },
      ],
      golden_signals: {
        latency_p99_ms: 520, request_rate: 8.7, error_rate_pct: 1.09, saturation_pct: 81,
        series: {
          latency_p99_ms:  [380,420,460,490,510,520,525,518,520],
          request_rate:    [9.2,8.9,8.8,8.7,8.6,8.5,8.6,8.7,8.7],
          error_rate_pct:  [0.5,0.7,0.9,1.0,1.05,1.09,1.1,1.08,1.09],
          saturation_pct:  [70, 73, 76, 78, 80, 81, 82, 81, 81],
        }
      },
      error_budget_burn: {
        target: 99.0, budget_pct: 1.0, remaining_pct: 9,
        burn_curve: [100,92,84,76,69,63,57,52,47,42,38,34,30,27,24,21,19,17,15,13,12,11,10,9.5,9],
        burn_rate_1h: 3.2, burn_rate_6h: 4.1
      },
      capacity: { vps_cpu_pct: 41, vps_memory_pct: 58, vps_disk_pct: 23, service_container_cpu_pct: 81, service_container_memory_pct: 87 }
    }
  };

  window.SERVICES = SERVICES;
})();
