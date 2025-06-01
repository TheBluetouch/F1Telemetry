import React, { useMemo } from 'react';
import { F1CarData, F1Driver } from '../types';

interface TelemetryPanelProps {
  carData: F1CarData[];
  drivers: F1Driver[];
}

interface DriverTelemetry {
  driver: F1Driver;
  latestData: F1CarData | null;
}

const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ carData, drivers }) => {
  const driverTelemetry = useMemo(() => {
    return drivers.map(driver => {
      const driverCarData = carData
        .filter(data => data.driver_number === driver.driver_number)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        driver,
        latestData: driverCarData[0] || null
      } as DriverTelemetry;
    }).filter(dt => dt.latestData !== null);
  }, [carData, drivers]);

  const formatSpeed = (speed?: number) => {
    return speed ? `${Math.round(speed)} km/h` : '-';
  };

  const formatRPM = (rpm?: number) => {
    return rpm ? `${Math.round(rpm)} RPM` : '-';
  };

  const getGearDisplay = (gear?: number) => {
    if (gear === undefined || gear === null) return '-';
    if (gear === 0) return 'N';
    if (gear < 0) return 'R';
    return gear.toString();
  };

  const getDRSStatus = (drs?: number) => {
    if (drs === undefined || drs === null) return '❓';
    return drs > 0 ? '✅ Open' : '❌ Closed';
  };

  const getThrottleColor = (throttle?: number) => {
    if (!throttle) return '#333';
    const intensity = throttle / 100;
    return `hsl(${120 - (intensity * 120)}, 70%, 50%)`;
  };

  if (driverTelemetry.length === 0) {
    return (
      <div className="telemetry-panel">
        <h3>📊 Live Telemetry</h3>
        <div className="no-telemetry">
          <p>No telemetry data available</p>
          <small>Telemetry data is only available during active sessions</small>
        </div>
      </div>
    );
  }

  return (
    <div className="telemetry-panel">
      <h3>📊 Live Telemetry</h3>
      <div className="telemetry-grid">
        {driverTelemetry.slice(0, 6).map(({ driver, latestData }) => (
          <div key={driver.driver_number} className="telemetry-card">
            <div className="telemetry-header">
              <div 
                className="team-indicator" 
                style={{ backgroundColor: `#${driver.team_colour}` }}
              ></div>
              <div className="driver-info">
                <span className="driver-number">#{driver.driver_number}</span>
                <span className="driver-acronym">{driver.name_acronym}</span>
              </div>
            </div>

            <div className="telemetry-data">
              <div className="data-row">
                <span className="data-label">Speed:</span>
                <span className="data-value speed">
                  {formatSpeed(latestData?.speed)}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Gear:</span>
                <span className="data-value gear">
                  {getGearDisplay(latestData?.gear)}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">RPM:</span>
                <span className="data-value rpm">
                  {formatRPM(latestData?.rpm)}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">DRS:</span>
                <span className="data-value drs">
                  {getDRSStatus(latestData?.drs)}
                </span>
              </div>

              <div className="data-row">
                <span className="data-label">Throttle:</span>
                <div className="throttle-container">
                  <div className="throttle-bar">
                    <div 
                      className="throttle-fill"
                      style={{ 
                        width: `${latestData?.throttle || 0}%`,
                        backgroundColor: getThrottleColor(latestData?.throttle)
                      }}
                    ></div>
                  </div>
                  <span className="throttle-value">
                    {latestData?.throttle ? `${Math.round(latestData.throttle)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="data-row">
                <span className="data-label">Brake:</span>
                <span className={`data-value brake ${latestData?.brake ? 'active' : ''}`}>
                  {latestData?.brake ? '🔴 ON' : '⚫ OFF'}
                </span>
              </div>
            </div>

            <div className="telemetry-footer">
              <small>
                Last update: {latestData ? new Date(latestData.date).toLocaleTimeString() : '-'}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryPanel; 