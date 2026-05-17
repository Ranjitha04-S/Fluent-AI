import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '📖', title: 'AI Reading Articles', desc: 'Generate custom articles on any topic — education, politics, science, or random. 3 difficulty levels.' },
  { icon: '👅', title: 'Tongue Twister Practice', desc: 'Improve pronunciation with AI-generated tongue twisters. Perfect for accent reduction.' },
  { icon: '💬', title: 'Smart Vocabulary', desc: 'Learn 5 words daily on any theme. Practice sentences with voice and get instant AI feedback.' },
  { icon: '🎯', title: 'Speaking & Writing', desc: 'Custom or random topics with timer. Write or speak your response and get detailed AI scoring.' },
  { icon: '📝', title: 'Grammar Mastery', desc: '20+ grammar topics with AI quizzes and structured lessons. Clear explanations with examples.' },
  { icon: '🤖', title: 'AI Conversation Partner', desc: 'Practice unlimited conversations with AI in any scenario. Get grammar corrections in real-time.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon" style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#7c6af5,#5b8af5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
          <span style={{ fontFamily: 'Lora,serif', fontSize: 18, letterSpacing: -0.5 }}>FluentAI</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-badge">✨ Powered by Groq + Llama 3.3 — 100% Free</div>
          <h1 className="hero-title">
            Master English with<br /><span>AI-Powered Learning</span>
          </h1>
          <p className="hero-sub">
            Reading, Vocabulary, Grammar, Speaking Practice & AI Conversation — all in one platform. Completely free with Groq API.
          </p>
          <div className="hero-btns">
            <Link to="/register" className="btn btn-primary btn-lg">🚀 Start Learning Free</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Sign In</Link>
          </div>
          <div className="hero-stats">
            {[
              { num: '6+', lbl: 'Learning Modules' },
              { num: '20+', lbl: 'Grammar Topics' },
              { num: '∞', lbl: 'AI Conversations' },
              { num: '100%', lbl: 'Free Forever' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="hero-stat-num">{s.num}</div>
                <div className="hero-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px' }}>
        <div className="ad-banner">📢 Advertisement — Google AdSense Banner</div>
      </div>

      <section className="features-section">
        <h2 className="section-title">Everything You Need to <span style={{ background: 'linear-gradient(135deg,#7c6af5,#22d3a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Speak Fluently</span></h2>
        <p className="section-sub">Six powerful modules powered by AI — completely free, no credit card required.</p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'linear-gradient(135deg,rgba(124,106,245,0.1),rgba(34,211,165,0.06))', borderTop: '1px solid rgba(124,106,245,0.15)', borderBottom: '1px solid rgba(124,106,245,0.15)', padding: '60px 40px', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>Ready to Speak Confidently?</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 28, fontSize: 15 }}>Join thousands of learners improving their English every day.</p>
        <Link to="/register" className="btn btn-primary btn-lg">🎓 Create Free Account</Link>
      </section>

      <footer className="landing-footer">
        <p>© 2025 FluentAI — AI-Powered English Learning Platform. All rights reserved.</p>
        <p style={{ marginTop: 6 }}>Powered by Groq API (Llama 3.3 70B) — Free for everyone.</p>
      </footer>
    </div>
  );
}
