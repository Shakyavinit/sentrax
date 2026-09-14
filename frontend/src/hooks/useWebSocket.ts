import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../utils/constants';
import { DEMO_MODE } from '../utils/demo';

export function useWebSocket(path = '/api/v1/ws/monitor') {
  const [connected, setConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const handlers = useRef<Map<string, Function>>(new Map());

  useEffect(() => {
    if (DEMO_MODE) return;
    let disposed = false;
    let reconnectTimeout: any;
    const connect = () => {
      try {
        const fullUrl = `${WS_BASE_URL}${path}`;
        ws.current = new WebSocket(fullUrl);

        ws.current.onopen = () => {
          setConnected(true);
        };

        ws.current.onclose = () => {
          setConnected(false);
          if (!disposed) reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.current.onerror = () => {
          ws.current?.close();
        };

        ws.current.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            const handler = handlers.current.get(msg.type);
            if (handler) handler(msg.payload);
          } catch {}
        };
      } catch {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimeout);
      ws.current?.close();
    };
  }, [path]);

  const on = useCallback((type: string, handler: Function) => {
    handlers.current.set(type, handler);
  }, []);

  const send = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, on, send };
}
