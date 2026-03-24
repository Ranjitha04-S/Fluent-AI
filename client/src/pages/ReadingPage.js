import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ReadingPage() {
  const { updateStat } = useAuth();
  const [tab, setTab] = useState('reading');

  // Reading state
  const [level, setLevel] = useState('intermediate');
  const [customPrompt, setCustomPrompt] = useState('');
  const [mode, setMode] = useState('random');
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Tongue twister state
  const [twister, setTwister] = useState(null);
  const [tLoading, setTLoading] = useState(false);
  const [practiceCount, setPracticeCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingSlow, setIsSpeakingSlow] = useState(false);
  const [isSpeakingFast, setIsSpeakingFast] = useState(false);
  const recRef = useRef(null);

  async function generateArticle() {
    setLoading(true); setArticle(null); stopSpeaking();
    try {
      const r = await api.post('/ai/reading', { level, customPrompt: mode === 'custom' ? customPrompt : '' });
      const lines = r.data.content.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').replace(/\*\*/g, '');
      const body = lines.slice(1).join('\n').trim();
      const wc = body.split(/\s+/).length;
      setArticle({ title, body, wc, rt: Math.ceil(wc / 200) });
      await updateStat('articles');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  async function generateTwister() {
    setTLoading(true); setTwister(null); stopSpeaking();
    try {
      const r = await api.post('/ai/tongue-twister');
      setTwister(r.data);
      setPracticeCount(0);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setTLoading(false);
  }

  // ── SPEECH FUNCTIONS ──
  function speakText(text, rate = 0.85, onDone) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { setIsSpeaking(false); setIsSpeakingSlow(false); setIsSpeakingFast(false); if (onDone) onDone(); };
    u.onerror = () => { setIsSpeaking(false); setIsSpeakingSlow(false); setIsSpeakingFast(false); };
    window.speechSynthesis.speak(u);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false); setIsSpeakingSlow(false); setIsSpeakingFast(false);
  }

  function handleListenArticle() {
    if (isSpeaking) { stopSpeaking(); return; }
    speakText(article.body, 0.85);
    setIsSpeaking(true);
  }

  function handleSlowTwister() {
    if (isSpeakingSlow) { stopSpeaking(); return; }
    setIsSpeakingSlow(true); setIsSpeakingFast(false);
    speakText(twister.twister, 0.6);
  }

  function handleFastTwister() {
    if (isSpeakingFast) { stopSpeaking(); return; }
    setIsSpeakingFast(true); setIsSpeakingSlow(false);
    speakText(twister.twister, 1.2);
  }

  function startPractice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Use Chrome or Edge.'); return; }
    if (isListening) { recRef.current?.stop(); setIsListening(false); return; }
    const r = new SR(); r.lang = 'en-US'; r.continuous = false;
    r.onresult = () => { setPracticeCount(c => c + 1); setIsListening(false); };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start(); recRef.current = r; setIsListening(true);
  }

  const paragraphs = article?.body.split('\n\n').filter(p => p.trim()) || [];

  return (
    <div>
      <div className="tab-bar">
        {[['reading', '📖 Reading'], ['twister', '👅 Tongue Twister']].map(([k, l]) => (
          <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => { setTab(k); stopSpeaking(); }}>{l}</button>
        ))}
      </div>

      {/* ── READING TAB ── */}
      {tab === 'reading' && (
        <div>
          <div className="card card-glow">
            <div className="card-hd">
              <div className="card-title">📖 AI Reading Practice</div>
              {article && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setFontSize(f => Math.max(13, f - 1))}>A−</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setFontSize(f => Math.min(24, f + 1))}>A+</button>
                  <button
                    className={`btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={handleListenArticle}
                  >
                    {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
                  </button>
                </div>
              )}
            </div>

            <div className="pill-row">
              {[['beginner', '🌱 Beginner'], ['intermediate', '🌿 Intermediate'], ['advanced', '🌳 Advanced']].map(([l, lbl]) => (
                <div key={l}
                  className={`pill ${level === l ? (l === 'beginner' ? 'green' : l === 'intermediate' ? 'accent' : 'rose') : ''}`}
                  onClick={() => setLevel(l)}>{lbl}
                </div>
              ))}
            </div>

            <div className="mode-switch" style={{ marginBottom: 14 }}>
              <button className={`mode-btn ${mode === 'random' ? 'active' : ''}`} onClick={() => setMode('random')}>🎲 Random</button>
              <button className={`mode-btn ${mode === 'custom' ? 'active' : ''}`} onClick={() => setMode('custom')}>✏️ Custom Topic</button>
            </div>

            {mode === 'custom' && (
              <div style={{ marginBottom: 14 }}>
                <input
                  className="form-input"
                  placeholder="Enter topic: e.g. ancient temples, space exploration, street food, yoga benefits..."
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateArticle()}
                />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  Try: "Indian culture", "climate change", "artificial intelligence", "healthy lifestyle"
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={generateArticle} disabled={loading || (mode === 'custom' && !customPrompt.trim())}>
                {loading ? '✨ Generating...' : '🎲 Generate Article'}
              </button>
              {article && <button className="btn btn-ghost" onClick={() => { setArticle(null); stopSpeaking(); }}>Clear</button>}
            </div>
          </div>

          {loading && (
            <div className="card">
              {[100, 95, 80, 100, 70, 100, 85, 60].map((w, i) => (
                <div key={i} className={`skel ${i === 0 ? 'skel-title' : 'skel-line'}`} style={{ width: w + '%' }} />
              ))}
            </div>
          )}

          {article && (
            <div className="card">
              <div className="article-meta">
                <div className="meta-pill">📊 {article.wc} words</div>
                <div className="meta-pill">⏱ ~{article.rt} min read</div>
                <div className="meta-pill">📈 {level}</div>
                {isSpeaking && <div className="meta-pill" style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid rgba(245,107,107,0.2)' }}>🔊 Playing...</div>}
              </div>
              <h1 className="article-title">{article.title}</h1>
              <div className="article-body" style={{ fontSize }}>
                {paragraphs.map((p, i) => <p key={i}>{p.trim()}</p>)}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  className={`btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={handleListenArticle}
                >
                  {isSpeaking ? '⏹ Stop Reading' : '🔊 Read Aloud'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { generateArticle(); }}>🔄 New Article</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TONGUE TWISTER TAB ── */}
      {tab === 'twister' && (
        <div>
          <div className="card card-glow">
            <div className="card-hd">
              <div className="card-title">👅 Tongue Twister Practice</div>
              <span className="chip chip-accent">Pronunciation</span>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 18, lineHeight: 1.7 }}>
              Tongue twisters improve pronunciation, speech clarity, and accent. Generate one and try to say it faster each time!
            </p>
            <button className="btn btn-primary" onClick={generateTwister} disabled={tLoading}>
              {tLoading ? '✨ Generating...' : '🎲 Generate Tongue Twister'}
            </button>
          </div>

          {tLoading && (
            <div className="card">
              <div className="skel skel-title" />
              <div className="skel skel-line" />
              <div className="skel skel-line" style={{ width: '70%' }} />
            </div>
          )}

          {twister && (
            <div className="card">
              <div className="twister-card">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--primary-light)', marginBottom: 10 }}>
                  Tongue Twister
                </div>
                <div className="twister-text">"{twister.twister}"</div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Sounds to Practice</div>
                  <div className="sounds-row">
                    {(twister.sounds || []).map((s, i) => <span key={i} className="sound-chip">/{s}/</span>)}
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Slow Version</div>
                  <div className="twister-slow">{twister.slowVersion}</div>
                </div>

                <div style={{ background: 'rgba(124,106,245,0.08)', border: '1px solid rgba(124,106,245,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 4 }}>💡 Tip</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.6 }}>{twister.tip}</div>
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <button
                  className={`btn btn-sm ${isSpeakingSlow ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={handleSlowTwister}
                >
                  {isSpeakingSlow ? '⏹ Stop' : '🔊 Hear Slow'}
                </button>
                <button
                  className={`btn btn-sm ${isSpeakingFast ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={handleFastTwister}
                >
                  {isSpeakingFast ? '⏹ Stop' : '⚡ Hear Fast'}
                </button>
                <button
                  className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-primary'}`}
                  onClick={startPractice}
                >
                  {isListening ? '⏹ Stop Listening' : '🎤 Practice Speaking'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={generateTwister}>🔄 New Twister</button>
              </div>

              {practiceCount > 0 && (
                <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,211,165,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 28 }}>🏆</span>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>
                      You practiced {practiceCount} time{practiceCount > 1 ? 's' : ''}!
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text2)', marginTop: 2 }}>
                      {practiceCount < 3 ? 'Keep going! Try to say it faster.' :
                        practiceCount < 6 ? 'Great job! Say it without pausing.' :
                          '🌟 Amazing! You\'re a tongue twister master!'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
