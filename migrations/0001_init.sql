-- Migration: Initialize request_logs table for observability data
CREATE TABLE IF NOT EXISTS request_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  method TEXT,
  path TEXT,
  status INTEGER,
  latency_ms INTEGER,
  payload_size_bytes INTEGER,
  correlation_id TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_request_logs_timestamp
  ON request_logs (timestamp);

CREATE INDEX IF NOT EXISTS idx_request_logs_correlation
  ON request_logs (correlation_id);
