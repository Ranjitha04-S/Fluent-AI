import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const scenarios = [
  { icon: '👨‍🏫', label: 'Teacher & Student', prompt: 'You are an English teacher and I am your student. Start a friendly conversation to help me practice English. Ask me questions and correct my mistakes gently.' },
  { icon: '🛒', label: 'Shopping', prompt: 'You are a shopkeeper at a clothing store. I am a customer. Help me find what I need and start a natural shopping conversation.' },
  { icon: '🍽️', label: 'Restaurant', prompt: 'You are a waiter at a nice restaurant. I am a customer. Take my order and have a friendly conversation about the menu.' },
  { icon: '✈️', label: 'Airport / Travel', prompt: 'You are an airport staff member. I am a traveler who needs help. Start a conversation about my travel plans.' },
  { icon: '💼', label: 'Job Interview', prompt: 'You are an interviewer at a tech company. I am a candidate for a software job. Start the interview professionally.' },
  { icon: '🏥', label: 'Doctor Visit', prompt: 'You are a doctor at a clinic. I am a patient. Start by asking about my symptoms and health concerns.' },
  { icon: '📞', label: 'Phone Call', prompt: 'You are a customer service representative. I am calling to get help with a problem. Start the phone conversation.' },
  { icon: '✏️', label: 'Custom Scenario', prompt: '' },
];

