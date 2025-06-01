import React from 'react';
import { F1Weather } from '../types';

interface WeatherInfoProps {
  weather: F1Weather;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ weather }) => {
  const getWeatherIcon = (rainfall: number, temperature: number) => {
    if (rainfall > 0) return '🌧️';
    if (temperature > 30) return '☀️';
    if (temperature > 20) return '⛅';
    return '☁️';
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="weather-info">
      <h3>🌤️ Track Conditions</h3>
      
      <div className="weather-grid">
        <div className="weather-item">
          <span className="weather-icon">
            {getWeatherIcon(weather.rainfall, weather.air_temperature)}
          </span>
          <div className="weather-details">
            <span className="weather-label">Conditions</span>
            <span className="weather-value">
              {weather.rainfall > 0 ? 'Wet' : 'Dry'}
            </span>
          </div>
        </div>

        <div className="weather-item">
          <span className="weather-icon">🌡️</span>
          <div className="weather-details">
            <span className="weather-label">Air Temp</span>
            <span className="weather-value">{Math.round(weather.air_temperature)}°C</span>
          </div>
        </div>

        <div className="weather-item">
          <span className="weather-icon">🏁</span>
          <div className="weather-details">
            <span className="weather-label">Track Temp</span>
            <span className="weather-value">{Math.round(weather.track_temperature)}°C</span>
          </div>
        </div>

        <div className="weather-item">
          <span className="weather-icon">💨</span>
          <div className="weather-details">
            <span className="weather-label">Wind</span>
            <span className="weather-value">
              {Math.round(weather.wind_speed)} km/h {getWindDirection(weather.wind_direction)}
            </span>
          </div>
        </div>

        <div className="weather-item">
          <span className="weather-icon">💧</span>
          <div className="weather-details">
            <span className="weather-label">Humidity</span>
            <span className="weather-value">{Math.round(weather.humidity)}%</span>
          </div>
        </div>

        <div className="weather-item">
          <span className="weather-icon">📊</span>
          <div className="weather-details">
            <span className="weather-label">Pressure</span>
            <span className="weather-value">{Math.round(weather.pressure)} hPa</span>
          </div>
        </div>
      </div>
      
      <div className="weather-footer">
        <small>
          Last updated: {new Date(weather.date).toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default WeatherInfo; 