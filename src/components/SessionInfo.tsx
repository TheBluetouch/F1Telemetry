import React from 'react';
import { F1Session } from '../types';

interface SessionInfoProps {
  session: F1Session | null;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ session }) => {
  if (!session) return null;

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getSessionTypeEmoji = (sessionType: string) => {
    switch (sessionType.toLowerCase()) {
      case 'race': return '🏁';
      case 'qualifying': return '🎯';
      case 'practice': return '🔧';
      case 'sprint': return '⚡';
      default: return '🏎️';
    }
  };

  return (
    <div className="session-info">
      <div className="session-main">
        <span className="session-location">
          🏁 {session.session_name} • {session.location}, {session.country_name}
        </span>
        <span className="session-circuit">
          {session.circuit_short_name} • {session.year}
        </span>
      </div>
      <div className="session-time">
        <span className="session-date">
          {formatDateTime(session.date_start)} - {formatDateTime(session.date_end)}
        </span>
      </div>
    </div>
  );
};

export default SessionInfo; 