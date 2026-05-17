import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const KANBAN_COLUMNS = [
  { id: 'todo', label: '📋 To Learn', color: 'var(--blue)' },
  { id: 'inprogress', label: '🔥 In Progress', color: 'var(--accent)' },
  { id: 'done', label: '✅ Mastered', color: 'var(--green)' },
];

const DEFAULT_CARDS = [
  { id: 1, col: 'todo', text: 'Present Perfect Tense', tag: 'Grammar' },
  { id: 2, col: 'todo', text: 'Phrasal Verbs', tag: 'Grammar' },
  { id: 3, col: 'todo', text: 'Daily Routines Vocabulary', tag: 'Vocabulary' },
  { id: 4, col: 'inprogress', text: 'Conditionals (If clauses)', tag: 'Grammar' },
  { id: 5, col: 'inprogress', text: 'Speaking Fluency', tag: 'Practice' },
  { id: 6, col: 'done', text: 'Simple Present Tense', tag: 'Grammar' },
  { id: 7, col: 'done', text: 'Basic Vocabulary', tag: 'Vocabulary' },
];

function KanbanBoard() {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [dragging, setDragging] = useState(null);
  const [newText, setNewText] = useState('');
  const [newTag, setNewTag] = useState('Grammar');
  const [addingTo, setAddingTo] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  function handleDragStart(card) { setDragging(card); }
  function handleDrop(colId) {
    if (!dragging) return;
    setCards(c => c.map(card => card.id === dragging.id ? { ...card, col: colId } : card));
    setDragging(null); setDragOver(null);
  }
  function addCard(colId) {
    if (!newText.trim()) return;
    setCards(c => [...c, { id: Date.now(), col: colId, text: newText.trim(), tag: newTag }]);
    setNewText(''); setAddingTo(null);
  }
  function deleteCard(id) { setCards(c => c.filter(card => card.id !== id)); }

  const tagColors = {
    Grammar: 'var(--primary-light)', Vocabulary: 'var(--accent)',
    Practice: 'var(--green)', Speaking: 'var(--blue)', Other: 'var(--muted)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
      {KANBAN_COLUMNS.map(col => {
        const colCards = cards.filter(c => c.col === col.id);
        return (
          <div
            key={col.id}
            onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
            onDrop={() => handleDrop(col.id)}
            onDragLeave={() => setDragOver(null)}
            style={{
              background: dragOver === col.id ? 'rgba(124,106,245,0.06)' : 'var(--bg)',
              border: `1px solid ${dragOver === col.id ? 'rgba(124,106,245,0.3)' : 'var(--border)'}`,
              borderRadius: 14, padding: 14, minHeight: 200,
              transition: 'all 0.15s',
            }}
          >
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</div>
              <span style={{ background: 'var(--card2)', color: 'var(--muted)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{colCards.length}</span>
            </div>

            {/* Cards */}
            {colCards.map(card => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(card)}
                style={{
                  background: 'var(--card)', border: '1px solid var(--border2)',
                  borderRadius: 10, padding: '10px 12px', marginBottom: 8,
                  cursor: 'grab', transition: 'all 0.15s', position: 'relative',
                  opacity: dragging?.id === card.id ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 6, paddingRight: 20 }}>{card.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tagColors[card.tag] || 'var(--muted)', background: 'var(--card2)', padding: '2px 8px', borderRadius: 10 }}>{card.tag}</span>
                  <button
                    onClick={() => deleteCard(card.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, padding: '0 2px', position: 'absolute', top: 8, right: 8 }}
                  >✕</button>
                </div>
              </div>
            ))}

            {/* Add card */}
            {addingTo === col.id ? (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 10, padding: 10 }}>
                <input
                  className="form-input"
                  style={{ marginBottom: 8, fontSize: 13, padding: '8px 10px' }}
                  placeholder="e.g. Past Perfect Tense..."
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCard(col.id)}
                  autoFocus
                />
                <select
                  className="form-input"
                  style={{ marginBottom: 8, fontSize: 12, padding: '6px 10px' }}
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                >
                  {['Grammar', 'Vocabulary', 'Practice', 'Speaking', 'Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => addCard(col.id)}>Add</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setAddingTo(null); setNewText(''); }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', marginTop: 4 }}
                onClick={() => setAddingTo(col.id)}
              >+ Add Topic</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SettingsPage() {
  const { user, saveApiKey, logout } = useAuth();
  const [apiKey, setApiKey] = useState(user?.groqApiKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);

  async function testAndSave() {
    if (!apiKey.trim() || !apiKey.startsWith('gsk_')) {
      setTestResult({ ok: false, msg: 'Groq API keys start with "gsk_..." — please re-copy from console.groq.com' });
      return;
    }
    setTesting(true); setTestResult(null);
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: 'Say ok' }], max_tokens: 5 })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error.message);
      await saveApiKey(apiKey.trim());
      setSaved(true);
      setTestResult({ ok: true, msg: '✅ API key verified and saved! All AI features are now unlocked.' });
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      const msg = e.message || '';
      setTestResult({ ok: false, msg: msg.includes('Invalid API Key') ? '❌ Invalid API key. Re-copy from console.groq.com/keys' : '❌ ' + msg });
    }
    setTesting(false);
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      {/* Profile */}
      <div className="settings-section">
        <div className="settings-title">👤 Profile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--primary),var(--blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, flexShrink: 0, overflow: 'hidden',
          }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="settings-section">
        <div className="settings-title">🔑 Groq API Key</div>
        <div style={{ background: 'rgba(34,211,165,0.06)', border: '1px solid rgba(34,211,165,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 14, marginBottom: 4 }}>Why do I need this?</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            FluentAI uses Groq's free AI (Llama 3.3 70B) to generate content. Your key is stored securely and never shared.
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">How to get your FREE Groq API Key:</label>
          <ol style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2.2, paddingLeft: 20, marginBottom: 14 }}>
            <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>console.groq.com/keys</a></li>
            <li>Sign in with Google — completely free, no credit card</li>
            <li>Click <strong style={{ color: 'var(--text)' }}>"Create API Key"</strong></li>
            <li>Copy the key (starts with <code style={{ background: 'var(--card2)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>gsk_...</code>)</li>
          </ol>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            type="password"
            placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="btn btn-primary" onClick={testAndSave} disabled={testing || !apiKey.trim()}>
            {testing ? '⏳ Testing...' : saved ? '✅ Saved!' : '💾 Test & Save'}
          </button>
        </div>
        {testResult && (
          <div style={{
            marginTop: 12,
            background: testResult.ok ? 'var(--green-dim)' : 'var(--rose-dim)',
            border: `1px solid ${testResult.ok ? 'rgba(34,211,165,0.2)' : 'rgba(245,107,107,0.2)'}`,
            color: testResult.ok ? 'var(--green)' : 'var(--rose)',
            borderRadius: 10, padding: '10px 16px', fontSize: 13.5,
          }}>
            {testResult.msg}
          </div>
        )}
        {user?.groqApiKey && (
          <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--muted)' }}>
            ✅ Key saved — ends in <code style={{ background: 'var(--card2)', padding: '1px 6px', borderRadius: 4 }}>...{user.groqApiKey.slice(-6)}</code>
          </div>
        )}
      </div>

      {/* Kanban Learning Board */}
      <div className="settings-section">
        <div className="settings-title">📌 Learning Board</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Track your English learning topics. Drag cards between columns to update progress. Click <strong style={{ color: 'var(--text)' }}>+ Add Topic</strong> to add new topics.
        </div>
        <KanbanBoard />
      </div>

      {/* Account */}
      <div className="settings-section">
        <div className="settings-title">⚠️ Account</div>
        <button className="btn btn-danger" onClick={() => { if (window.confirm('Are you sure you want to logout?')) logout(); }}>
          🚪 Logout from FluentAI
        </button>
      </div>
    </div>
  );
}
