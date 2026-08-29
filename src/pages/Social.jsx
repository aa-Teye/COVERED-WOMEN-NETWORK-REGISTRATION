import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { SOCIAL_LINKS, EVENT_DATA } from '../data/eventData';

const PLATFORM_ICONS = {
  Facebook:  { bg: '#1877F2', icon: 'f' },
  YouTube:   { bg: '#FF0000', icon: '▶' },
  Instagram: { bg: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', icon: '◉' },
  TikTok:    { bg: '#010101', icon: '♪' },
};

export default function Social() {
  const nav = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* Header */}
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
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', lineHeight: 1.1 }}>Connect With Us</p>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 120px' }}>

        <p className="t-section-label" style={{ marginBottom: 8 }}>Follow & Connect</p>
        <p style={{ fontSize: 13, color: 'var(--white-40)', lineHeight: 1.7, marginBottom: 24 }}>
          Stay updated on the Women's Prophetic Gathering and all EOM events on our social platforms.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SOCIAL_LINKS.map(link => {
            const meta = PLATFORM_ICONS[link.platform] || { bg: '#333', icon: '?' };
            return (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 14,
                  background: 'var(--bg-card)', border: '1px solid rgba(147,51,234,0.12)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(147,51,234,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(147,51,234,0.12)'}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: meta.bg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 16, fontWeight: 900
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--white)' }}>{link.platform}</span>
                      {link.isLivestream && <span className="badge badge-live">Live</span>}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--white-40)', fontWeight: 500 }}>{link.handle}</p>
                    <p style={{ fontSize: 11, color: 'var(--white-40)', fontStyle: 'italic', marginTop: 2 }}>{link.description}</p>
                  </div>
                  <ExternalLink size={16} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                </div>
              </a>
            );
          })}
        </div>

        {/* Enquiries */}
        <div style={{ marginTop: 32, padding: '20px', borderRadius: 14, background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.15)', textAlign: 'center' }}>
          <p className="t-overline" style={{ marginBottom: 8 }}>Enquiries</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>{EVENT_DATA.enquiries.join(' / ')}</p>
          <p style={{ fontSize: 12, color: 'var(--white-40)', marginTop: 6 }}>For questions about the gathering or registration</p>
        </div>
      </div>
    </div>
  );
}
