import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function VocabularyPage() {
  const { updateStat } = useAuth();
  const [words, setWords] = useState([]);
  const [cur, setCur] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Per-word sentence practice state
  const [sentence, setSentence] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [mode, setMode] = useState('text');
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // History of all attempts per word: { [wordIndex]: [{sentence, review}] }
  const [attempts, setAttempts] = useState({});

  // Track which words are "done" (at least 1 reviewed sentence)
  const [submitted, setSubmitted] = useState({});

  const recRef = useRef(null);

  async function generate() {
    setLoading(true);
    setWords([]); setAttempts({}); setSubmitted({});
    setSentence(''); setCur(0);
    try {
      const r = await api.post('/ai/vocabulary', { customPrompt: customPrompt.trim() });
      setWords(r.data.words || []);
      await updateStat('words');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  async function reviewSentence() {
    if (!sentence.trim()) return;
    setReviewing(true);
    try {
      const w = words[cur];
      const r = await api.post('/ai/vocab-review', { word: w.word, sentence });
      const newAttempt = { sentence, review: r.data, time: new Date().toLocaleTimeString() };

      // Add to attempts history for this word
      setAttempts(a => ({
        ...a,
        [cur]: [...(a[cur] || []), newAttempt]
      }));

      // Mark word as submitted (at least once reviewed)
      setSubmitted(s => ({ ...s, [cur]: true }));

      // Clear input for next attempt
      setSentence('');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setReviewing(false);
  }

  function speak(text, rate = 0.85) {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function startListen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge for voice input.'); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const r = new SR(); r.lang = 'en-US'; r.continuous = false;
    r.onresult = e => { setSentence(e.results[0][0].transcript); setListening(false); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  }

  function goToWord(idx) {
    setCur(idx);
    setSentence('');
    setListening(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  const w = words[cur];
  const wordAttempts = attempts[cur] || [];
  const allReviewed = words.length > 0 && words.every((_, i) => submitted[i]);

  return (
    <div>
      {/* Generate Controls */}
      <div className="card card-glow">
        <div className="card-hd">
          <div className="card-title">💬 Vocabulary Builder</div>
          <span className="chip chip-accent">5 Words Per Batch</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
          💡 <strong style={{ color: 'var(--text2)' }}>How it works:</strong> Learn each word → Practice as many sentences as you want → Submit all 5 to unlock next batch!
        </div>
      </div>

      {/* All Done Banner */}
      {allReviewed && (
        <div className="submit-all-banner">
          <div>
            <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>🎉 All 5 words practiced!</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Excellent work! Generate another batch to keep learning.</div>
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
              <div
                key={i}
                className={`word-dot ${submitted[i] ? 'done' : i === cur ? 'current' : ''}`}
                onClick={() => goToWord(i)}
                title={submitted[i] ? `Word ${i + 1} — Practiced ✓` : i === cur ? 'Current word' : `Go to word ${i + 1}`}
              />
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
                <button
                  className={`btn btn-ghost btn-sm ${isSpeaking ? 'btn-danger' : ''}`}
                  onClick={() => speak(w.word)}
                >
                  {isSpeaking ? '⏹ Stop' : '🔊 Pronounce'}
                </button>
                {submitted[cur] && <span className="chip chip-green">✓ Practiced</span>}
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

          {/* Meta */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12, fontSize: 13 }}>
            <div style={{ color: 'var(--muted)' }}>📌 Usage: <span style={{ color: 'var(--text2)' }}>{w.usage}</span></div>
            <div style={{ color: 'var(--muted)' }}>💡 Tip: <span style={{ color: 'var(--text2)' }}>{w.memoryTip}</span></div>
          </div>

          {w.collocations && (
            <div className="colloc-row">
              {w.collocations.map((c, i) => <span key={i} className="colloc-chip">{c}</span>)}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '18px 0' }} />

          {/* ── SENTENCE PRACTICE ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text2)' }}>
              ✏️ Practice sentences using "<span style={{ color: 'var(--primary-light)' }}>{w.word}</span>":
            </div>
            {wordAttempts.length > 0 && (
              <span className="chip chip-green">
                {wordAttempts.length} sentence{wordAttempts.length > 1 ? 's' : ''} practiced
              </span>
            )}
          </div>

          {/* Mode switch */}
          <div className="mode-switch">
            <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => { setMode('text'); setListening(false); }}>⌨️ Type</button>
            <button className={`mode-btn ${mode === 'voice' ? 'active' : ''}`} onClick={() => setMode('voice')}>🎤 Speak</button>
          </div>

          {/* Input */}
          {mode === 'text' ? (
            <textarea
              className="form-input form-textarea"
              placeholder={`Write a new sentence using "${w.word}"... You can practice as many times as you want!`}
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              style={{ minHeight: 80 }}
            />
          ) : (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className={`btn ${listening ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={startListen}
                >
                  {listening ? '⏹ Stop Listening' : '🎤 Start Speaking'}
                </button>
                {listening && (
                  <span style={{ fontSize: 13, color: 'var(--rose)', animation: 'pulse 1s infinite' }}>
                    🔴 Listening...
                  </span>
                )}
              </div>
              {sentence && (
                <div style={{ marginTop: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: 'var(--text2)', fontStyle: 'italic' }}>
                  "{sentence}"
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginLeft: 10, fontSize: 11 }}
                    onClick={() => speak(sentence)}
                  >🔊 Hear it back</button>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={reviewSentence}
              disabled={reviewing || !sentence.trim()}
            >
              {reviewing ? '🔍 Reviewing...' : '✅ Get AI Review'}
            </button>
            {sentence && (
              <button className="btn btn-ghost" onClick={() => setSentence('')}>Clear</button>
            )}
            {mode === 'text' && sentence && (
              <button className="btn btn-ghost btn-sm" onClick={() => speak(sentence)}>
                {isSpeaking ? '⏹ Stop' : '🔊 Hear it'}
              </button>
            )}
          </div>

          {/* ── ATTEMPTS HISTORY ── */}
          {wordAttempts.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
                📋 Your Practice History ({wordAttempts.length} attempt{wordAttempts.length > 1 ? 's' : ''})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {wordAttempts.map((attempt, idx) => (
                  <div key={idx} style={{
                    background: 'var(--card2)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 16,
                    borderLeft: `3px solid ${attempt.review?.score >= 8 ? 'var(--green)' : attempt.review?.score >= 5 ? 'var(--accent)' : 'var(--rose)'}`,
                  }}>
                    {/* Attempt header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Lora,serif', fontSize: 16, fontWeight: 700,
                          background: attempt.review?.score >= 8 ? 'var(--green-dim)' : attempt.review?.score >= 5 ? 'var(--accent-dim)' : 'var(--rose-dim)',
                          color: attempt.review?.score >= 8 ? 'var(--green)' : attempt.review?.score >= 5 ? 'var(--accent)' : 'var(--rose)',
                          flexShrink: 0,
                        }}>
                          {attempt.review?.score}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                            Attempt {idx + 1}
                            {attempt.review?.correct
                              ? <span style={{ color: 'var(--green)', marginLeft: 8 }}>✅ Correct</span>
                              : <span style={{ color: 'var(--rose)', marginLeft: 8 }}>❌ Needs work</span>
                            }
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{attempt.time}</div>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => speak(attempt.sentence)}
                        style={{ fontSize: 12 }}
                      >🔊 Hear</button>
                    </div>

                    {/* The sentence */}
                    <div style={{
                      fontStyle: 'italic', fontSize: 14, color: 'var(--text)',
                      background: 'var(--bg)', padding: '8px 12px', borderRadius: 8, marginBottom: 10,
                    }}>
                      "{attempt.sentence}"
                    </div>

                    {/* Feedback */}
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: attempt.review?.improved ? 8 : 0 }}>
                      {attempt.review?.feedback}
                    </div>

                    {/* Improved version */}
                    {attempt.review?.improved && attempt.review.improved.trim() && (
                      <div style={{
                        fontStyle: 'italic', color: 'var(--green)', fontSize: 13,
                        background: 'var(--green-dim)', padding: '8px 12px',
                        borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                      }}>
                        <span>✨ Better: {attempt.review.improved}</span>
                        <button className="speak-btn" onClick={() => speak(attempt.review.improved)}>🔊</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Practice more encouragement */}
              <div style={{
                marginTop: 14, padding: '12px 16px', background: 'var(--primary-dim)',
                border: '1px solid rgba(124,106,245,0.2)', borderRadius: 10,
                fontSize: 13, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>💪</span>
                <div>
                  {wordAttempts.length < 3
                    ? `Great start! Try ${3 - wordAttempts.length} more sentence${3 - wordAttempts.length > 1 ? 's' : ''} to really master "${w.word}"`
                    : wordAttempts.length < 5
                      ? `You're doing amazing! Keep practicing more sentences to build confidence!`
                      : `🏆 Excellent mastery of "${w.word}"! You've practiced ${wordAttempts.length} times!`
                  }
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => goToWord(Math.max(0, cur - 1))}
              disabled={cur === 0}
            >← Prev</button>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{cur + 1} / {words.length}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => goToWord(Math.min(words.length - 1, cur + 1))}
              disabled={cur === words.length - 1 || !submitted[cur]}
              title={!submitted[cur] ? 'Practice at least one sentence first!' : 'Next word'}
            >Next →</button>
          </div>

          {!submitted[cur] && (
            <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
              ⚡ Get at least one AI review to unlock the next word
            </div>
          )}
        </div>
      )}

      <div className="ad-banner"><span>📢 Advertisement</span></div>
    </div>
  );
}