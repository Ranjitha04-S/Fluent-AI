import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VocabularyPage() {
  const { updateStat } = useAuth();
  const [words, setWords] = useState([]);
  const [cur, setCur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [sentences, setSentences] = useState({});
  const [reviews, setReviews] = useState({});
  const [reviewing, setReviewing] = useState(null);
  const [mode, setMode] = useState('text');
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitted, setSubmitted] = useState({});
  const [allDone, setAllDone] = useState(false);
  const recRef = useRef(null);

  async function generate() {
    setLoading(true); setWords([]); setSentences({}); setReviews({}); setSubmitted({}); setAllDone(false); setCur(0);
    try {
      const r = await api.post('/ai/vocabulary', { customPrompt: customPrompt.trim() });
      setWords(r.data.words || []);
      await updateStat('words');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  async function reviewSentence(idx) {
    const w = words[idx];
    const sentence = sentences[idx] || '';
    if (!sentence.trim()) return;
    setReviewing(idx);
    try {
      const r = await api.post('/ai/vocab-review', { word: w.word, sentence });
      setReviews(rv => ({ ...rv, [idx]: r.data }));
      setSubmitted(s => ({ ...s, [idx]: true }));
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setReviewing(null);
  }

  function speak(text) {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function startListen(idx) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return; }
    const r = new SR(); r.lang = 'en-US'; r.continuous = false;
    r.onresult = e => { setSentences(s => ({ ...s, [idx]: e.results[0][0].transcript })); setListening(false); };
    r.onend = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  }

  // Check if all 5 words have been reviewed
  const allReviewed = words.length > 0 && words.every((_, i) => submitted[i]);

  const w = words[cur];

  return (
    <div>
      {/* Generate Controls */}
      <div className="card card-glow">
        <div className="card-hd">
          <div className="card-title">💬 Vocabulary Builder</div>
          <span className="chip chip-accent">5 Words Per Batch</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">Custom Topic (optional)</label>
            <input
              className="form-input"
              placeholder="e.g. vegetables, daily routines, spiritual words, technology, cooking..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
            />
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? '✨ Generating...' : '🎲 Generate 5 Words'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--text2)' }}>How it works:</strong> Generate 5 words → Learn each word → Write/speak a sentence using it → Get AI review → Submit all 5 to unlock the next batch!
        </div>
      </div>

      {/* All Done Banner */}
      {allReviewed && (
        <div className="submit-all-banner">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>🎉 All 5 sentences reviewed!</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Great work! Generate another batch to keep learning.</div>
          </div>
          <button className="btn btn-green" onClick={generate}>🔄 Next 5 Words →</button>
        </div>
      )}

      {loading && (
        <div className="card">
          {[36, 16, 16, 80, 16, 16].map((h, i) => (
            <div key={i} className="skel" style={{ height: h, marginBottom: 12, width: i === 1 ? '35%' : '100%' }} />
          ))}
        </div>
      )}

      {words.length > 0 && w && (
        <div className="card">
          {/* Progress dots */}
          <div className="word-progress">
            {words.map((_, i) => (
              <div key={i} className={`word-dot ${submitted[i] ? 'done' : i === cur ? 'current' : ''}`}
                onClick={() => setCur(i)}
                title={submitted[i] ? 'Reviewed ✓' : i === cur ? 'Current' : 'Click to jump'} />
            ))}
          </div>

          {/* Word hero */}
          <div className="word-display">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div className="word-big">{w.word}</div>
                <div className="word-phonetic">{w.phonetic}</div>
                <div className="word-pos">{w.partOfSpeech}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => speak(w.word)}>{isSpeaking ? '⏹ Stop' : '🔊 Pronounce'}</button>
                {submitted[cur] && <span className="chip chip-green">✓ Reviewed</span>}
              </div>
            </div>
            <div className="word-def">{w.definition}</div>
          </div>

          {/* Examples */}
          <div className="examples-box">
            <div className="ex-label">Example Sentences</div>
            {(w.examples || []).map((ex, i) => (
              <div className="ex-item" key={i}>
                <span>{ex}</span>
                <button className="speak-btn" onClick={() => speak(ex)}>🔊</button>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12, fontSize: 13 }}>
            <div style={{ color: 'var(--muted)' }}>📌 Usage: <span style={{ color: 'var(--text2)' }}>{w.usage}</span></div>
            <div style={{ color: 'var(--muted)' }}>💡 Tip: <span style={{ color: 'var(--text2)' }}>{w.memoryTip}</span></div>
          </div>

          {/* Collocations */}
          {w.collocations && (
            <div className="colloc-row">
              {w.collocations.map((c, i) => <span key={i} className="colloc-chip">{c}</span>)}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '18px 0' }} />

          {/* Sentence practice */}
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--text2)' }}>
            ✏️ Use "<span style={{ color: 'var(--primary-light)' }}>{w.word}</span>" in a sentence:
            {!submitted[cur] && <span style={{ fontSize: 12, color: 'var(--rose)', marginLeft: 8, fontWeight: 400 }}>Required to unlock next batch</span>}
          </div>

          <div className="mode-switch">
            <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>⌨️ Type</button>
            <button className={`mode-btn ${mode === 'voice' ? 'active' : ''}`} onClick={() => setMode('voice')}>🎤 Speak</button>
          </div>

          {mode === 'text' ? (
            <textarea
              className="form-input form-textarea"
              placeholder={`Write a sentence using "${w.word}"...`}
              value={sentences[cur] || ''}
              onChange={e => setSentences(s => ({ ...s, [cur]: e.target.value }))}
              disabled={submitted[cur]}
              style={{ minHeight: 80, opacity: submitted[cur] ? 0.7 : 1 }}
            />
          ) : (
            <div style={{ marginBottom: 14 }}>
              <button
                className={`btn ${listening ? 'btn-danger' : 'btn-ghost'}`}
                onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : () => startListen(cur)}
                disabled={submitted[cur]}
              >{listening ? '⏹ Stop' : '🎤 Start Speaking'}</button>
              {sentences[cur] && (
                <div style={{ marginTop: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'var(--text2)', fontStyle: 'italic' }}>
                  "{sentences[cur]}"
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            {!submitted[cur] ? (
              <button className="btn btn-primary"
                onClick={() => reviewSentence(cur)}
                disabled={reviewing === cur || !sentences[cur]?.trim()}>
                {reviewing === cur ? '🔍 Reviewing...' : '✅ Get AI Review'}
              </button>
            ) : (
              <span className="chip chip-green" style={{ padding: '8px 14px', fontSize: 13 }}>✓ Sentence Reviewed!</span>
            )}
            {sentences[cur] && !submitted[cur] && (
              <button className="btn btn-ghost" onClick={() => setSentences(s => ({ ...s, [cur]: '' }))}>Clear</button>
            )}
          </div>

          {/* Review result */}
          {reviews[cur] && (
            <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Lora,serif', fontSize: 18, fontWeight: 700,
                  background: reviews[cur].score >= 8 ? 'var(--green-dim)' : reviews[cur].score >= 5 ? 'var(--accent-dim)' : 'var(--rose-dim)',
                  color: reviews[cur].score >= 8 ? 'var(--green)' : reviews[cur].score >= 5 ? 'var(--accent)' : 'var(--rose)',
                }}>
                  {reviews[cur].score}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{reviews[cur].correct ? '✅ Correct usage!' : '❌ Needs improvement'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Score: {reviews[cur].score}/10</div>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>{reviews[cur].feedback}</div>
              {reviews[cur].improved && reviews[cur].improved.trim() && (
                <div style={{ fontStyle: 'italic', color: 'var(--green)', fontSize: 13, background: 'var(--green-dim)', padding: '8px 12px', borderRadius: 8 }}>
                  ✨ Better: {reviews[cur].improved}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setCur(c => Math.max(0, c - 1))} disabled={cur === 0}>← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{cur + 1} / {words.length}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setCur(c => Math.min(words.length - 1, c + 1))}
              disabled={cur === words.length - 1 || (!submitted[cur] && !allReviewed)}
              title={!submitted[cur] ? 'Review this word first!' : ''}
            >Next →</button>
          </div>

          {!submitted[cur] && (
            <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
              ⚡ Submit a sentence review to go to the next word
            </div>
          )}
        </div>
      )}

      <div className="ad-banner"><span>📢 Advertisement</span></div>
    </div>
  );
}
