import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, CheckCircle2, UserPlus, RefreshCw,
  UserCheck, LogOut, Download, Wifi, WifiOff, Plus, ChevronLeft, ShieldCheck, RotateCcw
} from 'lucide-react';
import {
  getRegistrations,
  fetchRemoteRegistrations,
  getAttendance,
  markAttendance,
  fetchAttendanceFromSheet,
  overwriteAttendanceFromRemote,
  exportAttendanceToCSV,
  deleteAttendanceRecord,
  saveWalkinRegistration,
  STORAGE_KEY,
  GOOGLE_SHEET_SCRIPT_URL,
  EVENT_DATA,
} from '../data/eventData';

const ATTENDANCE_PIN = '2500';
const SESSION_DATE = EVENT_DATA.date || '26th September, 2026';

function pick(r, ...keys) {
  if (!r || typeof r !== 'object') return '';
  for (const k of keys) {
    const exact = Object.keys(r).find(rk => rk.toLowerCase() === k.toLowerCase());
    if (exact && r[exact] !== undefined && r[exact] !== '') return String(r[exact]);
  }
  return '';
}

/* ─── Toast ─────────────────────────────────────────────────────────────── */
function Toast({ toast }) {
  if (!toast) return null;
  const c = {
    success: { bg: '#14532d', border: '#166534', dot: '#4ade80' },
    warn:    { bg: '#78350f', border: '#b45309', dot: '#fbbf24' },
    info:    { bg: '#3b0764', border: '#701a75', dot: '#c084fc' },
  }[toast.type] || { bg: '#14532d', border: '#166534', dot: '#4ade80' };

  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: c.bg, border: `1px solid ${c.border}`,
      color: '#fff', borderRadius: 14, padding: '13px 24px',
      fontSize: 13, fontWeight: 600, zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'attFadeUp 0.3s ease', whiteSpace: 'nowrap',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {toast.msg}
    </div>
  );
}

