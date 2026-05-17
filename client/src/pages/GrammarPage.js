import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const grammarTopics = [
  { category: 'Tenses', topics: ['Simple Present Tense', 'Simple Past Tense', 'Simple Future Tense', 'Present Continuous', 'Past Continuous', 'Future Continuous', 'Present Perfect', 'Past Perfect', 'Future Perfect'] },
  { category: 'Sentence Structure', topics: ['Active & Passive Voice', 'Direct & Indirect Speech', 'Conditionals (If clauses)', 'Relative Clauses', 'Question Formation', 'Negative Sentences'] },
  { category: 'Parts of Speech', topics: ['Articles (a/an/the)', 'Prepositions', 'Modal Verbs (can/must/should)', 'Gerunds vs Infinitives', 'Adjectives & Adverbs', 'Conjunctions'] },
  { category: 'Advanced', topics: ['Phrasal Verbs', 'Countable & Uncountable Nouns', 'Comparatives & Superlatives', 'Subjunctive Mood', 'Ellipsis & Substitution', 'Collocations'] },
];

export default function GrammarPage() {
  const { updateStat } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState('');
  const [tab, setTab] = useState('quiz');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState('');
  const [score, setScore] = useState(0);

  async function startQuiz() {
    if (!selectedTopic) return;
    setLoading(true); setQuestions([]); setAnswers({}); setSubmitted(false);
    try {
      const r = await api.post('/ai/grammar-quiz', { topic: selectedTopic });
      setQuestions(r.data.questions || []);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  async function loadLesson() {
    if (!selectedTopic) return;
    setLoading(true); setLesson('');
    try {
      const r = await api.post('/ai/grammar-lesson', { topic: selectedTopic });
      setLesson(r.data.lesson);
    } catch (e) { alert(e.response?.data?.error || e.message); }
    setLoading(false);
  }

  function submitQuiz() {
    let correct = 0;
    questions.forEach(q => {
      if ((answers[q.id] || '').toLowerCase().trim() === q.answer.toLowerCase().trim()) correct++;
    });
    setScore(correct); setSubmitted(true);
    updateStat('quizzes');
  }

  function renderLesson(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
      if (line.trim() === '') return <br key={i} />;
      const html = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div>
      <div className="card card-glow">
        <div className="card-hd">
          <div className="card-title">📝 Grammar Practice</div>
          <span className="chip chip-primary">20+ Topics</span>
        </div>

        {/* Topic categories */}
        {grammarTopics.map((cat) => (
          <div key={cat.category} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{cat.category}</div>
            <div className="grammar-topics-grid">
              {cat.topics.map(t => (
                <button key={t} className={`g-topic-btn ${selectedTopic === t ? 'active' : ''}`} onClick={() => setSelectedTopic(t)}>{t}</button>
              ))}
            </div>
          </div>
        ))}

        <div className="tab-bar">
          {[['quiz', '📝 Take Quiz'], ['learn', '📚 Learn Lesson']].map(([k, l]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {tab === 'quiz' ? (
            <button className="btn btn-primary" onClick={startQuiz} disabled={loading || !selectedTopic}>
              {loading ? '✨ Generating...' : '🎯 Start Quiz'}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={loadLesson} disabled={loading || !selectedTopic}>
              {loading ? '📖 Loading...' : '📖 Load Lesson'}
            </button>
          )}
          {!selectedTopic && <div style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>← Select a topic first</div>}
        </div>
      </div>

      {loading && (
        <div className="card">
          {[1, 2, 3, 4].map(i => <div key={i} className="skel skel-block" style={{ marginBottom: 10 }} />)}
        </div>
      )}

      {/* QUIZ */}
      {tab === 'quiz' && questions.length > 0 && (
        <div>
          {submitted && (
            <div className="quiz-result">
              <div className="qr-score">{score}/{questions.length}</div>
              <div className="qr-msg">
                {pct >= 90 ? '🏆 Outstanding! You\'ve mastered this topic!' :
                  pct >= 70 ? '🌟 Great job! A bit more practice and you\'ll be perfect.' :
                    pct >= 50 ? '👍 Good effort! Review the explanations below.' :
                      '💪 Keep going! Read the lesson and try again.'}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={startQuiz}>🔄 Retry Quiz</button>
                <button className="btn btn-ghost" onClick={() => { setTab('learn'); loadLesson(); }}>📖 Study Lesson</button>
              </div>
            </div>
          )}

          {questions.map((q, qi) => {
            const ua = answers[q.id] || '';
            const isC = submitted && ua.toLowerCase().trim() === q.answer.toLowerCase().trim();
            const isW = submitted && !isC;
            return (
              <div key={q.id} className={`q-card ${submitted ? (isC ? 'correct' : 'wrong') : ''}`}>
                <div className="q-num">Question {qi + 1} of {questions.length}</div>
                <div className="q-text">{q.question}</div>
                {q.type === 'mcq' ? (
                  <div className="opts">
                    {(q.options || []).map((opt, oi) => {
                      let cls = 'opt-btn';
                      if (submitted) {
                        if (opt === q.answer) cls += ' correct';
                        else if (opt === ua && opt !== q.answer) cls += ' wrong';
                      } else if (ua === opt) cls += ' correct';
                      return (
                        <button key={oi} className={cls} disabled={submitted} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}>
                          <span style={{ fontWeight: 700, marginRight: 8, opacity: 0.5 }}>{['A', 'B', 'C', 'D'][oi]}.</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    className="fill-input"
                    placeholder="Type your answer..."
                    value={ua} disabled={submitted}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    style={submitted ? { borderColor: isC ? 'rgba(34,211,165,0.5)' : 'rgba(245,107,107,0.5)' } : {}}
                  />
                )}
                {submitted && (
                  <div className="explanation">
                    <strong>{isC ? '✅ Correct! ' : `❌ Answer: "${q.answer}". `}</strong>{q.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button className="btn btn-primary" onClick={submitQuiz} style={{ marginBottom: 16 }}>✅ Submit Quiz</button>
          )}
        </div>
      )}

      {/* LESSON */}
      {tab === 'learn' && lesson && (
        <div className="card">
          <div className="card-hd">
            <div className="card-title">📚 {selectedTopic}</div>
            <span className="chip chip-primary">Lesson</span>
          </div>
          <div className="lesson-body">{renderLesson(lesson)}</div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => { setTab('quiz'); startQuiz(); }}>📝 Take Quiz Now</button>
            <button className="btn btn-ghost" onClick={loadLesson}>🔄 Refresh Lesson</button>
          </div>
        </div>
      )}

      <div className="ad-banner"><span>📢 Advertisement</span></div>
    </div>
  );
}
