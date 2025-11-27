// src/LogsView.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function LogsView() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4002/api/logs')
      .then(res => setLogs(res.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '700px',
      margin: '30px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fafafa',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Logs
      </h2>

      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        {logs.map((log, i) => (
          <li key={i} style={{
            background: '#fff',
            padding: '15px',
            marginBottom: '10px',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', color: '#444' }}>
              <strong style={{ color: '#007bff' }}>
                {log.timestamp}
              </strong>
              <span style={{
                fontWeight: 'bold',
                marginLeft: '8px',
                color: '#555'
              }}>
                [{log.span}]
              </span>
            </div>

            <div style={{
              marginTop: '5px',
              fontSize: '15px',
              color: '#333'
            }}>
              {log.message}
            </div>

            {log.traceId && (
              <div style={{
                marginTop: '4px',
                fontSize: '13px',
                color: '#777'
              }}>
                trace: {log.traceId}
              </div>
            )}
          </li>
        ))}
      </ul>

    </div>
  );
}