/* ─── Attendee Card ──────────────────────────────────────────────────────── */
function PersonCard({ reg, checkedIn, onMark, onUnmark }) {
  const title    = pick(reg, 'title', 'Title');
  const rawName  = pick(reg, 'fullName', 'fullname', 'Full Name') || 'Unknown';
  const name     = title ? `${title}. ${rawName}` : rawName;
  const phone    = pick(reg, 'phone', 'Phone');
  const location = pick(reg, 'location', 'Location');
  const mode     = pick(reg, 'attendanceMode', 'attendancemode', 'Attendance Mode') || 'In-Person';
  const isInPerson = mode.toLowerCase().includes('person');
  const memberStatus = pick(reg, 'memberStatus', 'memberstatus', 'Membership Status');
  const initials = rawName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{
      background: checkedIn ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${checkedIn ? 'rgba(74,222,128,0.3)' : 'rgba(192,132,252,0.12)'}`,
      borderRadius: 16, padding: '16px 18px',
      display: 'flex', gap: 14, alignItems: 'center', transition: 'all 0.2s',
      boxShadow: checkedIn ? '0 4px 20px rgba(74,222,128,0.06)' : 'none',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: checkedIn
          ? 'linear-gradient(135deg, rgba(74,222,128,0.25), rgba(52,211,153,0.15))'
          : 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(244,63,94,0.2))',
        border: `1.5px solid ${checkedIn ? 'rgba(74,222,128,0.4)' : 'rgba(192,132,252,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 900, color: checkedIn ? '#4ade80' : '#E5B050',
      }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
          {name}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {phone && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{phone}</span>}
          {location && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>📍 {location}</span>}
          {memberStatus && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: 'rgba(196,146,42,0.15)', color: '#F0C060', border: '1px solid rgba(196,146,42,0.25)'
            }}>
              {memberStatus}
            </span>
          )}
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 99,
            background: isInPerson ? 'rgba(74,222,128,0.1)' : 'rgba(192,132,252,0.15)',
            color: isInPerson ? '#4ade80' : '#c084fc',
            border: `1px solid ${isInPerson ? 'rgba(74,222,128,0.25)' : 'rgba(192,132,252,0.3)'}`,
          }}>
            {isInPerson ? 'In-Person' : 'Online'}
          </span>
        </div>
      </div>

      {checkedIn ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.35)',
              borderRadius: 20, padding: '5px 11px', color: '#4ade80', fontSize: 12, fontWeight: 700,
            }}>
              <CheckCircle2 size={13} /> Present
            </div>
            {onUnmark && (
              <button
                onClick={() => onUnmark(checkedIn, name)}
                title="Undo check-in (revert to pending/absent)"
                style={{
                  background: 'rgba(244,63,94,0.12)',
                  border: '1px solid rgba(244,63,94,0.35)',
                  borderRadius: 10,
                  padding: '5px 9px',
                  color: '#fb7185',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(244,63,94,0.22)';
                  e.currentTarget.style.borderColor = 'rgba(244,63,94,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(244,63,94,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)';
                }}
              >
                <RotateCcw size={11} /> Unmark
              </button>
            )}
          </div>
          {checkedIn.checkedInAt && (
            <span style={{ fontSize: 10, color: 'rgba(74,222,128,0.7)', fontWeight: 600 }}>
              {new Date(checkedIn.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      ) : (
        <button
          onClick={() => onMark(reg)}
          style={{
            flexShrink: 0,
            background: 'linear-gradient(135deg, #9333ea, #c084fc)',
            border: 'none', borderRadius: 12, padding: '10px 18px',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(147,51,234,0.35)',
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <UserCheck size={15} /> Check In
        </button>
      )}
    </div>
  );
}

/* ─── Walk-In Modal ──────────────────────────────────────────────────────── */
function WalkInModal({ onClose, onSave }) {
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState('First Timer');
  const [location, setLocation] = useState('');
  const [error, setError]       = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter attendee full name.'); return; }
    onSave({ fullName: name.trim(), phone: phone.trim(), email: email.trim(), memberStatus: status, location: location.trim() });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#12001a', border: '1px solid rgba(192,132,252,0.3)',
        borderRadius: 24, padding: '28px 24px', maxWidth: 440, width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Quick Walk-In Registration</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>Register & check in attendee on the spot</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 99,
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 10, padding: '10px 14px', color: '#fb7185', fontSize: 12, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
            <input
              autoFocus
              placeholder="e.g. Sister Grace Mensah"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              style={{
                width: '100%', marginTop: 5, padding: '12px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 0244000000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{
                width: '100%', marginTop: 5, padding: '12px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 14, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendee Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{
                  width: '100%', marginTop: 5, padding: '12px 14px', borderRadius: 12,
                  background: '#1a0024', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: 13, outline: 'none',
                }}
              >
                <option value="First Timer">First Timer</option>
                <option value="Visitor">Visitor / Guest</option>
                <option value="Member">ONC Member</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location / Area</label>
              <input
                placeholder="e.g. Tesano"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{
                  width: '100%', marginTop: 5, padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontSize: 14, outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 2, padding: '13px', borderRadius: 12,
                background: 'linear-gradient(135deg, #9333ea, #c084fc)', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 16px rgba(147,51,234,0.4)',
              }}
            >
              <UserCheck size={16} /> Check In Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Attendance Portal ─────────────────────────────────────────────── */
export default function Attendance() {
  const nav = useNavigate();
  const [authed, setAuthed]             = useState(() => sessionStorage.getItem('cwn_attendance_auth') === 'true');
  const [pin, setPin]                   = useState('');
  const [pinError, setPinError]         = useState('');
  const [registrations, setRegistrations] = useState(getRegistrations());
  const [attendance, setAttendance]     = useState(getAttendance());
  const [search, setSearch]             = useState('');
  const [filterMode, setFilterMode]     = useState('all'); // all | present | absent | walkin
  const [loading, setLoading]           = useState(false);
  const [showWalkin, setShowWalkin]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [isOnline, setIsOnline]         = useState(navigator.onLine);

  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Auto-sync whenever user enters/loads authenticated attendance view
  useEffect(() => {
    if (authed) {
      syncData();
    }
  }, [authed]);

  // Periodic background polling every 45 seconds to keep all ushers in sync
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncData(true);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [authed]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    if (pin.trim() === ATTENDANCE_PIN || pin.trim() === 'admin123' || pin.trim() === 'admin') {
      sessionStorage.setItem('cwn_attendance_auth', 'true');
      setAuthed(true);
      setPinError('');
    } else {
      setPinError('Incorrect Usher PIN. Enter 2500');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cwn_attendance_auth');
    setAuthed(false);
    setPin('');
  };

  // Sync registrations and attendance from Google Sheet
  const syncData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [remoteRegs, remoteAtt] = await Promise.all([
        fetchRemoteRegistrations(ATTENDANCE_PIN, ''),
        fetchAttendanceFromSheet(ATTENDANCE_PIN, '')
      ]);

      if (remoteRegs && remoteRegs.data && Array.isArray(remoteRegs.data)) {
        setRegistrations(remoteRegs.data);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteRegs.data));
        } catch (_) {}
      }
      if (remoteAtt && remoteAtt.data && Array.isArray(remoteAtt.data)) {
        setAttendance(remoteAtt.data);
        overwriteAttendanceFromRemote(remoteAtt.data);
      }
      if (!silent) showToast('Live database sync complete!', 'info');
    } catch {
      if (!silent) showToast('Offline mode — using local records.', 'warn');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleMark = (reg) => {
    const rawName = pick(reg, 'fullName', 'fullname', 'Full Name') || 'Attendee';
    const regId   = pick(reg, 'id', 'ID');
    const phone   = pick(reg, 'phone', 'Phone');

    const result = markAttendance({
      registrationId: regId,
      name: rawName,
      phone,
      sessionDate: SESSION_DATE,
      isWalkin: false,
    });

    if (result.duplicate) {
      showToast(`${rawName} is already checked in!`, 'warn');
    } else {
      setAttendance(getAttendance());
      showToast(`✓ ${rawName} checked in successfully!`, 'success');
    }
  };

  const handleUnmark = (attRecord, name) => {
    if (!attRecord || !attRecord.id) return;
    const ok = window.confirm(`Revert check-in for "${name}"?\n\nThis will mark this attendee back as Pending / Absent.`);
    if (!ok) return;

    deleteAttendanceRecord(attRecord.id);
    setAttendance(getAttendance());
    showToast(`↩ Check-in reverted for ${name}`, 'warn');
  };

  const handleWalkinSave = (data) => {
    let cleanPhone = (data.phone || '').trim();
    if (cleanPhone.startsWith('+233')) {
      cleanPhone = '0' + cleanPhone.slice(4).trim();
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.slice(1).trim();
    }
    const result = saveWalkinRegistration({ ...data, phone: cleanPhone });
    setRegistrations(getRegistrations());
    setAttendance(getAttendance());
    showToast(`✓ Walk-in: ${data.fullName} registered & checked in!`, 'success');
  };

  const handleExport = () => {
    const csv = exportAttendanceToCSV(attendance);
    if (!csv) { showToast('No attendance records to export.', 'warn'); return; }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `covered-women-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${attendance.length} attendance records.`, 'info');
  };

  // Build merged attendee list
  const mergedList = useMemo(() => {
    const attMap = new Map();
    attendance.forEach(a => {
      const key = a.registrationId ? a.registrationId : (a.name || '').trim().toLowerCase();
      attMap.set(key, a);
    });

    const preRegItems = registrations.map(r => {
      const regId = pick(r, 'id', 'ID');
      const name = (pick(r, 'fullName', 'fullname', 'Full Name') || '').trim().toLowerCase();
      const att = (regId && attMap.get(regId)) || attMap.get(name) || null;
      return { reg: r, checkedIn: att, isWalkin: false };
    });

    // Walk-ins that don't match any pre-reg
    const registeredIds = new Set(registrations.map(r => pick(r, 'id', 'ID')));
    const registeredNames = new Set(registrations.map(r => (pick(r, 'fullName', 'fullname', 'Full Name') || '').trim().toLowerCase()));

    const pureWalkins = attendance
      .filter(a => a.isWalkin || (!registeredIds.has(a.registrationId) && !registeredNames.has((a.name || '').trim().toLowerCase())))
      .map(a => ({
        reg: {
          id: a.registrationId || a.id,
          fullName: a.name,
          phone: a.phone,
          attendanceMode: 'In-Person',
          memberStatus: 'Walk-in',
        },
        checkedIn: a,
        isWalkin: true,
      }));

    return [...preRegItems, ...pureWalkins];
  }, [registrations, attendance]);

  // Filter & Search
  const filteredList = useMemo(() => {
    const rawQ = search.trim().toLowerCase();
    const cleanQ = rawQ.replace(/[^0-9]/g, ''); // digits only for phone matching
    const qTokens = rawQ.split(/\s+/).filter(Boolean);

    return mergedList.filter(item => {
      const reg = item.reg || {};
      const name = (pick(reg, 'fullName', 'fullname', 'Full Name', 'displayName', 'name', 'Name') || '').toLowerCase();
      const rawPhone = (pick(reg, 'phone', 'Phone', 'telephone', 'mobile') || '').toLowerCase();
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
      const id = (pick(reg, 'id', 'ID', 'registrationId') || '').toLowerCase();
      const email = (pick(reg, 'email', 'Email') || '').toLowerCase();
      const location = (pick(reg, 'location', 'Location') || '').toLowerCase();

      // Combined searchable text
      const fullSearchCorpus = `${name} ${id} ${email} ${location} ${rawPhone}`;

      let matchesSearch = true;
      if (qTokens.length > 0) {
        // 1. Text token match (every word must appear in corpus)
        const textMatches = qTokens.every(token => fullSearchCorpus.includes(token));

        // 2. Smart Phone match (handles 024... vs 24... vs +233...)
        let phoneMatches = false;
        if (cleanQ.length >= 3) {
          phoneMatches = cleanPhone.includes(cleanQ) ||
                         (cleanQ.startsWith('0') && cleanPhone.includes(cleanQ.slice(1))) ||
                         (!cleanQ.startsWith('0') && ('0' + cleanPhone).includes(cleanQ)) ||
                         (cleanPhone.length >= 3 && cleanPhone.endsWith(cleanQ)) ||
                         (cleanPhone.length >= 3 && cleanQ.endsWith(cleanPhone));
        }

        matchesSearch = textMatches || phoneMatches;
      }

      if (!matchesSearch) return false;

      if (filterMode === 'present') return Boolean(item.checkedIn);
      if (filterMode === 'absent')  return !item.checkedIn;
      if (filterMode === 'walkin')  return item.isWalkin;
      return true;
    });
  }, [mergedList, search, filterMode]);

  // Statistics
  const totalRegistered = registrations.length;
  const totalCheckedIn = attendance.length;
  const walkinCount = attendance.filter(a => a.isWalkin).length;
  const checkinRate = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  /* ─── PIN Lock Screen ─────────────────────────────────────────────────── */
  if (!authed) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        <div style={{
          maxWidth: 380, width: '100%', background: '#12001a',
          border: '1px solid rgba(192,132,252,0.25)', borderRadius: 24,
          padding: '36px 28px', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        }}>
          <button
            onClick={() => nav('/')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '6px 12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
              marginBottom: 20
            }}
          >
            <ChevronLeft size={14} /> Back to Event
          </button>

          <div style={{
            width: 58, height: 58, borderRadius: '50%', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(244,63,94,0.2))',
            border: '1.5px solid rgba(192,132,252,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E5B050'
          }}>
            <ShieldCheck size={28} />
          </div>

          <p style={{
            fontSize: 11, fontWeight: 800, color: '#c084fc',
            textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px'
          }}>
            Covered Women Network
          </p>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            Usher Attendance Portal
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
            Enter Usher PIN to access live check-in
          </p>

          {pinError && (
            <div style={{
              background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 10, padding: '10px 14px', color: '#fb7185', fontSize: 12, marginBottom: 18
            }}>
              {pinError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Enter PIN (e.g. 2500)"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(''); }}
              autoFocus
              style={{
                textAlign: 'center', fontSize: 20, letterSpacing: '0.25em',
                padding: '14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(192,132,252,0.3)',
                color: '#fff', outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '14px', borderRadius: 14,
                background: 'linear-gradient(135deg, #9333ea, #c084fc)', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(147,51,234,0.4)',
              }}
            >
              Access Check-In
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ─── Active Attendance Dashboard ─────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: '#fff', paddingBottom: 60 }}>
      <Toast toast={toast} />

      {/* Top Header Bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(8,0,15,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(192,132,252,0.15)',
        padding: '14px 20px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => nav('/')}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '7px 10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600
              }}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Covered Women Network
              </p>
              <h1 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                The Prophetic Wife — Check-In
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: isOnline ? 'rgba(74,222,128,0.12)' : 'rgba(244,63,94,0.12)',
              color: isOnline ? '#4ade80' : '#fb7185',
              border: `1px solid ${isOnline ? 'rgba(74,222,128,0.25)' : 'rgba(244,63,94,0.25)'}`
            }}>
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <button
              onClick={syncData}
              disabled={loading}
              title="Refresh / Sync with Google Sheet"
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>

            <button
              onClick={handleExport}
              title="Export Attendance to CSV"
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              <Download size={15} />
            </button>

            <button
              onClick={handleLogout}
              title="Log Out"
              style={{
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fb7185', cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px' }}>
        {/* Real-Time Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12, marginBottom: 20
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(192,132,252,0.15)',
            borderRadius: 16, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', fontWeight: 600 }}>Pre-Registered</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#c084fc', margin: 0 }}>{totalRegistered}</p>
          </div>

          <div style={{
            background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.25)',
            borderRadius: 16, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(74,222,128,0.7)', margin: '0 0 4px', fontWeight: 600 }}>Checked In Today</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#4ade80', margin: 0 }}>{totalCheckedIn}</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 4px', fontWeight: 600 }}>Attendance Rate</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#E5B050', margin: 0 }}>{checkinRate}%</p>
          </div>

          <div style={{
            background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: 16, padding: '14px 16px',
          }}>
            <p style={{ fontSize: 11, color: 'rgba(244,63,94,0.7)', margin: '0 0 4px', fontWeight: 600 }}>Walk-Ins</p>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#fb7185', margin: 0 }}>{walkinCount}</p>
          </div>
        </div>

        {/* Action & Search Bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 240px', position: 'relative',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, display: 'flex', alignItems: 'center', padding: '0 14px',
          }}>
            <Search size={16} style={{ color: 'rgba(255,255,255,0.4)', marginRight: 10 }} />
            <input
              type="text"
              placeholder="Search attendee by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', fontSize: 14, padding: '12px 0',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowWalkin(true)}
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #fb7185)', border: 'none',
              borderRadius: 14, padding: '12px 18px', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={16} /> + Walk-In
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all',     label: `All (${mergedList.length})` },
            { id: 'present', label: `Present (${totalCheckedIn})` },
            { id: 'absent',  label: `Pending Check-In (${totalRegistered - (totalCheckedIn - walkinCount)})` },
            { id: 'walkin',  label: `Walk-Ins (${walkinCount})` },
          ].map(tab => {
            const active = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                style={{
                  background: active ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? '#c084fc' : 'rgba(255,255,255,0.08)'}`,
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Attendees List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredList.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'rgba(255,255,255,0.02)', borderRadius: 20,
              border: '1px dashed rgba(255,255,255,0.1)',
            }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: '0 0 14px' }}>
                {search ? `No attendees matching "${search}"` : 'No attendees found in this category.'}
              </p>
              {search && (
                <button
                  onClick={() => setShowWalkin(true)}
                  style={{
                    background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)',
                    color: '#c084fc', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Register "{search}" as Walk-In
                </button>
              )}
            </div>
          ) : (
            filteredList.map((item, idx) => (
              <PersonCard
                key={item.reg.id || item.reg.ID || idx}
                reg={item.reg}
                checkedIn={item.checkedIn}
                onMark={handleMark}
                onUnmark={handleUnmark}
              />
            ))
          )}
        </div>
      </main>

      {/* Walk-in Modal */}
      {showWalkin && (
        <WalkInModal
          onClose={() => setShowWalkin(false)}
          onSave={handleWalkinSave}
        />
      )}
    </div>
  );
}
