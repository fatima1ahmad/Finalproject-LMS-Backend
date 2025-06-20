import { pool } from "../config/db.js";

const SystemModel = {
  async getPerformanceData() {
    try {
      // Get response times (example - you'd replace with real monitoring data)
      const responseTimes = await pool.query(`
        SELECT 
          DATE_TRUNC('hour', timestamp) AS time_label,
          AVG(response_time_ms) AS avg_response_time
        FROM system_metrics
        WHERE timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY time_label
        ORDER BY time_label
      `);

      // Get uptime percentages (example)
      const uptimeData = await pool.query(`
        SELECT 
          DATE_TRUNC('day', check_time) AS time_label,
          (SUM(CASE WHEN status = 'up' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) AS uptime_percentage
        FROM uptime_checks
        WHERE check_time >= NOW() - INTERVAL '30 days'
        GROUP BY time_label
        ORDER BY time_label
      `);

      return {
        labels: responseTimes.rows.map((row) =>
          new Date(row.time_label).toLocaleDateString()
        ),
        responseTimes: responseTimes.rows.map((row) =>
          Number(row.avg_response_time)
        ),
        uptimePercentages: uptimeData.rows.map((row) =>
          Number(row.uptime_percentage)
        ),
      };
    } catch (error) {
      throw error;
    }
  },
};

export default SystemModel;
