const router = require('express').Router();
const auth = require('../middleware/auth');

async function callGroq(apiKey, prompt, maxTokens = 1500) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.8
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
}

// All AI routes require auth
router.use(auth);

// Reading - generate article
router.post('/reading', async (req, res) => {
  try {
    const { level, customPrompt } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved. Please add your Groq API key in settings.' });

    const levelMap = { beginner: '~400 words, simple vocabulary, short sentences', intermediate: '~600 words, moderate vocabulary, varied sentences', advanced: '~800 words, rich vocabulary, complex ideas' };
    const prompt = customPrompt
      ? `Write an engaging English reading article about: "${customPrompt}". Length: ${levelMap[level] || levelMap.intermediate}. Start with a catchy title on line 1. Then write the article with paragraphs separated by blank lines. Make it educational and engaging.`
      : `Write an engaging English reading article for ${level || 'intermediate'} learners. ${levelMap[level] || levelMap.intermediate}. Pick an interesting topic. Start with a catchy title on line 1, then article with paragraphs separated by blank lines.`;

    const text = await callGroq(apiKey, prompt, 1500);
    res.json({ content: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tongue twister
router.post('/tongue-twister', async (req, res) => {
  try {
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Generate a fun and challenging English tongue twister. Include: 1) The tongue twister text, 2) Which sounds it practices (like "s", "sh", "r", "th"), 3) A tip for pronouncing it correctly, 4) A slow version broken into syllables. Return JSON: {"twister":"...","sounds":["s","sh"],"tip":"...","slowVersion":"..."}. ONLY JSON.`, 400);
    const clean = text.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(clean));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Vocabulary generate
router.post('/vocabulary', async (req, res) => {
  try {
    const { customPrompt } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const topic = customPrompt ? `related to "${customPrompt}"` : 'useful for everyday English conversation';
    const text = await callGroq(apiKey, `Generate exactly 5 English vocabulary words ${topic}. For each word return: word, phonetic (IPA), partOfSpeech, definition, examples (array of 2 sentences using the word), collocations (array of 3 common phrases), usage (formal/informal/both and when to use), memoryTip. Return ONLY a valid JSON array with those exact fields. No extra text.`, 2000);
    const clean = text.replace(/```json|```/g, '').trim();
    res.json({ words: JSON.parse(clean) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Vocabulary sentence review
router.post('/vocab-review', async (req, res) => {
  try {
    const { word, sentence } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Review this English sentence using the word "${word}": "${sentence}". Return ONLY valid JSON: {"correct":true/false,"score":1-10,"feedback":"brief encouraging feedback","improved":"better version or same if already perfect"}`, 400);
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Speaking topic
router.post('/topic', async (req, res) => {
  try {
    const { topicType, customPrompt } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const typeMap = { opinion: 'opinion or debate', story: 'creative storytelling', description: 'describing a place, person, or object', problem: 'problem-solving scenario', experience: 'personal experience sharing', random: 'any interesting and thought-provoking' };
    const prompt = customPrompt
      ? `Create an English speaking/writing practice prompt about: "${customPrompt}". Return ONLY JSON: {"topic":"the exact prompt","description":"brief context","hints":["hint1","hint2","hint3"],"vocabularyHelp":[{"word":"w1","meaning":"m1"},{"word":"w2","meaning":"m2"},{"word":"w3","meaning":"m3"}]}`
      : `Generate a ${typeMap[topicType] || 'random'} English speaking/writing prompt. Return ONLY JSON: {"topic":"the prompt","description":"context","hints":["hint1","hint2","hint3"],"vocabularyHelp":[{"word":"w1","meaning":"m1"},{"word":"w2","meaning":"m2"},{"word":"w3","meaning":"m3"}]}`;
    const text = await callGroq(apiKey, prompt, 400);
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Speaking review
router.post('/speaking-review', async (req, res) => {
  try {
    const { topic, response } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Topic: "${topic}"\nUser response: "${response}"\nReview this English response. Return ONLY JSON: {"overallScore":1-10,"fluencyScore":1-10,"vocabularyScore":1-10,"grammarScore":1-10,"relevanceScore":1-10,"strengths":["s1","s2","s3"],"improvements":["i1","i2","i3"],"exampleImprovement":"improved sentence"}`, 800);
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Grammar quiz
router.post('/grammar-quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Create 10 English grammar quiz questions about "${topic}". Mix of MCQ and fill-in-blank. Return ONLY valid JSON array: [{"id":"q1","type":"mcq","question":"...","options":["a","b","c","d"],"answer":"exact correct option text","explanation":"why correct"},{"id":"q2","type":"fill","question":"Fill: He ___ (go) to school","options":null,"answer":"goes","explanation":"..."}]. Make questions practical and real-world.`, 2500);
    res.json({ questions: JSON.parse(text.replace(/```json|```/g, '').trim()) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Grammar lesson
router.post('/grammar-lesson', async (req, res) => {
  try {
    const { topic } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Teach English grammar topic: "${topic}". Structure your response with these exact sections:\n## What is it?\n## When to use it\n## Structure / Formula\n## Examples (5 real-world examples)\n## Common Mistakes\n## Quick Tips\n\nBe friendly, clear, and encouraging. Use simple language that any learner can understand.`, 1800);
    res.json({ lesson: text });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Conversation AI reply
router.post('/conversation', async (req, res) => {
  try {
    const { scenario, history, userMessage } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });

    const messages = [
      { role: 'system', content: `You are having a conversation practice session. Scenario: ${scenario}. Keep responses conversational (2-4 sentences max). Correct major grammar mistakes gently at the end of your reply in brackets like [Note: "I goed" should be "I went"]. Stay in character.` },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const res2 = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: 300, temperature: 0.85 })
    });
    const data = await res2.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ reply: data.choices[0].message.content });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Speech analysis
router.post('/speech-analysis', async (req, res) => {
  try {
    const { transcript } = req.body;
    const apiKey = req.user.groqApiKey;
    if (!apiKey) return res.status(400).json({ error: 'No API key saved.' });
    const text = await callGroq(apiKey, `Review this spoken English: "${transcript}". Return ONLY JSON: {"score":1-10,"grammarNote":"...","vocabularyNote":"...","tips":["tip1","tip2"],"overallFeedback":"encouraging comment"}`, 500);
    res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
