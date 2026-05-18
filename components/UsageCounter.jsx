import { useState, useEffect } from 'react';
import { getRemaining, getCount, isPro, DAILY_LIMIT } from '../lib/usage';
import UpgradeModal from './UpgradeModal';

export default function UsageCounter() {
  const [remaining, setRemaining] = useState(null);
  const [isUserPro, setIsUserPro] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setRemaining(getRemaining());
    setIsUserPro(isPro());
  }, []);

  if (remaining === null) return null;

  if (isUserPro) {
    return (
      <div style={{
        display:'flex', alignItems:'center', gap:6,
        padding:'4px 12px', borderRadius:20,
        background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)',
        fontSize:11, fontWeight:700, color:'#22C55E',
      }}>
        ✓ PRO
      </div>
    );
  }

  const pct    = (remaining / DAILY_LIMIT) * 100;
  const color  = remaining > 5 ? '#22C55E' : remaining > 2 ? '#F59E0B' : '#EF4444';
  const urgent = remaining <= 2;

  return (
    <>
      {showModal && <UpgradeModal reason="daily_limit" onClose={() => setShowModal(false)} />}
      <button
        onClick={() => setShowModal(true)}
        title={`${remaining} of ${DAILY_LIMIT} free uses left today`}
        style={{
          display:'flex', alignItems:'center', gap:8,
          background: urgent ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
          border: urgent ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.07)',
          borderRadius:20, padding:'5px 12px',
          cursor:'pointer', outline:'none',
        }}
      >
        {/* progress bar */}
        <div style={{ width:44, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.4s' }} />
        </div>
        <span style={{ fontSize:11, fontWeight:700, color, whiteSpace:'nowrap' }}>
          {remaining}/{DAILY_LIMIT}
        </span>
        {urgent && <span style={{ fontSize:10, color:'#EF4444', fontWeight:600 }}>Upgrade ↗</span>}
      </button>
    </>
  );
}
