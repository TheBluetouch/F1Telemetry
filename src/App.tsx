import React, { useState, useEffect, useCallback } from 'react';
import { DashboardData } from './types';
import { f1Api } from './services/f1Api';
import DriversTable from './components/DriversTable';
import SessionInfo from './components/SessionInfo';
import RaceControlPanel from './components/RaceControlPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

const REFRESH_INTERVAL = 10000; // 10 seconds

function App() {
  const [data, setData] = useState<DashboardData>({
    session: null,
    drivers: [],
    positions: [],
    carData: [],
    timing: [],
    intervals: [],
    raceControl: [],
    lastUpdated: new Date()
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const newData = await f1Api.getCurrentSessionData();
      setData(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch F1 data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handleManualRefresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading && !data.session) {
    return (
      <div className="app">
        <LoadingSpinner message="Loading F1 race data..." />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏁 F1 Live Race Standings</h1>
        <div className="header-controls">
          <span className="last-updated">
            Last updated: {data.lastUpdated.toLocaleTimeString()}
          </span>
          <button
            className={`refresh-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={handleRefreshToggle}
            title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            {autoRefresh ? '⏸️' : '▶️'} Auto-refresh
          </button>
          <button
            className="manual-refresh"
            onClick={handleManualRefresh}
            disabled={loading}
            title="Refresh now"
          >
            🔄 Refresh
          </button>
        </div>
      </header>

      {/* Minimal session info - only shown when session data is available */}
      {data.session && <SessionInfo session={data.session} />}

      {/* Race Control Panel - only shown when race control data is available */}
      {data.raceControl.length > 0 && <RaceControlPanel raceControl={data.raceControl} />}

      <main className="app-main">
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleManualRefresh}
          />
        )}

        {data.session && data.drivers.length > 0 && (
          <div className="drivers-section-race">
            <DriversTable 
              drivers={data.drivers}
              positions={data.positions}
              timing={data.timing}
              intervals={data.intervals}
            />
          </div>
        )}

        {(!data.session || data.drivers.length === 0) && !loading && !error && (
          <div className="no-session">
            <h2>🏎️ No Active Race Session</h2>
            <p>No Formula 1 race is currently active.</p>
            <p>The app will automatically check for new sessions.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>🏁 Live F1 Data • Powered by OpenF1 API</p>
      </footer>
    </div>
  );
}

export default App; 