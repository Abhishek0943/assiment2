// src/MessageForm.js
import { useState } from 'react';
import axios from 'axios';

export default function MessageForm() {
  const [to, setTo] = useState('');
  const [channel, setChannel] = useState('email');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:4000/api/messages', {
        to, channel, body,
      });
      setResponse(data);
    } catch (err) {
      setResponse(err.response?.data || { error: 'Request failed' });
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '30px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: '#fafafa',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Send Message
      </h2>

      <form onSubmit={submit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>

        <input
          placeholder="To"
          value={to}
          onChange={e => setTo(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        />

        <select
          value={channel}
          onChange={e => setChannel(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>

        <textarea
          placeholder="Body"
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            minHeight: '100px'
          }}
        />

        <button type="submit" style={{
          padding: '12px',
          fontSize: '16px',
          background: '#007bff',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer'
        }}>
          Send
        </button>
      </form>

      {response && (
        <pre style={{
          marginTop: '20px',
          padding: '15px',
          background: '#eee',
          borderRadius: '6px',
          fontSize: '14px',
          overflowX: 'auto'
        }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
