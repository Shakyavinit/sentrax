import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

export interface AlertEvent {
  alert_id: number;
  plate_number: string;
  camera_id: string;
  severity: string;
  timestamp: string;
  reason: string;
  vehicle?: string;
  snapshot_url?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  latestAlert: AlertEvent | null;
  recentAlerts: AlertEvent[];
  clearAlerts: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState<AlertEvent | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: any;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/v1/ws/alerts`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('[SENTRAX WS] Connected to Alert Stream');
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'ALERT_TRIGGERED') {
              const alertData: AlertEvent = payload.data;
              setLatestAlert(alertData);
              setRecentAlerts((prev) => [alertData, ...prev.slice(0, 49)]);
            }
          } catch (err) {
            console.error('[SENTRAX WS] Parse error', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 4000);
      }
    };

    connectWs();

    // Keepalive ping every 25s
    const pingInterval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ ping: true }));
      }
    }, 25000);

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const clearAlerts = () => {
    setRecentAlerts([]);
    setLatestAlert(null);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, latestAlert, recentAlerts, clearAlerts }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useAlertStream = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useAlertStream must be used within WebSocketProvider');
  }
  return ctx;
};
