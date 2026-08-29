import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronLeft, ArrowRight, Loader2, User, Phone, Mail, MapPin, Heart, HelpCircle, UserPlus, Star } from 'lucide-react';
import { saveRegistration } from '../data/eventData';

// ── Salutation options ─────────────────────────────────────────────────────────
const TITLES = [
  { val: 'Mrs',   label: 'Mrs' },
  { val: 'Miss',  label: 'Miss' },
  { val: 'Ms',    label: 'Ms' },
  { val: 'Rev',   label: 'Rev' },
  { val: 'Pastor', label: 'Pastor' },
  { val: 'Dr',    label: 'Dr' },
  { val: 'Sis',   label: 'Sis' },
];

// ── Form initial state ─────────────────────────────────────────────────────────
const INIT = {
  title: '',
  fullName: '',
  phone: '',
  email: '',
  age: '',
  memberStatus: '',
  firstTimer: '',
  referral: '',
  attendanceMode: '',
  location: '',
  invitedBy: '',
  prayerRequest: '',
};

// ── Validation ─────────────────────────────────────────────────────────────────
const validate = (form) => {
  const e = {};
  if (!form.fullName.trim()) e.fullName = 'Full name is required';
  if (!form.phone.trim()) {
    e.phone = 'Phone number is required';
  } else if (!/^[0-9+\s()-]{7,}$/.test(form.phone)) {
    e.phone = 'Enter a valid phone number';
  }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = 'Enter a valid email address';
  }
  if (!form.memberStatus) e.memberStatus = 'Please select your membership status';
  if (!form.firstTimer) e.firstTimer = 'Please let us know if this is your first time';
  if (!form.attendanceMode) e.attendanceMode = 'Please select your attendance mode';
  if (!form.location.trim()) e.location = 'Location / area is required';
  return e;
};

