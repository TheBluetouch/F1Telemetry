import React, { useMemo } from 'react';
import { F1Driver, F1Position, F1Timing, F1Interval } from '../types';

interface DriversTableProps {
  drivers: F1Driver[];
  positions: F1Position[];
  timing: F1Timing[];
  intervals: F1Interval[];
}

interface DriverWithPosition extends F1Driver {
  position?: number;
  lastLapTime?: number;
  lapCount?: number;
  bestLapTime?: number;
  sector1?: number;
  sector2?: number;
  sector3?: number;
  sector1Prev?: number;
  sector2Prev?: number;
  sector3Prev?: number;
  interval?: number | null;
  gapToLeader?: number;
  i1Speed?: number;
  i2Speed?: number;
}

const DriversTable: React.FC<DriversTableProps> = ({ drivers, positions, timing, intervals }) => {
  const driversWithPositions = useMemo(() => {
    return drivers.map(driver => {
      // Find latest position for this driver
      const driverPositions = positions
        .filter(p => p.driver_number === driver.driver_number)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latestPosition = driverPositions[0];

      // Find ALL timing data for this driver (don't filter by lap_duration)
      const driverTiming = timing
        .filter(t => t.driver_number === driver.driver_number)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Find timing with valid lap_duration for display
      const validTiming = driverTiming.filter(t => t.lap_duration && t.lap_duration > 0);
      const latestValidTiming = validTiming[0];
      
      // Find best lap time (shortest duration) from valid timing data
      const bestTiming = validTiming.reduce((best, current) => {
        if (!best || (current.lap_duration > 0 && current.lap_duration < best.lap_duration)) {
          return current;
        }
        return best;
      }, null as F1Timing | null);

      // Get lap count from the highest lap_number for this driver
      const maxLap = Math.max(...driverTiming.map(t => t.lap_number || 0));
      const lapCount = maxLap > 0 ? maxLap : 0;

      // Get sector data from CURRENT lap for live sector times
      const currentLapData = driverTiming.find(t => t.lap_number === maxLap);
      
      // Get sector data from PREVIOUS lap (lap -1) for completed sector times
      const previousLap = lapCount > 1 ? lapCount - 1 : lapCount;
      const previousLapData = driverTiming.find(t => t.lap_number === previousLap);
      
      // Get latest interval data for this driver
      const driverIntervals = intervals
        .filter(i => i.driver_number === driver.driver_number)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const latestInterval = driverIntervals[0];
      
      // Fallback to latest data if current lap data not found
      const driverTimingSortedByLap = driverTiming
        .sort((a, b) => {
          // First sort by lap_number (highest first)
          if ((a.lap_number || 0) !== (b.lap_number || 0)) {
            return (b.lap_number || 0) - (a.lap_number || 0);
          }
          // Then by date (most recent first)
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      
      const latestTimingData = currentLapData || driverTimingSortedByLap[0];

      console.log(`Driver ${driver.driver_number}: ${driverTiming.length} timing records, max lap: ${maxLap}, using lap ${maxLap} for current sectors, lap ${previousLap} for previous sectors`);
      
      // Debug sector data
      if (latestTimingData) {
        console.log(`Driver ${driver.driver_number} current sector timing from lap ${latestTimingData.lap_number}:`, {
          current_s1: latestTimingData.duration_sector_1,
          current_s2: latestTimingData.duration_sector_2,
          current_s3: latestTimingData.duration_sector_3,
        });
      }
      
      if (previousLapData) {
        console.log(`Driver ${driver.driver_number} previous sector timing from lap ${previousLapData.lap_number}:`, {
          prev_s1: previousLapData.duration_sector_1,
          prev_s2: previousLapData.duration_sector_2,
          prev_s3: previousLapData.duration_sector_3,
        });
      }

      return {
        ...driver,
        position: latestPosition?.position,
        lastLapTime: latestValidTiming?.lap_duration,
        lapCount: lapCount,
        bestLapTime: bestTiming?.lap_duration,
        sector1: latestTimingData?.duration_sector_1,
        sector2: latestTimingData?.duration_sector_2,
        sector3: latestTimingData?.duration_sector_3,
        sector1Prev: previousLapData?.duration_sector_1,
        sector2Prev: previousLapData?.duration_sector_2,
        sector3Prev: previousLapData?.duration_sector_3,
        interval: latestInterval?.interval,
        gapToLeader: latestInterval?.gap_to_leader,
        i1Speed: latestTimingData?.i1_speed,
        i2Speed: latestTimingData?.i2_speed
      } as DriverWithPosition;
    }).sort((a, b) => (a.position || 999) - (b.position || 999));
  }, [drivers, positions, timing, intervals]);

  const formatLapTime = (timeInSeconds?: number) => {
    if (!timeInSeconds || timeInSeconds <= 0) return '-';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
    } else {
      return `${seconds.toFixed(3)}s`;
    }
  };

  const formatSectorTime = (timeInSeconds?: number) => {
    if (!timeInSeconds || timeInSeconds <= 0) return '-';
    return `${timeInSeconds.toFixed(3)}s`;
  };

  const formatIntervalTime = (timeInSeconds?: number | null) => {
    if (timeInSeconds === null || timeInSeconds === undefined) return '-';
    
    // Convert to number and validate
    const numValue = Number(timeInSeconds);
    if (isNaN(numValue) || numValue < 0) return '-';
    if (numValue === 0) return 'LEAD';
    
    return `+${numValue.toFixed(3)}s`;
  };

  const getPositionIcon = (position?: number) => {
    if (!position) return '❓';
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position.toString();
  };

  return (
    <div className="drivers-table">
      <h3>🏁 Live Race Standings</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Laps</th>
              <th>Last Lap</th>
              <th>Best Lap</th>
              <th>Interval</th>
              <th>Gap</th>
              <th>S1 (Live)</th>
              <th>S2 (Live)</th>
              <th>S3 (Live)</th>
              <th>S1 (Prev)</th>
              <th>S2 (Prev)</th>
              <th>S3 (Prev)</th>
            </tr>
          </thead>
          <tbody>
            {driversWithPositions.map(driver => (
              <tr key={driver.driver_number}>
                <td className="position">
                  <span className="position-indicator">
                    {getPositionIcon(driver.position)}
                  </span>
                </td>
                
                <td className="driver">
                  <div className="driver-info">
                    <span className="driver-number">#{driver.driver_number}</span>
                    <span className="driver-name">{driver.broadcast_name}</span>
                    <span className="country-flag">
                      {driver.country_code}
                    </span>
                  </div>
                </td>
                
                <td className="team">
                  <div 
                    className="team-color" 
                    style={{ backgroundColor: `#${driver.team_colour}` }}
                  ></div>
                  <span className="team-name">{driver.team_name}</span>
                </td>
                
                <td className="lap-count">
                  {driver.lapCount || 0}
                </td>
                
                <td className="lap-time">
                  {formatLapTime(driver.lastLapTime)}
                </td>
                
                <td className="best-lap-time">
                  {formatLapTime(driver.bestLapTime)}
                </td>
                
                <td className="interval-time">
                  {formatIntervalTime(driver.interval)}
                </td>
                
                <td className="gap-time">
                  {formatIntervalTime(driver.gapToLeader)}
                </td>
                
                <td className="sector-time sector-1">
                  {formatSectorTime(driver.sector1)}
                </td>
                
                <td className="sector-time sector-2">
                  {formatSectorTime(driver.sector2)}
                </td>
                
                <td className="sector-time sector-3">
                  {formatSectorTime(driver.sector3)}
                </td>
                
                <td className="sector-time sector-1-prev">
                  {formatSectorTime(driver.sector1Prev)}
                </td>
                
                <td className="sector-time sector-2-prev">
                  {formatSectorTime(driver.sector2Prev)}
                </td>
                
                <td className="sector-time sector-3-prev">
                  {formatSectorTime(driver.sector3Prev)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {driversWithPositions.length === 0 && (
          <div className="no-data">
            <p>🔄 Loading race data...</p>
            <small>Waiting for live timing data</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriversTable; 