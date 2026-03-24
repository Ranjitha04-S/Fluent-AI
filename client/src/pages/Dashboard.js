import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const quickNavItems = [
  { path: '/reading', icon: '📖', title: 'Daily Reading', desc: 'AI articles & tongue twisters' },
  { path: '/vocabulary', icon: '💬', title: 'Vocabulary', desc: '5 new words every day' },
  { path: '/practice', icon: '🎯', title: 'Speaking & Writing', desc: 'Express yourself freely' },
  { path: '/grammar', icon: '📝', title: 'Grammar', desc: '20+ topics — quiz & learn' },
  { path: '/studio', icon: '🤖', title: 'AI Conversation', desc: 'Talk with AI, improve fluency' },
  { path: '/studio', icon: '🎙️', title: 'Recording Studio', desc: 'Record & analyze your speech' },
];

const motivations = [
  "Every sentence you speak today is one step closer to fluency. Start now!",
  "The best time to practice English was yesterday. The second best time is right now!",
  "Fluency is not a destination — it's a daily habit. You're building it today!",
  "Speak even if you make mistakes. Mistakes are proof that you are trying!",
  "One new word a day keeps confusion away. Let's learn something amazing today!",
  "Your English is getting stronger every single day — keep going, never stop!",
  "Great speakers weren't born fluent — they practiced every day, just like you!",
];

const tips = [
  { icon: '🗣️', tip: 'Speak out loud when reading — it trains your mouth muscles for English sounds.' },
  { icon: '📝', tip: "Write 3 sentences using today's vocabulary words to memorize them faster." },
  { icon: '👂', tip: 'Listen to English music or podcasts for 10 minutes daily — trains your ear naturally.' },
  { icon: '🔄', tip: 'Repeat new words 5 times in different sentences — this locks them in long-term memory.' },
];

export default function Dashboard() {
  const { user, updateGoals } = useAuth();
  const navigate = useNavigate();
  const goals = user?.goals || [];
  const doneCount = goals.filter(g => g.done).length;
  const motivation = motivations[new Date().getDay() % motivations.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const toggleGoal = async (idx) => {
    const updated = goals.map((g, i) => i === idx ? { ...g, done: !g.done } : g);
    await updateGoals(updated);
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>
              {greeting} 👋
            </div>
            <div className="welcome-title" style={{ fontSize: 24, marginBottom: 14 }}>
              {user?.name?.split(' ')[0]}, let's practice English today!
            </div>
            <div style={{
              background: 'rgba(124,106,245,0.1)', border: '1px solid rgba(124,106,245,0.2)',
              borderRadius: 12, padding: '14px 18px', fontSize: 14.5, color: 'var(--text)',
              lineHeight: 1.75, fontStyle: 'italic', maxWidth: 540, marginBottom: 16,
            }}>
              💬 "{motivation}"
            </div>
            <div className="welcome-streak">
              🔥 {doneCount}/{goals.length} daily goals completed
              {doneCount === goals.length && goals.length > 0 && (
                <span style={{ marginLeft: 8, background: 'rgba(245,166,35,0.2)', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>🏆 All Done!</span>
              )}
            </div>
          </div>
          {!user?.groqApiKey && (
            <div style={{ background: 'rgba(245,107,107,0.08)', border: '1px solid rgba(245,107,107,0.2)', borderRadius: 12, padding: '16px 18px', maxWidth: 230 }}>
              <div style={{ fontSize: 13, color: 'var(--rose)', fontWeight: 700, marginBottom: 6 }}>⚠️ Setup Required</div>
              <div style={{ fontSize: 12.5, color: 'var(--text2)', marginBottom: 12, lineHeight: 1.6 }}>Add your free Groq API key to unlock all AI features</div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/settings')}>⚙️ Go to Settings</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
        {/* Goals */}
        <div className="goals-card">
          <div className="card-hd" style={{ marginBottom: 4 }}>
            <div className="card-title">📋 Today's Goals</div>
            <span className="chip chip-green">{doneCount}/{goals.length}</span>
          </div>
          {goals.map((g, i) => (
            <div className="goal-item" key={i}>
              <div className={`goal-cb ${g.done ? 'done' : ''}`} onClick={() => toggleGoal(i)}>{g.done ? '✓' : ''}</div>
              <div className={`goal-text ${g.done ? 'done' : ''}`}>{g.text}</div>
            </div>
          ))}
        </div>

        {/* Daily Tips */}
        <div className="card">
          <div className="card-hd" style={{ marginBottom: 16 }}>
            <div className="card-title">💡 Daily English Tips</div>
            <span className="chip chip-accent">Today</span>
          </div>
          {tips.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{t.icon}</span>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{t.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav */}
      <div style={{ fontFamily: 'Lora,serif', fontSize: 17, marginBottom: 14 }}>⚡ Start Learning</div>
      <div className="quick-nav" style={{ marginBottom: 8 }}>
        {quickNavItems.map((item, i) => (
          <Link to={item.path} className="quick-nav-card" key={i}>
            <div className="qn-icon">{item.icon}</div>
            <div className="qn-title">{item.title}</div>
            <div className="qn-desc">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
