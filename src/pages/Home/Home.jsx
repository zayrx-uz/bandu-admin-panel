import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { getHealth } from '../../services/api';

export function Home() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealth();
    // Refresh health status every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      setError('');
      const response = await getHealth();
      setHealth(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch health status');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'healthy' || status === 'ok' || status === 'up') {
      return 'text-green-600 dark:text-green-400';
    }
    if (status === 'unhealthy' || status === 'down') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getStatusBg = (status) => {
    if (status === 'healthy' || status === 'ok' || status === 'up') {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
    if (status === 'unhealthy' || status === 'down') {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  return (
    <div className="space-y-6">
      <Typography variant="h3" color="blue-gray">
        Dashboard
      </Typography>

      {/* Health Status Card */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h5" color="blue-gray">
              API Health Status
            </Typography>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
              <Typography variant="small">{error}</Typography>
            </div>
          )}

          {health && (
            <div className="space-y-4">
              {/* Overall Status */}
              {health.status && (
                <div className={`p-4 rounded-lg border ${getStatusBg(health.status)}`}>
                  <div className="flex items-center justify-between">
                    <Typography variant="h6" color="blue-gray">
                      Status
                    </Typography>
                    <Typography variant="h6" className={getStatusColor(health.status)}>
                      {health.status.toUpperCase()}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Health Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {health.uptime !== undefined && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Typography variant="small" color="gray" className="mb-1">
                      Uptime
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {typeof health.uptime === 'number' 
                        ? `${Math.floor(health.uptime / 60)} minutes`
                        : health.uptime}
                    </Typography>
                  </div>
                )}

                {health.timestamp && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Typography variant="small" color="gray" className="mb-1">
                      Last Check
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {new Date(health.timestamp).toLocaleString()}
                    </Typography>
                  </div>
                )}

                {health.version && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Typography variant="small" color="gray" className="mb-1">
                      API Version
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {health.version}
                    </Typography>
                  </div>
                )}

                {health.environment && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Typography variant="small" color="gray" className="mb-1">
                      Environment
                    </Typography>
                    <Typography variant="h6" color="blue-gray">
                      {health.environment}
                    </Typography>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {health.info && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Typography variant="small" color="gray" className="mb-2">
                    Additional Information
                  </Typography>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(health.info, null, 2)}
                  </pre>
                </div>
              )}

              {/* Database Status */}
              {health.database && (
                <div className={`p-4 rounded-lg border ${getStatusBg(health.database.status)}`}>
                  <div className="flex items-center justify-between">
                    <Typography variant="h6" color="blue-gray">
                      Database
                    </Typography>
                    <Typography variant="h6" className={getStatusColor(health.database.status)}>
                      {health.database.status?.toUpperCase() || 'UNKNOWN'}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Raw Health Data (for debugging) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  View Raw Health Data
                </summary>
                <pre className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {!loading && !health && !error && (
            <Typography variant="small" color="gray">
              No health data available
            </Typography>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Home