import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Clock, ChevronRight, ExternalLink, Play, Key } from 'lucide-react';
import { EVENT_DATA, SOCIAL_LINKS } from '../data/eventData';

// ─── Countdown Timer ──────────────────────────────────────────────────────────
// Update targetDate once the event date is confirmed
function CountdownTimer() {
  // Event date: 26th September 2026, 2:00 PM
  const targetDate = useMemo(() => new Date('2026-09-26T14:00:00'), []);
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00', live: false });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00', live: true });
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        minutes: String(m).padStart(2, '0'),
        seconds: String(s).padStart(2, '0'),
        live: false,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="wpg-countdown-container">
      <div style={{ color: 'var(--white-40)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
        {timeLeft.live ? "The Gathering is Happening Now!" : "Counting Down to The Prophetic Wife Gathering"}
      </div>
      <div className="wpg-countdown-grid">
        {[
          { val: timeLeft.days,    lbl: 'days' },
          { val: timeLeft.hours,   lbl: 'hrs' },
          { val: timeLeft.minutes, lbl: 'min' },
          { val: timeLeft.seconds, lbl: 'sec' },
        ].map(({ val, lbl }) => (
          <div key={lbl} className="wpg-cd-card">
            <span className="wpg-cd-val">{val}</span>
            <span className="wpg-cd-lbl">{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function Landing() {
  const nav = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── HERO ── */}
      <section className="hero" style={{ minHeight: '100dvh' }}>
        <div className="hero-bg" />
        <div className="hero-overlay" />

        {/* Floating decorative orbs */}
        <div className="hero-orb" style={{ width: 300, height: 300, background: 'rgba(147,51,234,0.18)', top: '-80px', left: '-80px', animationDelay: '0s' }} />
        <div className="hero-orb" style={{ width: 200, height: 200, background: 'rgba(244,63,94,0.10)', bottom: '80px', right: '-50px', animationDelay: '3s' }} />

        <div className="hero-content" style={{ paddingBottom: 100 }}>

          {/* Badge */}
          <div className="anim-up d1" style={{ marginBottom: 18 }}>
            <span style={{
              fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
              background: 'rgba(147,51,234,0.2)', color: '#c084fc',
              border: '1px solid rgba(147,51,234,0.35)', padding: '5px 14px', borderRadius: 99,
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
              ✦ Women Only ✦
            </span>
          </div>

          {/* Title */}
          <h1 className="t-hero-title anim-up d2" style={{ marginBottom: 6, lineHeight: 1.1 }}>
            WOMEN'S<br />PROPHETIC<br />GATHERING
          </h1>

          {/* Gold rule */}
          <div className="divider-gold anim-up d3" style={{ width: 120, margin: '16px auto' }} />

          {/* Theme */}
          <h2 className="t-theme anim-up d3" style={{ marginBottom: 8 }}>
            {EVENT_DATA.theme}
          </h2>
          <p className="t-subtheme anim-up d4" style={{ marginBottom: 28 }}>
            "{EVENT_DATA.subTheme}"
          </p>

          {/* Countdown */}
          <div className="anim-up d4" style={{ marginBottom: 24, width: '100%' }}>
            <CountdownTimer />
          </div>

          {/* Event info chips */}
          <div className="anim-up d4" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32, width: '100%', maxWidth: 320 }}>
            {[
              { icon: <Calendar size={14}/>, text: EVENT_DATA.date },
              { icon: <Clock size={14}/>,    text: EVENT_DATA.time },
              { icon: <MapPin size={14}/>,   text: EVENT_DATA.venue },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(147,51,234,0.15)', borderRadius: 8, padding: '10px 14px'
              }}>
                <span style={{ color: 'var(--gold)', flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'var(--white-80)', fontWeight: 500, textAlign: 'left' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="anim-up d5" style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 300 }}>
            <button id="cta-register" onClick={() => nav('/register')} className="btn btn-gold btn-lg" style={{ flex: 1 }}>
              Register
              <ChevronRight size={16} />
            </button>
            <button id="cta-connect" onClick={() => nav('/connect')} className="btn btn-outline btn-lg" style={{ flex: 1 }}>
              Connect
            </button>
          </div>

          <p className="anim-up d5" style={{ fontSize: 10, color: 'var(--white-20)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 16, lineHeight: 1.5 }}>
            Free Entry &nbsp;·&nbsp; Women Only &nbsp;·&nbsp; 26th September 2026
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 3, opacity: 0.3 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, var(--purple-light))', margin: '0 auto 4px' }} />
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--purple-light)', textTransform: 'uppercase' }}>SCROLL</div>
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section style={{ padding: '28px 20px', background: 'var(--bg-mid)' }}>
        <p className="t-section-label" style={{ marginBottom: 12 }}>About the Gathering</p>
        <p style={{ fontSize: 14, color: 'var(--white-60)', lineHeight: 1.7, marginBottom: 0 }}>
          A one-day gathering for women, hosted by{' '}
          <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Covered Women Network</span>{' '}
          under <span style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Ebenezer Okronipa Ministries</span>{' '}
          at Overcomers Nation Church, Tesano. Come expecting prophetic impartation, healing and a fresh encounter with God.
        </p>
      </section>

      {/* ── WHAT TO EXPECT ── */}
      <section style={{ padding: '28px 20px', background: 'var(--bg)' }}>
        <p className="t-section-label" style={{ marginBottom: 16 }}>What to Expect</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EVENT_DATA.featuring.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: 'rgba(147,51,234,0.05)', borderRadius: 10,
              border: '1px solid rgba(147,51,234,0.12)'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: 'rgba(147,51,234,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ color: 'var(--purple-light)', fontSize: 14 }}>✦</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--white-80)' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVESTREAM BANNER ── */}
      {SOCIAL_LINKS.filter(l => l.isLivestream).map(link => (
        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', margin: '0', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(147,51,234,0.1))',
            border: '1px solid rgba(29,78,216,0.25)', borderLeft: 'none', borderRight: 'none',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#1877F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
              }}>
                <Play size={16} fill="white" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span className="badge badge-live">Live Stream</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--white-70)' }}>Watch on Facebook | {link.handle}</p>
              </div>
            </div>
            <ExternalLink size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          </div>
        </a>
      ))}

      {/* ── REGISTER CTA STRIP ── */}
      <section style={{ padding: '32px 20px', background: 'var(--bg-mid)' }}>
        <div className="card card-purple" style={{ padding: '24px 20px', textAlign: 'center' }}>
          <p className="t-overline" style={{ marginBottom: 10 }}>Secure Your Spot</p>
          <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: 'var(--white)', marginBottom: 8 }}>
            Join the Gathering
          </h3>
          <p style={{ fontSize: 12, color: 'var(--white-40)', lineHeight: 1.7, marginBottom: 20 }}>
            Registration is free. All women are welcome. Invite a friend!
          </p>
          <button onClick={() => nav('/register')} className="btn btn-gold btn-lg" style={{ width: '100%' }}>
            Register Now <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div style={{ padding: '20px 20px 100px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          Enquiries: {EVENT_DATA.enquiries.join(' / ')}
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.05)', display: 'inline-flex', textDecoration: 'none' }}>
            <Key size={10} />
          </Link>
        </p>
        <p className="font-label" style={{ fontSize: 14, color: 'var(--white)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}>
          The Prophetic Wife
        </p>
      </div>
    </div>
  );
}
