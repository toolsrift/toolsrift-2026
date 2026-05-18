import { useEffect } from 'react';
import { DAILY_LIMIT, getRemaining } from '../lib/usage';

const FREE_FEATURES = [`${DAILY_LIMIT} tool uses/day`, 'All FREE-tier tools', 'Resets at midnight'];
const PRO_FEATURES  = ['Unlimited uses', 'All PRO tools unlocked', 'Priority access', 'No ads, no limits'];

export default function UpgradeModal({ reason = 'daily_limit', onClose }) {
  const isDailyLimit = reason === 'daily_limit';
  const remaining    = getRemaining();

  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.85)', backdropFilter:'blur(10px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:20,
      }}
    >
      <div style={{
        background:'linear-gradient(145deg,#0D1117,#111827)',
        border:'1px solid rgba(255,255,255,0.09)',
        borderRadius:22, padding:'40px 40px 32px', maxWidth:460, width:'100%',
        position:'relative', textAlign:'center',
        fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
        boxShadow:'0 25px 80px rgba(0,0,0,0.6)',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position:'absolute', top:14, right:14,
          background:'rgba(255,255,255,0.06)', border:'none',
          color:'#94A3B8', width:30, height:30, borderRadius:7,
          cursor:'pointer', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center',
        }}>✕</button>

        {/* Badge */}
        <div style={{
          display:'inline-flex', alignItems:'center', gap:6,
          background: isDailyLimit ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
          border: isDailyLimit ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(99,102,241,0.25)',
          borderRadius:20, padding:'5px 14px', fontSize:11, fontWeight:700,
          color: isDailyLimit ? '#FCA5A5' : '#A5B4FC',
          textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:20,
        }}>
          {isDailyLimit ? '🔥 Daily Limit Reached' : '⚡ PRO Tool'}
        </div>

        {/* Heading */}
        <h2 style={{ color:'#F1F5F9', fontSize:24, fontWeight:800, margin:'0 0 10px', fontFamily:"'Sora',sans-serif", lineHeight:1.2 }}>
          {isDailyLimit ? "You've used all free tools today" : "This tool requires PRO"}
        </h2>
        <p style={{ color:'#64748B', fontSize:14, margin:'0 0 30px', lineHeight:1.7 }}>
          {isDailyLimit
            ? `Free users get ${DAILY_LIMIT} tool uses per day. Upgrade to PRO for unlimited access to every tool, forever.`
            : 'This tool is exclusive to PRO subscribers. Upgrade now to unlock everything with no daily limits.'}
        </p>

        {/* Plans comparison */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28, textAlign:'left' }}>
          {/* Free */}
          <div style={{ padding:18, borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Free</div>
            <div style={{ fontSize:26, fontWeight:800, color:'#E2E8F0', marginBottom:14 }}>$0</div>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ fontSize:12, color:'#64748B', marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'#334155' }}>•</span> {f}
              </div>
            ))}
          </div>
          {/* Pro */}
          <div style={{
            padding:18, borderRadius:14, position:'relative',
            background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))',
            border:'1px solid rgba(99,102,241,0.35)',
          }}>
            <div style={{
              position:'absolute', top:-9, right:12,
              background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color:'#fff', fontSize:9, fontWeight:800,
              padding:'3px 9px', borderRadius:10, letterSpacing:'0.06em',
            }}>POPULAR</div>
            <div style={{ fontSize:10, fontWeight:700, color:'#818CF8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Pro</div>
            <div style={{ fontSize:26, fontWeight:800, color:'#E2E8F0', marginBottom:14 }}>
              $12<span style={{ fontSize:13, fontWeight:400, color:'#64748B' }}>/mo</span>
            </div>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{ fontSize:12, color:'#A5B4FC', marginBottom:5, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ color:'#6366F1' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a href="/pricing" style={{
          display:'block', padding:'14px',
          background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
          color:'#fff', fontWeight:700, fontSize:15,
          textDecoration:'none', borderRadius:12, marginBottom:10,
          boxShadow:'0 8px 24px rgba(99,102,241,0.35)',
          transition:'transform 0.2s, box-shadow 0.2s',
        }}>
          ⚡ Upgrade to PRO — $12/month
        </a>
        <button onClick={onClose} style={{
          background:'transparent', border:'none', color:'#475569',
          fontSize:13, cursor:'pointer', padding:'8px', width:'100%',
        }}>
          Maybe later
        </button>

        {isDailyLimit && (
          <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)', fontSize:11, color:'#334155' }}>
            {remaining > 0
              ? `${remaining} of ${DAILY_LIMIT} uses remaining today`
              : `Limit reached · Resets at midnight`}
          </div>
        )}
      </div>
    </div>
  );
}
