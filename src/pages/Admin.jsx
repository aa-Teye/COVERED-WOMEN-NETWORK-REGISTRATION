import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogIn, Download, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { fetchRemoteRegistrations, deleteLocalRegistration, exportToCSV, GOOGLE_SHEET_SCRIPT_URL } from '../data/eventData';

export default function Admin() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [source, setSource] = useState('');

  const login = async () => {
    if (!username.trim() || !password.trim()) { setError('Enter credentials'); return; }
    setLoading(true); setError('');
    const result = await fetchRemoteRegistrations(username, password);
    setLoading(false);
    if (result.source === 'error') { setError(result.error); return; }
    setRegistrations(result.data || []);
    setSource(result.source);
    setAuthed(true);
  };

  const refresh = async () => {
    setLoading(true);
    const result = await fetchRemoteRegistrations(username, password);
    setLoading(false);
    if (result.source !== 'error') { setRegistrations(result.data || []); setSource(result.source); }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this registration locally?')) return;
    const updated = deleteLocalRegistration(id);
    setRegistrations(updated);
  };

  const handleExport = () => {
    if (!registrations.length) { alert('No data to export.'); return; }
    const csv = exportToCSV(registrations);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'womens_prophetic_gathering_registrations.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
        <div style={{ maxWidth: 360, width: '100%' }}>
          <button onClick={() => nav('/')} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--white-70)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, marginBottom: 32
          }}>
            <ChevronLeft size={14} /> Back
          </button>

          <p className="t-overline" style={{ marginBottom: 8 }}>Admin Access</p>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: 'var(--white)', marginBottom: 24 }}>
            Registration Dashboard
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text" placeholder="Username"
              value={username} onChange={e => setUsername(e.target.value)}
              className="form-input"
            />
            <input
              type="password" placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="form-input"
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            {error && <p style={{ color: '#f87171', fontSize: 12 }}>{error}</p>}
            <button onClick={login} disabled={loading} className="btn btn-purple btn-lg" style={{ width: '100%' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing In...</> : <><LogIn size={15} /> Sign In</>}
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#050008', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => nav('/')} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8, padding: '6px 10px', color: 'var(--white-70)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600
            }}>
              <ChevronLeft size={14} /> Home
            </button>
            <div>
              <p className="t-overline">Admin Panel</p>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', margin: 0 }}>Women's Prophetic Gathering</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={refresh} disabled={loading} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
            </button>
            <button onClick={handleExport} className="btn btn-gold btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Registrations', val: registrations.length },
            { label: 'In-Person',      val: registrations.filter(r => r.attendanceMode?.includes('person')).length },
            { label: 'Watching Online', val: registrations.filter(r => r.attendanceMode?.includes('online')).length },
            { label: 'First Timers',   val: registrations.filter(r => r.firstTimer === 'yes').length },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid rgba(147,51,234,0.15)', borderRadius: 12, padding: '16px 20px' }}>
              <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{label}</p>
              <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--purple-light)', fontFamily: "'Anton', sans-serif" }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Source badge */}
        <div style={{ marginBottom: 16 }}>
          <span className={`badge ${source === 'remote' ? 'badge-purple' : 'badge-gold'}`}>
            {source === 'remote' ? '🟢 Live from Google Sheets' : '🟡 Local Cache'}
          </span>
          {!GOOGLE_SHEET_SCRIPT_URL && (
            <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 12 }}>⚠ No Google Script URL configured — data is local only.</span>
          )}
        </div>

        {/* Table */}
        {registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--white-40)' }}>
            <p style={{ fontSize: 18 }}>📋</p>
            <p style={{ fontSize: 14 }}>No registrations yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(147,51,234,0.12)' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>1st Timer</th>
                  <th>Mode</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--purple-light)', fontWeight: 700, fontSize: 10 }}>{r.id}</td>
                    <td style={{ fontWeight: 700, color: 'var(--white)' }}>{r.displayName || r.fullName}</td>
                    <td>{r.phone}</td>
                    <td style={{ fontSize: 11 }}>{r.email || '—'}</td>
                    <td>{r.location || '—'}</td>
                    <td><span style={{ fontSize: 10, color: 'var(--white-60)' }}>{r.memberStatus || '—'}</span></td>
                    <td>
                      <span className={`badge ${r.firstTimer === 'yes' ? 'badge-rose' : 'badge-gold'}`}>
                        {r.firstTimer === 'yes' ? '1st' : 'Returning'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11 }}>{r.attendanceMode || '—'}</td>
                    <td style={{ fontSize: 10, color: 'var(--white-40)' }}>{r.registeredAt ? new Date(r.registeredAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button onClick={() => handleDelete(r.id)} style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f87171'
                      }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
