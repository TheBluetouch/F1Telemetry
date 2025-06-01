import React from 'react';
import { F1RaceControl } from '../types';

interface RaceControlPanelProps {
  raceControl: F1RaceControl[];
}

const RaceControlPanel: React.FC<RaceControlPanelProps> = ({ raceControl }) => {
  if (!raceControl || raceControl.length === 0) return null;

  // Get recent messages (last 5)
  const recentMessages = raceControl
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getFlagEmoji = (flag: string | null) => {
    if (!flag) return '';
    switch (flag.toUpperCase()) {
      case 'YELLOW': return '🟡';
      case 'DOUBLE YELLOW': return '🟡🟡';
      case 'RED': return '🔴';
      case 'GREEN': return '🟢';
      case 'BLUE': return '🔵';
      case 'CLEAR': return '⚪';
      case 'CHEQUERED': return '🏁';
      default: return '🏳️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'flag': return '#f59e0b'; // amber
      case 'safetycar': return '#ef4444'; // red
      case 'other': return '#06b6d4'; // cyan
      default: return '#6b7280'; // gray
    }
  };

  return (
    <div className="race-control-panel">
      <div className="race-control-header">
        <span className="race-control-title">🚩 Race Control</span>
      </div>
      <div className="race-control-messages">
        {recentMessages.map((message, index) => (
          <div key={index} className="race-control-message">
            <div className="message-time">
              {formatTime(message.date)}
            </div>
            <div className="message-content">
              <span 
                className="message-category"
                style={{ color: getCategoryColor(message.category) }}
              >
                {getFlagEmoji(message.flag)} {message.category.toUpperCase()}
              </span>
              <span className="message-text">
                {message.message}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RaceControlPanel; 