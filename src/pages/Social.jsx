import { SOCIAL_LINKS, EVENT_DATA } from '../data/eventData';
import { ExternalLink, Play, Radio } from 'lucide-react';

const platformIcons = {
  Facebook: <svg viewBox="0 0 24 24" fill="currentColor" style={{width:26,height:26}}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  YouTube:  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:26,height:26}}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  Instagram:<svg viewBox="0 0 24 24" fill="currentColor" style={{width:26,height:26}}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
  TikTok:   <svg viewBox="0 0 24 24" fill="currentColor" style={{width:22,height:22}}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.95-1.72-.1.97-.24 1.94-.47 2.9-1.09 4.71-5.81 7.76-10.45 6.94-4.22-.67-7.4-4.57-6.8-8.87.52-4.14 4.31-7.14 8.47-6.66.02 1.33.02 2.65.02 3.98-2.04-.33-4.14.73-4.88 2.68-.96 2.45.39 5.37 2.87 6.09 2.51.79 5.39-.71 5.92-3.29.35-1.52.26-3.11.27-4.66 0-3.32-.01-6.65-.01-9.98-.05-.13-.08-.28-.15-.41z"/></svg>,
};

const platformColors = { Facebook: '#1877F2', YouTube: '#FF0000', Instagram: '#E1306C', TikTok: '#ffffff' };

export default function Social() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-mid) 0%, rgba(147,51,234,0.08) 100%)',
        borderBottom: '1px solid rgba(147,51,234,0.12)',
        padding: '56px 20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Radio size={14} style={{ color: 'var(--purple-light)' }} />
          <p className="t-overline">Live &amp; Online</p>
        </div>
        <h1 className="t-page-title" style={{ marginBottom: 8 }}>Follow &amp; Connect</h1>
        <p style={{ fontSize: 13, color: 'var(--white-40)', lineHeight: 1.6 }}>
          Stay connected with Rev. Dr. Ebenezer Okronipa and the ministry across all platforms. Watch the gathering live on Facebook.
        </p>
      </div>

      <div style={{ padding: '24px 20px 120px', maxWidth: 560, margin: '0 auto' }}>

        {/* Live stream featured */}
        {SOCIAL_LINKS.filter(l => l.isLivestream).map(link => (
          <div key={link.id} style={{ marginBottom: 24 }}>
            <p className="t-section-label" style={{ marginBottom: 12 }}>Live Stream</p>
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(24,119,242,0.15), rgba(8,0,15,0.9))',
                border: '1px solid rgba(24,119,242,0.35)',
                transition: 'all 0.25s'
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(24,119,242,0.7)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(24,119,242,0.35)'}
              >
                {/* Top bar */}
                <div style={{
                  background: '#1877F2', padding: '12px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
                    {platformIcons.Facebook}
                    <span style={{ fontWeight: 800, fontSize: 13 }}>Facebook Live</span>
                  </div>
                  <span className="badge badge-live" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Play size={8} fill="white" /> Live
                  </span>
                </div>
                {/* Body */}
                <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--white)', marginBottom: 4 }}>{link.handle}</p>
                    <p style={{ fontSize: 12, color: 'var(--white-40)' }}>{link.description}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600 }}>
                    Watch <ExternalLink size={13} />
                  </div>
                </div>
              </div>
            </a>
          </div>
        ))}

        {/* Other platforms */}
        <p className="t-section-label" style={{ marginBottom: 14 }}>All Platforms</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SOCIAL_LINKS.filter(l => !l.isLivestream).map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="card" style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all 0.2s', cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = (platformColors[link.platform] || '#fff') + '40'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: `${platformColors[link.platform] || '#333'}15`,
                  border: `1px solid ${platformColors[link.platform] || '#333'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: platformColors[link.platform] || 'white'
                }}>
                  {platformIcons[link.platform]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{link.platform}</p>
                  <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>{link.handle}</p>
                  <p style={{ fontSize: 11, color: 'var(--white-40)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.description}</p>
                </div>
                <ExternalLink size={14} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>
            Enquiries: {EVENT_DATA.enquiries.join(' / ')}
          </p>
          <p className="font-label" style={{ fontSize: 14, color: 'var(--white)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 8 }}>
            The Prophetic Wife
          </p>
        </div>

      </div>
    </div>
  );
}
