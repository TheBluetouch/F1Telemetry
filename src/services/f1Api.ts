import axios, { AxiosResponse } from 'axios';
import {
  F1Session,
  F1Driver,
  F1Position,
  F1CarData,
  F1Timing,
  F1Interval,
  F1RaceControl,
  DashboardData
} from '../types';

const BASE_URL = 'https://api.openf1.org/v1';
const REQUEST_DELAY = 150; // ms between requests to avoid rate limiting

class F1ApiService {
  private raceControlCounter = 0; // Counter for race control requests
  private lastRaceControlData: F1RaceControl[] = [];

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${BASE_URL}${url}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'F1-Telemetry-App/1.0.0'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error(`API Error for ${url}:`, error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - API might be slow');
      }
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - too many requests');
      }
      if (error.response?.status >= 500) {
        throw new Error('Server error - API is down');
      }
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }

  async getLatestSession(): Promise<F1Session | null> {
    try {
      const currentYear = new Date().getFullYear();
      const sessions = await this.makeRequest<F1Session[]>(`/sessions?year=${currentYear}`);
      
      if (!sessions || sessions.length === 0) {
        // Try previous year if no sessions found
        const prevYearSessions = await this.makeRequest<F1Session[]>(`/sessions?year=${currentYear - 1}`);
        if (!prevYearSessions || prevYearSessions.length === 0) {
          return null;
        }
        return prevYearSessions[prevYearSessions.length - 1];
      }
      
      // Return the most recent session
      return sessions[sessions.length - 1];
    } catch (error) {
      console.error('Error fetching latest session:', error);
      return null;
    }
  }

  async getDrivers(sessionKey: number): Promise<F1Driver[]> {
    try {
      const drivers = await this.makeRequest<F1Driver[]>(`/drivers?session_key=${sessionKey}`);
      return drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  async getPositions(sessionKey: number): Promise<F1Position[]> {
    try {
      const positions = await this.makeRequest<F1Position[]>(`/position?session_key=${sessionKey}`);
      console.log(`Position data for session ${sessionKey}:`, positions?.length || 0, 'records');
      return positions || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  async getCarData(sessionKey: number, limit: number = 100): Promise<F1CarData[]> {
    try {
      const carData = await this.makeRequest<F1CarData[]>(`/car_data?session_key=${sessionKey}&limit=${limit}`);
      return carData || [];
    } catch (error) {
      console.error('Error fetching car data:', error);
      return [];
    }
  }

  async getTiming(sessionKey: number): Promise<F1Timing[]> {
    try {
      const timing = await this.makeRequest<F1Timing[]>(`/laps?session_key=${sessionKey}`);
      console.log(`Timing (laps) data: ${timing?.length || 0} records`);
      
      if (timing && timing.length > 0) {
        // Simplified logging - only essential info
        const driversWithTiming = new Set(timing.map(t => t.driver_number));
        const lapNumbers = timing.map(t => t.lap_number).filter(n => n > 0);
        const maxLap = lapNumbers.length > 0 ? Math.max(...lapNumbers) : 0;
        
        console.log(`Timing: ${driversWithTiming.size} drivers, max lap: ${maxLap}`);
      }
      return timing || [];
    } catch (error) {
      console.error('Error fetching timing:', error);
      return [];
    }
  }

  async getRaceControl(sessionKey: number, forceRefresh: boolean = false): Promise<F1RaceControl[]> {
    try {
      // Only fetch race control data every 3rd request (30 seconds instead of 10)
      this.raceControlCounter++;
      
      if (!forceRefresh && this.raceControlCounter % 3 !== 0 && this.lastRaceControlData.length > 0) {
        console.log(`Race Control: Using cached data (counter: ${this.raceControlCounter})`);
        return this.lastRaceControlData;
      }

      const raceControl = await this.makeRequest<F1RaceControl[]>(`/race_control?session_key=${sessionKey}`);
      console.log(`Race Control data for session ${sessionKey}:`, raceControl?.length || 0, 'messages (fresh fetch)');
      
      if (raceControl && raceControl.length > 0) {
        console.log('Recent race control messages:', raceControl.slice(-3)); // Show last 3 messages
        
        // Check message categories
        const categories = new Set(raceControl.map(rc => rc.category));
        console.log(`Race Control categories: ${Array.from(categories).join(', ')}`);
        
        // Only show flags if they're recent (last 5 messages)
        const recentFlags = raceControl.slice(-5).filter(rc => rc.flag).map(rc => rc.flag);
        const uniqueFlags = new Set(recentFlags);
        if (uniqueFlags.size > 0) {
          console.log(`Recent flags: ${Array.from(uniqueFlags).join(', ')}`);
        }
      }
      
      this.lastRaceControlData = raceControl || [];
      return this.lastRaceControlData;
    } catch (error) {
      console.error('Error fetching race control:', error);
      return this.lastRaceControlData; // Return cached data on error
    }
  }

  async getIntervals(sessionKey: number): Promise<F1Interval[]> {
    try {
      const intervals = await this.makeRequest<F1Interval[]>(`/intervals?session_key=${sessionKey}`);
      console.log(`Intervals data: ${intervals?.length || 0} records`);
      
      if (intervals && intervals.length > 0) {
        // Simplified logging - only essential info
        const driversWithIntervals = new Set(intervals.map(i => i.driver_number));
        console.log(`Intervals: ${driversWithIntervals.size} drivers with gap data`);
      }
      return intervals || [];
    } catch (error) {
      console.error('Error fetching intervals:', error);
      return [];
    }
  }

  // Batch request method to get all data with proper delays
  async getBatchData(sessionKey: number): Promise<DashboardData> {
    const startTime = Date.now();
    console.log(`🚀 Starting batch request for session ${sessionKey}`);
    
    try {
      // Get session info first
      const session = await this.getLatestSession();
      await this.delay(REQUEST_DELAY);

      // Get drivers (rarely changes)
      const drivers = await this.getDrivers(sessionKey);
      await this.delay(REQUEST_DELAY);

      // Get positions (frequent updates needed)
      const positions = await this.getPositions(sessionKey);
      await this.delay(REQUEST_DELAY);

      // Skip car data for now (not essential for dashboard)
      const carData: F1CarData[] = [];

      // Get timing data (laps - frequent updates needed)
      const timing = await this.getTiming(sessionKey);
      await this.delay(REQUEST_DELAY);

      // Get intervals data (frequent updates needed)
      const intervals = await this.getIntervals(sessionKey);
      await this.delay(REQUEST_DELAY);

      // Get race control data (reduced frequency - every 30 seconds)
      const raceControl = await this.getRaceControl(sessionKey);

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      console.log(`✅ Batch request completed in ${totalTime}ms`);
      console.log(`📊 Data summary: ${drivers.length} drivers, ${positions.length} positions, ${timing.length} laps, ${intervals.length} intervals, ${raceControl.length} race control messages`);

      return {
        session,
        drivers,
        positions,
        carData,
        timing,
        intervals,
        raceControl,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error in batch request:', error);
      throw error;
    }
  }

  // Get current or most recent session data
  async getCurrentSessionData(): Promise<DashboardData> {
    const session = await this.getLatestSession();
    
    if (!session) {
      return {
        session: null,
        drivers: [],
        positions: [],
        carData: [],
        timing: [],
        intervals: [],
        raceControl: [],
        lastUpdated: new Date()
      };
    }

    return this.getBatchData(session.session_key);
  }
}

export const f1Api = new F1ApiService(); 