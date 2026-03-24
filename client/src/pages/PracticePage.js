import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const topicTypes = [
  { k: 'opinion', icon: '💭', l: 'Opinion' },
  { k: 'story', icon: '📚', l: 'Story' },
  { k: 'description', icon: '🎨', l: 'Describe' },
  { k: 'problem', icon: '🧩', l: 'Problem Solving' },
  { k: 'experience', icon: '✈️', l: 'Experience' },
  { k: 'random', icon: '🎲', l: 'Random' },
];

export default function PracticePage() {
  const { updateStat } = useAuth();
  const [tType, setTType] = useState('random');
  const [customTopic, setCustomTopic] = useState('');
  const [topicMode, setTopicMode] = useState('random');
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState('write');
  const [response, setResponse] = useState('');
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const recRef = useRef(null);

  async function getTopic() {
    setLoading(true); setTopic(null); setReview(null); setResponse(''); stopTimer();
    try {
      const r = await api.post('/ai/topic', {
        topicType: tType,
        customPrompt: topicMode === 'custom' ? customTopic : ''
      });
      setTopic(r.data);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  function startTimer(mins) {
    stopTimer();
    const s = mins * 60;
    setTotalTime(s); setTimeLeft(s); setRunning(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { stopTimer(); return 0; } return t - 1; });
    }, 1000);
  }

  function stopTimer() { clearInterval(timerRef.current); setRunning(false); }
  useEffect(() => () => stopTimer(), []);

  function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

  async function getReview() {
    if (!response.trim() || !topic) return;
    setReviewing(true); setReview(null);
    try {
      const r = await api.post('/ai/speaking-review', { topic: topic.topic, response });
      setReview(r.data);
      await updateStat('quizzes');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setReviewing(false);
  }

  function startListen() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome or Edge.'); return; }
    const r = new SR(); r.lang = 'en-US'; r.continuous = true; r.interimResults = false;
    r.onresult = e => setResponse(Array.from(e.results).map(r => r[0].transcript).join(' '));
    r.onend = () => setListening(false);
    r.start(); recRef.current = r; setListening(true);
  }

  return (
    <div>
      <div className="card card-glow">
        <div className="card-hd">
          <div className="card-title">🎯 Speaking & Writing Practice</div>
        </div>

        {/* Topic Mode */}
        <div className="mode-switch" style={{ marginBottom: 16 }}>
          <button className={`mode-btn ${topicMode === 'random' ? 'active' : ''}`} onClick={() => setTopicMode('random')}>🎲 Random Topic</button>
          <button className={`mode-btn ${topicMode === 'custom' ? 'active' : ''}`} onClick={() => setTopicMode('custom')}>✏️ Custom Topic</button>
        </div>

        {topicMode === 'custom' ? (
          <div style={{ marginBottom: 16 }}>
            <input
              className="form-input"
              placeholder="Enter your own topic: e.g. 'Talk about your favourite festival', 'Describe your dream job', 'What would you do if you won a lottery?'"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Topic Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8 }}>
              {topicTypes.map(t => (
                <div key={t.k}
                  style={{
                    padding: '12px 10px', border: `1px solid ${tType === t.k ? 'rgba(124,106,245,0.4)' : 'var(--border)'}`,
                    borderRadius: 10, cursor: 'pointer', textAlign: 'center', fontSize: 12.5, fontWeight: 600,
                    color: tType === t.k ? 'var(--primary-light)' : 'var(--muted)',
                    background: tType === t.k ? 'var(--primary-dim)' : 'var(--card2)',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => setTType(t.k)}>
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{t.icon}</div>
                  {t.l}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={getTopic} disabled={loading || (topicMode === 'custom' && !customTopic.trim())}>
          {loading ? '✨ Generating...' : '🎲 Get Topic'}
        </button>
      </div>

      {loading && (
        <div className="card">
          {[22, 14, 14, 14].map((h, i) => <div key={i} className="skel" style={{ height: h, marginBottom: 10, width: i === 0 ? '60%' : ['100%', '80%', '70%'][i - 1] }} />)}
        </div>
      )}

      {topic && (
        <>
          <div className="topic-card">
            <div className="tc-label">🎯 Your Topic</div>
            <div className="tc-topic">{topic.topic}</div>
            {topic.description && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.6 }}>{topic.description}</div>}
            <div className="tc-hints">
              {(topic.hints || []).map((h, i) => <div key={i} className="tc-hint">{h}</div>)}
            </div>
            {topic.vocabularyHelp && (
              <div className="vocab-help" style={{ marginTop: 12 }}>
                {topic.vocabularyHelp.map((v, i) => (
                  <div key={i} className="vh-chip" title={v.meaning}>{v.word}: {v.meaning}</div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            {/* Timer */}
            <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>⏱ Timer (Optional)</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: totalTime > 0 ? 12 : 0 }}>
                {[1, 2, 3, 5, 10].map(t => (
                  <button key={t} className="btn btn-ghost btn-sm" onClick={() => startTimer(t)} disabled={running}>{t} min</button>
                ))}
                {running && <button className="btn btn-danger btn-sm" onClick={stopTimer}>⏹ Stop</button>}
              </div>
              {totalTime > 0 && (
                <>
                  <div className={`timer-display ${timeLeft < 30 ? 'warning' : ''}`} style={{ fontSize: 36 }}>{fmt(timeLeft)}</div>
                  <div className="timer-track">
                    <div className="timer-fill" style={{ width: `${(timeLeft / totalTime) * 100}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Input Mode */}
            <div className="mode-switch">
              <button className={`mode-btn ${inputMode === 'write' ? 'active' : ''}`} onClick={() => setInputMode('write')}>⌨️ Write</button>
              <button className={`mode-btn ${inputMode === 'speak' ? 'active' : ''}`} onClick={() => setInputMode('speak')}>🎤 Speak</button>
            </div>

            {inputMode === 'write' ? (
              <textarea
                className="form-input form-textarea"
                style={{ minHeight: 180, fontSize: 15 }}
                placeholder="Write your response here. Take your time, express your thoughts clearly and in detail..."
                value={response}
                onChange={e => setResponse(e.target.value)}
              />
            ) : (
              <div style={{ padding: '12px 0 18px', textAlign: 'center' }}>
                <button
                  className={`btn ${listening ? 'btn-danger' : 'btn-ghost'}`}
                  onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startListen}
                  style={{ marginBottom: 14 }}
                >{listening ? '⏹ Stop Speaking' : '🎤 Start Speaking'}</button>
                {response && (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', fontSize: 14, lineHeight: 1.8, textAlign: 'left', color: 'var(--text2)' }}>
                    {response}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={getReview} disabled={reviewing || !response.trim()}>
                {reviewing ? '🔍 Analyzing...' : '🔍 Get AI Feedback'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setResponse(''); setReview(null); }}>Clear</button>
              <button className="btn btn-ghost" onClick={getTopic}>🔄 New Topic</button>
            </div>

            {review && (
              <div style={{ marginTop: 20 }}>
                <div className="score-grid">
                  {[
                    { l: 'Overall', v: review.overallScore },
                    { l: 'Fluency', v: review.fluencyScore },
                    { l: 'Vocabulary', v: review.vocabularyScore },
                    { l: 'Grammar', v: review.grammarScore },
                    { l: 'Relevance', v: review.relevanceScore },
                  ].map((s, i) => (
                    <div className="score-cell" key={i}>
                      <div className="score-val" style={{ color: s.v >= 8 ? 'var(--green)' : s.v >= 5 ? 'var(--accent)' : 'var(--rose)' }}>{s.v}</div>
                      <div className="score-lbl">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="fb-grid">
                  <div className="fb-box fb-strengths">
                    <div className="fb-label">💪 Strengths</div>
                    {(review.strengths || []).map((s, i) => <div key={i} className="fb-item">{s}</div>)}
                  </div>
                  <div className="fb-box fb-improve">
                    <div className="fb-label">📈 Improve</div>
                    {(review.improvements || []).map((s, i) => <div key={i} className="fb-item">{s}</div>)}
                  </div>
                </div>
                {review.exampleImprovement && (
                  <div style={{ fontStyle: 'italic', color: 'var(--green)', fontSize: 13.5, background: 'var(--green-dim)', padding: '10px 14px', borderRadius: 10, marginTop: 12, border: '1px solid rgba(34,211,165,0.15)' }}>
                    ✨ Example: {review.exampleImprovement}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      <div className="ad-banner"><span>📢 Advertisement</span></div>
    </div>
  );
}