export default function StudioPage() {
  const { updateStat } = useAuth();
  const [tab, setTab] = useState('conversation');

  // Conversation state
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [customScenario, setCustomScenario] = useState('');
  const [history, setHistory] = useState([]);
  const [userMsg, setUserMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [convStarted, setConvStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const convEndRef = useRef(null);
  const recRef = useRef(null);

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [mrec, setMrec] = useState(null);
  const [waves, setWaves] = useState(Array(22).fill(3));
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => { convEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  // ─── CONVERSATION ───
  async function startConversation() {
    const scenario = selectedScenario?.icon === '✏️' ? customScenario : selectedScenario?.prompt;
    if (!scenario) return;
    setAiLoading(true); setHistory([]);
    try {
      const r = await api.post('/ai/conversation', { scenario, history: [], userMessage: 'Hello, let\'s start.' });
      setHistory([{ role: 'assistant', content: r.data.reply, time: new Date().toLocaleTimeString() }]);
      setConvStarted(true);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setAiLoading(false);
    await updateStat('speaking');
  }

  async function sendMessage() {
    if (!userMsg.trim() || aiLoading) return;
    const msg = userMsg.trim();
    setUserMsg('');
    const scenario = selectedScenario?.icon === '✏️' ? customScenario : selectedScenario?.prompt;
    const newHistory = [...history, { role: 'user', content: msg, time: new Date().toLocaleTimeString() }];
    setHistory(newHistory);
    setAiLoading(true);
    try {
      const apiHistory = newHistory.map(h => ({ role: h.role, content: h.content }));
      const r = await api.post('/ai/conversation', { scenario, history: apiHistory.slice(-10), userMessage: msg });
      setHistory(h => [...h, { role: 'assistant', content: r.data.reply, time: new Date().toLocaleTimeString() }]);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setAiLoading(false);
  }

  function stopConversation() {
    setConvStarted(false); setHistory([]); setSelectedScenario(null);
  }

  function speakAI(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\[Note:.*?\]/g, ''));
    u.lang = 'en-US'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function startListenConv() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge.'); return; }
    const r = new SR(); r.lang = 'en-US'; r.continuous = false;
    r.onresult = e => { setUserMsg(e.results[0][0].transcript); setListening(false); };
    r.onend = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  }

  // Parse AI note from response
  function parseAIMsg(content) {
    const noteMatch = content.match(/\[Note:(.*?)\]/);
    const cleanMsg = content.replace(/\[Note:.*?\]/g, '').trim();
    return { msg: cleanMsg, note: noteMatch ? noteMatch[1].trim() : null };
  }

  // ─── RECORDING ───
  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = e => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const dur = Math.round((Date.now() - startRef.current) / 1000);
        setRecordings(r => [...r, { url, name: `Recording ${r.length + 1}`, dur, time: new Date().toLocaleTimeString(), blob }]);
        cancelAnimationFrame(animRef.current);
        setWaves(Array(22).fill(3));
      };
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize = 64;
      src.connect(an); analyserRef.current = an;
      const anim = () => {
        const d = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(d);
        setWaves(Array.from({ length: 22 }, (_, i) => Math.max(3, (d[i % d.length] / 255) * 40 + 3)));
        animRef.current = requestAnimationFrame(anim);
      };
      anim();
      rec.start(); setMrec(rec); setRecording(true); startRef.current = Date.now();
      await updateStat('speaking');
    } catch { alert('Microphone access denied.'); }
  }

  function stopRec() { mrec?.stop(); streamRef.current?.getTracks().forEach(t => t.stop()); setRecording(false); setMrec(null); }

  async function analyzeRec(idx) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported.'); return; }
    setAnalyzing(true); setFeedback(null);
    const audio = new Audio(recordings[idx].url);
    const r = new SR(); r.lang = 'en-US'; r.continuous = false;
    r.onresult = async e => {
      const transcript = e.results[0][0].transcript;
      try {
        const res = await api.post('/ai/speech-analysis', { transcript });
        setFeedback({ ...res.data, transcript });
      } catch (e) { alert(e.response?.data?.error || e.message); }
      setAnalyzing(false);
    };
    r.onerror = () => { alert('Could not analyze audio.'); setAnalyzing(false); };
    r.start();
    setTimeout(() => audio.play(), 200);
  }

  function downloadRec(rec) { const a = document.createElement('a'); a.href = rec.url; a.download = `${rec.name}.webm`; a.click(); }
  function deleteRec(idx) { URL.revokeObjectURL(recordings[idx].url); setRecordings(r => r.filter((_, i) => i !== idx)); }

  return (
    <div>
      <div className="tab-bar">
        {[['conversation', '🤖 AI Conversation'], ['recording', '🎙️ Recording Studio']].map(([k, l]) => (
          <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── CONVERSATION TAB ── */}
      {tab === 'conversation' && (
        <div>
          {!convStarted ? (
            <div>
              <div className="card card-glow">
                <div className="card-hd">
                  <div className="card-title">🤖 AI Conversation Practice</div>
                  <span className="chip chip-primary">Infinite Practice</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                  Choose a scenario and practice real conversations with AI. The AI will play the role and also correct your grammar mistakes gently. You can talk forever until you stop!
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
                  {scenarios.map((s, i) => (
                    <div key={i}
                      style={{
                        padding: '14px 12px', border: `1px solid ${selectedScenario === s ? 'rgba(124,106,245,0.4)' : 'var(--border)'}`,
                        borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                        background: selectedScenario === s ? 'var(--primary-dim)' : 'var(--card2)',
                        color: selectedScenario === s ? 'var(--primary-light)' : 'var(--text2)',
                        transition: 'all 0.15s', fontSize: 13, fontWeight: 600,
                      }}
                      onClick={() => setSelectedScenario(s)}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      {s.label}
                    </div>
                  ))}
                </div>

                {selectedScenario?.icon === '✏️' && (
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Describe Your Scenario</label>
                    <textarea
                      className="form-input form-textarea"
                      style={{ minHeight: 100 }}
                      placeholder="e.g. You are my best friend. We haven't met in 3 years. Start a friendly catching-up conversation..."
                      value={customScenario}
                      onChange={e => setCustomScenario(e.target.value)}
                    />
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={startConversation}
                  disabled={!selectedScenario || aiLoading || (selectedScenario?.icon === '✏️' && !customScenario.trim())}
                >
                  {aiLoading ? '🤖 Starting...' : '🚀 Start Conversation'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-hd">
                <div>
                  <div className="card-title">🤖 {selectedScenario?.label || 'Custom'} Conversation</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{history.length} messages • Speak or type your reply</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={stopConversation}>⏹ End</button>
              </div>

              {/* Chat box */}
              <div className="conv-box">
                {history.map((msg, i) => {
                  const { msg: cleanMsg, note } = msg.role === 'assistant' ? parseAIMsg(msg.content) : { msg: msg.content, note: null };
                  return (
                    <div key={i} className={`msg-bubble ${msg.role === 'assistant' ? 'msg-ai' : 'msg-user'}`}>
                      <div className="msg-content">{cleanMsg}</div>
                      {note && <div className="msg-note">📝 {note}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div className="msg-time">{msg.time}</div>
                        {msg.role === 'assistant' && (
                          <button className="speak-btn" onClick={() => speakAI(cleanMsg)} style={{ fontSize: 12 }}>🔊</button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {aiLoading && (
                  <div className="msg-bubble msg-ai">
                    <div className="msg-content" style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--muted)' }}>
                      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> AI is typing...
                    </div>
                  </div>
                )}
                <div ref={convEndRef} />
              </div>

              {/* Input */}
              <div className="conv-input-row">
                <button
                  className={`btn btn-sm ${listening ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startListenConv}
                  style={{ flexShrink: 0 }}
                >{listening ? '⏹' : '🎤'}</button>
                <textarea
                  className="form-input"
                  style={{ minHeight: 50, maxHeight: 120, resize: 'vertical', flex: 1 }}
                  placeholder="Type your reply or use the mic... Press Enter to send"
                  value={userMsg}
                  onChange={e => setUserMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <button className="btn btn-primary btn-sm" onClick={sendMessage} disabled={aiLoading || !userMsg.trim()} style={{ flexShrink: 0 }}>Send →</button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, textAlign: 'center' }}>
                Press Enter to send • Shift+Enter for new line • 🎤 for voice • AI corrects grammar in [brackets]
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RECORDING TAB ── */}
      {tab === 'recording' && (
        <div>
          <div className="card card-glow" style={{ textAlign: 'center', padding: 36 }}>
            <div className="card-title" style={{ marginBottom: 8 }}>🎙️ Voice Recording Studio</div>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              {recording ? 'Recording in progress — speak clearly and naturally 🟢' : 'Press the button to record your voice. Practice speaking, get AI feedback, and download your recordings!'}
            </p>
            <div className="waveform">
              {waves.map((h, i) => <div key={i} className="wave-bar" style={{ height: h + 'px', opacity: recording ? 1 : 0.2 }} />)}
            </div>
            <button className={`rec-orb ${recording ? 'recording' : ''}`} onClick={recording ? stopRec : startRec}>
              {recording ? '⏹' : '🎤'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>{recording ? 'Tap to stop' : 'Tap to record'}</p>
          </div>

          {recordings.length > 0 && (
            <div className="card">
              <div className="card-hd">
                <div className="card-title">🎵 Your Recordings</div>
                <span className="chip chip-blue">{recordings.length} saved</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recordings.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 100 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{rec.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{rec.dur}s · {rec.time}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <audio src={rec.url} controls style={{ height: 32 }} />
                      <button className="btn btn-ghost btn-sm" onClick={() => analyzeRec(i)} disabled={analyzing}>🔍 AI Analyze</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => downloadRec(rec)}>⬇️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteRec(i)} style={{ color: 'var(--rose)' }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>

              {analyzing && (
                <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 14, color: 'var(--muted)' }}>
                  🔍 Analyzing your speech with AI...
                </div>
              )}

              {feedback && (
                <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--green-dim)', color: 'var(--green)', fontFamily: 'Lora,serif', fontSize: 20, fontWeight: 700, flexShrink: 0,
                    }}>{feedback.score}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>AI Speech Analysis</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Score: {feedback.score}/10</div>
                    </div>
                  </div>
                  <div style={{ fontStyle: 'italic', color: 'var(--text2)', fontSize: 13, background: 'var(--bg)', padding: '8px 14px', borderRadius: 8, marginBottom: 12 }}>
                    "{feedback.transcript}"
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}>{feedback.overallFeedback}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--text)' }}>Grammar:</strong> {feedback.grammarNote}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(feedback.tips || []).map((t, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--blue)', paddingLeft: 10, borderLeft: '2px solid rgba(91,164,245,0.3)' }}>{t}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="ad-banner"><span>📢 Advertisement</span></div>
    </div>
  );
}