// ── Register page ──────────────────────────────────────────────────────────────
export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(null);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);

    const payload = {
      ...form,
      displayName: form.title ? `${form.title}. ${form.fullName.trim()}` : form.fullName.trim(),
    };

    await new Promise(r => setTimeout(r, 800));
    setSaved(saveRegistration(payload));
    setDone(true);
    setSubmitting(false);
  };

  const onReset = () => { setForm(INIT); setErrors({}); setSaved(null); setDone(false); };

  if (done) return <Success reg={saved} nav={nav} onReset={onReset} />;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,0,15,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(147,51,234,0.12)',
        padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 14
      }}>
        <button onClick={() => nav('/')} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 8, padding: '6px 10px', color: 'var(--white-70)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600
        }}>
          <ChevronLeft size={14} /> Back
        </button>
        <div>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--purple-light)' }}>EOM</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1 }}>Prophetic Gathering — Registration</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 120px' }}>

        {/* Intro card */}
        <div className="card card-purple" style={{ padding: '18px 20px', marginBottom: 28, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star size={18} style={{ color: 'var(--purple-light)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 4 }}>Join the Women's Prophetic Gathering</p>
            <p style={{ fontSize: 12, color: 'var(--white-40)', lineHeight: 1.6 }}>Registration is completely free. Women of all ages are welcome — invite a friend!</p>
          </div>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }} noValidate>

          {/* Title / Salutation */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <User size={13} style={{ color: 'var(--purple-light)' }} /> Title / Salutation{' '}
              <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>(Optional)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TITLES.map(t => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, title: f.title === t.val ? '' : t.val }))}
                  style={{
                    padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'inherit',
                    border: `1.5px solid ${form.title === t.val ? 'var(--purple-light)' : 'rgba(255,255,255,0.1)'}`,
                    background: form.title === t.val ? 'rgba(147,51,234,0.15)' : 'rgba(255,255,255,0.03)',
                    color: form.title === t.val ? 'var(--white)' : 'rgba(255,255,255,0.4)',
                    boxShadow: form.title === t.val ? '0 0 12px rgba(147,51,234,0.2)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <FormField icon={<User size={14}/>} label="Full Name" required error={errors.fullName} accent="purple">
            <input id="reg-fullName" name="fullName" type="text" placeholder="Your full name"
              className="form-input" value={form.fullName} onChange={onChange} autoComplete="name" />
          </FormField>

          <FormField icon={<Phone size={14}/>} label="Phone Number" required error={errors.phone} accent="purple">
            <input id="reg-phone" name="phone" type="tel" placeholder="0244 123 456"
              className="form-input" value={form.phone} onChange={onChange} autoComplete="tel" />
          </FormField>

          <FormField icon={<Mail size={14}/>} label="Email Address" hint="Optional" error={errors.email} accent="purple">
            <input id="reg-email" name="email" type="email" placeholder="example@gmail.com"
              className="form-input" value={form.email} onChange={onChange} autoComplete="email" />
          </FormField>

          <FormField icon={<User size={14}/>} label="Age" hint="Optional" accent="purple">
            <input id="reg-age" name="age" type="number" min="1" max="120" placeholder="e.g. 30"
              className="form-input" value={form.age} onChange={onChange} />
          </FormField>

          {/* Membership Status */}
          <RadioGroup
            label="Membership Status"
            icon={<Star size={13} style={{ color: 'var(--purple-light)' }} />}
            required
            error={errors.memberStatus}
            options={[
              { val: 'Member of ONC', label: 'Member of Overcomers Nation Church (ONC)' },
              { val: 'Member of EOM', label: 'Member of Ebenezer Okronipa Ministries (EOM)' },
              { val: 'Visitor / Neither', label: 'Visitor / Neither' },
            ]}
            value={form.memberStatus}
            onChange={val => { setForm(f => ({ ...f, memberStatus: val })); if (errors.memberStatus) setErrors(er => ({ ...er, memberStatus: '' })); }}
          />

          {/* First Timer */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserPlus size={13} style={{ color: 'var(--purple-light)' }} />
              Is this your first time at the Women's Prophetic Gathering?
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { val: 'yes', label: 'Yes, First Timer' },
                { val: 'no',  label: "No, I've Been Before" },
              ].map(opt => (
                <label key={opt.val} style={{
                  textAlign: 'center', padding: '12px 6px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${form.firstTimer === opt.val ? 'var(--purple-light)' : 'rgba(255,255,255,0.08)'}`,
                  background: form.firstTimer === opt.val ? 'rgba(147,51,234,0.1)' : 'rgba(255,255,255,0.02)',
                  fontSize: 12, fontWeight: 700,
                  color: form.firstTimer === opt.val ? 'var(--white)' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="firstTimer" value={opt.val} checked={form.firstTimer === opt.val}
                    onChange={onChange} style={{ display: 'none' }} />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.firstTimer && <p style={{ color: '#f87171', fontSize: 11, marginTop: 6 }}>{errors.firstTimer}</p>}
          </div>

          {/* How did you hear */}
          <FormField icon={<HelpCircle size={14}/>} label="How did you hear about the Gathering?" hint="Optional" accent="purple">
            <select name="referral" className="form-input" value={form.referral} onChange={onChange} style={{ background: 'var(--bg-card)' }}>
              <option value="">Select Option</option>
              <option value="Flyer / Banner">Flyer / Banner</option>
              <option value="Friend / Relative">Friend / Relative</option>
              <option value="Social Media">Social Media</option>
              <option value="Church Announcement">Church Announcement</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          {/* Attendance Mode */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={13} style={{ color: 'var(--purple-light)' }} />
              Will you be attending in person?
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { val: 'Yes, in person',      label: 'Yes, In-Person' },
                { val: 'No, watching online', label: 'Watching Online' },
              ].map(opt => (
                <label key={opt.val} style={{
                  textAlign: 'center', padding: '12px 6px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${form.attendanceMode === opt.val ? 'var(--purple-light)' : 'rgba(255,255,255,0.08)'}`,
                  background: form.attendanceMode === opt.val ? 'rgba(147,51,234,0.1)' : 'rgba(255,255,255,0.02)',
                  fontSize: 12, fontWeight: 700,
                  color: form.attendanceMode === opt.val ? 'var(--white)' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="attendanceMode" value={opt.val} checked={form.attendanceMode === opt.val}
                    onChange={onChange} style={{ display: 'none' }} />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.attendanceMode && <p style={{ color: '#f87171', fontSize: 11, marginTop: 6 }}>{errors.attendanceMode}</p>}
          </div>

          <FormField icon={<MapPin size={14}/>} label="Location / Area" required error={errors.location} accent="purple">
            <input id="reg-location" name="location" type="text" placeholder="e.g. Tesano, East Legon, Kumasi"
              className="form-input" value={form.location} onChange={onChange} />
          </FormField>

          <FormField icon={<UserPlus size={14}/>} label="Invited by" hint="Name of person who invited you (optional)" accent="purple">
            <input id="reg-invitedBy" name="invitedBy" type="text" placeholder="e.g. Sister Abena"
              className="form-input" value={form.invitedBy} onChange={onChange} />
          </FormField>

          <FormField icon={<Heart size={14}/>} label="What are you trusting God for at this Gathering?" hint="Optional" accent="purple">
            <textarea id="reg-prayerRequest" name="prayerRequest"
              placeholder="Share your prayer requests, expectations or anything on your heart..."
              className="form-input" rows="4" value={form.prayerRequest} onChange={onChange}
              style={{ resize: 'vertical', background: 'var(--bg-card)' }} />
          </FormField>

          {/* Submit */}
          <div style={{ paddingTop: 8 }}>
            <button id="reg-submit" type="submit" disabled={submitting}
              className="btn btn-gold btn-lg" style={{ width: '100%', opacity: submitting ? 0.7 : 1 }}>
              {submitting
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                : <>Confirm My Place <ArrowRight size={15} /></>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
              Free Registration — All Women Welcome
            </p>
            <p className="font-label" style={{ textAlign: 'center', fontSize: 14, color: 'var(--white)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 16 }}>
              She Shall Arise
            </p>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Shared form field wrapper ──────────────────────────────────────────────────
function FormField({ icon, label, hint, required, error, children }) {
  return (
    <div>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ color: 'var(--purple-light)' }}>{icon}</span>
        {label}
        {required && <span style={{ color: '#ef4444', fontSize: 11 }}>*</span>}
        {hint && <span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.2)', textTransform: 'none', letterSpacing: 0 }}>({hint})</span>}
      </label>
      {children}
      {error && <p style={{ color: '#f87171', fontSize: 11, marginTop: 5 }}>{error}</p>}
    </div>
  );
}

// ── Radio group (vertical list style) ────────────────────────────────────────
function RadioGroup({ label, icon, required, error, options, value, onChange }) {
  return (
    <div>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon} {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <label key={opt.val} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
            border: `1.5px solid ${value === opt.val ? 'var(--purple-light)' : 'rgba(255,255,255,0.08)'}`,
            background: value === opt.val ? 'rgba(147,51,234,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s'
          }}>
            <input type="radio" value={opt.val} checked={value === opt.val}
              onChange={() => onChange(opt.val)} style={{ display: 'none' }} />
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${value === opt.val ? 'var(--purple-light)' : 'rgba(255,255,255,0.2)'}`,
              background: value === opt.val ? 'var(--purple-light)' : 'transparent',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {value === opt.val && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg)' }} />}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: value === opt.val ? 'var(--white)' : 'rgba(255,255,255,0.45)' }}>{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 11, marginTop: 6 }}>{error}</p>}
    </div>
  );
}

// ── Confetti bubbles ───────────────────────────────────────────────────────────
function ConfettiBubbles() {
  const [bubbles, setBubbles] = useState([]);
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 30; i++) {
      list.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 14 + 6,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
        color: ['var(--purple-light)', 'var(--gold)', 'var(--rose-light)'][Math.floor(Math.random() * 3)]
      });
    }
    setBubbles(list);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 99 }}>
      {bubbles.map(b => (
        <div key={b.id} style={{
          position: 'absolute', bottom: -50, left: `${b.left}%`,
          width: b.size, height: b.size, borderRadius: '50%',
          background: b.color, opacity: 0.5,
          animation: `bubbleUp ${b.duration}s linear ${b.delay}s infinite`
        }} />
      ))}
      <style>{`
        @keyframes bubbleUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-110vh) scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────────
function Success({ reg, nav, onReset }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ConfettiBubbles />
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'rgba(147,51,234,0.12)', border: '2px solid rgba(147,51,234,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(147,51,234,0.25)'
          }}>
            <CheckCircle size={44} style={{ color: 'var(--purple-light)' }} />
          </div>
        </div>

        <p className="t-overline" style={{ marginBottom: 8 }}>Registration Confirmed</p>
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, marginBottom: 6,
          background: 'linear-gradient(135deg, #f9d8ff, #c084fc, #F0C060)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>
          Welcome, {reg?.title ? `${reg.title}. ${reg.fullName}` : reg?.fullName}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--white-40)', lineHeight: 1.7, marginBottom: 28 }}>
          Your place at the Women's Only Prophetic Gathering has been confirmed. We look forward to seeing you there!
        </p>

        {/* Summary card */}
        <div className="card card-purple" style={{ padding: '20px', textAlign: 'left', marginBottom: 28 }}>
          <p className="t-section-label" style={{ marginBottom: 14 }}>Event Summary</p>
          <div className="divider-purple" style={{ marginBottom: 14 }} />
          {[
            ['Event', "Women's Only Prophetic Gathering"],
            ['Venue', 'Overcomers Nation Church, Tesano'],
            ['Attendance', reg?.attendanceMode || 'In-Person'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', minWidth: 72, paddingTop: 2 }}>{k}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div className="divider" style={{ margin: '12px 0' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
            "The Prophetic Wife rises in grace, speaks in faith, and reigns in purpose."
          </p>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>
          Invite your sisters, mothers and daughters — all women are welcome.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onReset} className="btn btn-gold btn-lg" style={{ width: '100%' }}>Register Another Person</button>
          <button onClick={() => nav('/')} className="btn btn-outline btn-md" style={{ width: '100%' }}>Back to Home</button>
        </div>
      </div>
      <p className="font-label" style={{ textAlign:'center', fontSize:14, color:'var(--white)', fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', marginTop: 28 }}>
        The Prophetic Wife
      </p>
    </div>
  );
}
