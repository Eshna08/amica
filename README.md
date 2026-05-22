<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AMICA — Mental Health AI</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --teal: #1D9E75; --teal-l: #E1F5EE; --teal-d: #085041;
    --coral: #D85A30; --coral-l: #FAECE7; --coral-d: #4A1B0C;
    --purple: #7F77DD; --purple-l: #EEEDFE; --purple-d: #26215C;
    --amber: #BA7517; --amber-l: #FAEEDA; --amber-d: #412402;
    --blue: #378ADD; --blue-l: #E6F1FB; --blue-d: #042C53;
    --ink: #111; --muted: #666; --surface: #f5f5f3; --card: #fff;
    --border: rgba(0,0,0,0.1); --r: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --teal-l: #04342C; --teal-d: #9FE1CB;
      --coral-l: #4A1B0C; --coral-d: #F0997B;
      --purple-l: #26215C; --purple-d: #AFA9EC;
      --amber-l: #412402; --amber-d: #FAC775;
      --blue-l: #042C53; --blue-d: #85B7EB;
      --ink: #f0f0ee; --muted: #999; --surface: #1a1a18;
      --card: #222220; --border: rgba(255,255,255,0.1);
    }
  }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--card); color: var(--ink); }
  .hero { padding: 3rem 2rem 2rem; border-bottom: 0.5px solid var(--border); }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--teal-l); color: var(--teal-d);
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px; margin-bottom: 1.25rem;
  }
  .hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
  .hero h1 { font-family: 'DM Serif Display', serif; font-size: 2.4rem; line-height: 1.15; color: var(--ink); margin-bottom: .75rem; }
  .hero h1 em { font-style: italic; color: var(--teal); }
  .hero-sub { font-size: 15px; color: var(--muted); line-height: 1.65; max-width: 540px; margin-bottom: 1.5rem; }
  .hero-links { display: flex; gap: 10px; flex-wrap: wrap; }
  .link-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 500; padding: 7px 14px; border-radius: 20px;
    border: 0.5px solid var(--border); background: var(--card); color: var(--ink);
    cursor: pointer; transition: all .15s; text-decoration: none;
  }
  .link-pill:hover { background: var(--surface); }
  .link-pill.primary { background: var(--teal); color: #fff; border-color: var(--teal); }
  .link-pill.primary:hover { opacity: .88; }
  .section { padding: 2rem; border-bottom: 0.5px solid var(--border); }
  .section:last-of-type { border-bottom: none; }
  .section-label { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 1.25rem; }
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 10px; }
  .feature-card { background: var(--surface); border-radius: var(--r); padding: 1rem; border: 0.5px solid var(--border); transition: border-color .2s; }
  .feature-card:hover { border-color: var(--teal); }
  .feat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; font-size: 16px; }
  .feat-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 4px; }
  .feat-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
  .arch-container { background: var(--surface); border-radius: var(--r); border: 0.5px solid var(--border); padding: 1.5rem; }
  .arch-flow { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .arch-node { display: flex; flex-direction: column; align-items: center; padding: .75rem 1rem; background: var(--card); border: 0.5px solid var(--border); border-radius: 8px; min-width: 100px; text-align: center; transition: all .2s; }
  .arch-node:hover { border-color: var(--teal); }
  .arch-node-icon { font-size: 22px; margin-bottom: 6px; color: var(--muted); }
  .arch-node-label { font-size: 12px; font-weight: 500; color: var(--ink); }
  .arch-node-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .arch-arrow { padding: 0 4px; color: var(--muted); font-size: 18px; display: flex; align-items: center; }
  .stack-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: 8px; }
  .stack-item { background: var(--surface); border: 0.5px solid var(--border); border-radius: 8px; padding: 10px 12px; }
  .stack-cat { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .stack-tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
  .tag-teal { background: var(--teal-l); color: var(--teal-d); }
  .tag-coral { background: var(--coral-l); color: var(--coral-d); }
  .tag-purple { background: var(--purple-l); color: var(--purple-d); }
  .tag-amber { background: var(--amber-l); color: var(--amber-d); }
  .tag-blue { background: var(--blue-l); color: var(--blue-d); }
  .modules-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 10px; }
  .module-card { border: 0.5px solid var(--border); border-radius: var(--r); padding: 1.25rem; background: var(--card); transition: all .2s; position: relative; overflow: hidden; }
  .module-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; opacity:0; transition: opacity .2s; }
  .module-card.ml::before { background: var(--teal); }
  .module-card.mood::before { background: var(--purple); }
  .module-card.rag::before { background: var(--coral); }
  .module-card.admin::before { background: var(--amber); }
  .module-card:hover::before { opacity: 1; }
  .module-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .module-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .module-title { font-size: 14px; font-weight: 500; color: var(--ink); }
  .module-list { list-style: none; display: flex; flex-direction: column; gap: 5px; }
  .module-list li { font-size: 12px; color: var(--muted); line-height: 1.5; display: flex; align-items: flex-start; gap: 6px; }
  .module-list li::before { content:''; width:4px; height:4px; border-radius:50%; margin-top:6px; flex-shrink:0; }
  .ml .module-list li::before { background: var(--teal); }
  .mood .module-list li::before { background: var(--purple); }
  .rag .module-list li::before { background: var(--coral); }
  .admin .module-list li::before { background: var(--amber); }
  .code-block { background: var(--surface); border: 0.5px solid var(--border); border-radius: 8px; padding: 1rem 1.25rem; margin-top: 10px; }
  .code-block pre { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); line-height: 1.7; white-space: pre-wrap; }
  .code-block .cmd { color: var(--teal); }
  .install-tabs { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .tab-btn { font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 20px; border: 0.5px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; transition: all .15s; }
  .tab-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }
  .tab-pane { display: none; }
  .tab-pane.active { display: block; }
  .future-list { display: flex; flex-direction: column; gap: 8px; }
  .future-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface); border-radius: 8px; border: 0.5px solid var(--border); font-size: 13px; color: var(--ink); }
  .future-item i { color: var(--muted); font-size: 18px; }
  .disclaimer { margin: 2rem; background: var(--amber-l); border: 0.5px solid #FAC775; border-radius: var(--r); padding: 1rem 1.25rem; display: flex; gap: 10px; align-items: flex-start; }
  .disclaimer i { color: var(--amber); font-size: 18px; margin-top: 1px; flex-shrink: 0; }
  .disclaimer p { font-size: 13px; color: var(--amber-d); line-height: 1.6; }
</style>
</head>
<body>

<div class="hero">
  <div class="hero-badge"><span class="dot"></span>Mental Health &middot; AI-Powered &middot; Open Source</div>
  <h1>AMICA &mdash; <em>Compassionate</em><br>Mental Health AI</h1>
  <p class="hero-sub">A scalable, safety-focused platform using Machine Learning and Generative AI to detect risk, provide empathetic support, and track emotional well-being.</p>
  <div class="hero-links">
    <a class="link-pill primary" href="https://your-vercel-link.vercel.app" target="_blank"><i class="ti ti-player-play"></i> Live Demo</a>
    <a class="link-pill" href="https://your-render-link.onrender.com" target="_blank"><i class="ti ti-server"></i> Backend API</a>
    <a class="link-pill" href="https://github.com/your-username/amica" target="_blank"><i class="ti ti-brand-github"></i> GitHub</a>
  </div>
</div>

<div class="section">
  <div class="section-label">Core Features</div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--teal-l)"><i class="ti ti-shield-check" style="color:var(--teal)"></i></div>
      <div class="feat-title">Suicide Risk Detection</div>
      <div class="feat-desc">TF-IDF + Logistic Regression with keyword-based self-harm screening</div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--purple-l)"><i class="ti ti-message-circle" style="color:var(--purple)"></i></div>
      <div class="feat-title">AI Conversational Support</div>
      <div class="feat-desc">RAG-based empathetic responses powered by Grok</div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--coral-l)"><i class="ti ti-mood-smile" style="color:var(--coral)"></i></div>
      <div class="feat-title">Mood Tracking</div>
      <div class="feat-desc">Daily logging, sentiment analysis, and emotional trend visualization</div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--amber-l)"><i class="ti ti-notebook" style="color:var(--amber)"></i></div>
      <div class="feat-title">Private Journaling</div>
      <div class="feat-desc">Secure personal journal with privacy-focused architecture</div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--blue-l)"><i class="ti ti-layout-dashboard" style="color:var(--blue)"></i></div>
      <div class="feat-title">Admin Dashboard</div>
      <div class="feat-desc">Review flagged content, escalate cases, and view analytics</div>
    </div>
    <div class="feature-card">
      <div class="feat-icon" style="background:var(--teal-l)"><i class="ti ti-lock" style="color:var(--teal)"></i></div>
      <div class="feat-title">JWT Auth + Audit Logs</div>
      <div class="feat-desc">Secure authentication and comprehensive audit logging</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-label">System Architecture</div>
  <div class="arch-container">
    <div class="arch-flow">
      <div class="arch-node">
        <div class="arch-node-icon"><i class="ti ti-devices"></i></div>
        <div class="arch-node-label">Frontend</div>
        <div class="arch-node-sub">React + MUI</div>
      </div>
      <div class="arch-arrow"><i class="ti ti-arrow-right"></i></div>
      <div class="arch-node" style="border-color:var(--teal)">
        <div class="arch-node-icon"><i class="ti ti-bolt" style="color:var(--teal)"></i></div>
        <div class="arch-node-label">FastAPI</div>
        <div class="arch-node-sub">Python Backend</div>
      </div>
      <div class="arch-arrow"><i class="ti ti-arrow-right"></i></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="arch-node" style="min-width:110px">
          <div class="arch-node-icon"><i class="ti ti-brain" style="color:var(--purple)"></i></div>
          <div class="arch-node-label">ML Model</div>
          <div class="arch-node-sub">TF-IDF + LR</div>
        </div>
        <div class="arch-node" style="min-width:110px">
          <div class="arch-node-icon"><i class="ti ti-robot" style="color:var(--coral)"></i></div>
          <div class="arch-node-label">RAG + Grok</div>
          <div class="arch-node-sub">xAI API</div>
        </div>
      </div>
      <div class="arch-arrow"><i class="ti ti-arrow-right"></i></div>
      <div class="arch-node">
        <div class="arch-node-icon"><i class="ti ti-database"></i></div>
        <div class="arch-node-label">Database</div>
        <div class="arch-node-sub">SQLite / PG</div>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-label">Tech Stack</div>
  <div class="stack-grid">
    <div class="stack-item">
      <div class="stack-cat">Frontend</div>
      <div class="stack-tags"><span class="tag tag-blue">React</span><span class="tag tag-blue">Material UI</span></div>
    </div>
    <div class="stack-item">
      <div class="stack-cat">Backend</div>
      <div class="stack-tags"><span class="tag tag-teal">FastAPI</span><span class="tag tag-teal">Python</span><span class="tag tag-teal">JWT</span></div>
    </div>
    <div class="stack-item">
      <div class="stack-cat">Machine Learning</div>
      <div class="stack-tags"><span class="tag tag-purple">Scikit-learn</span><span class="tag tag-purple">TF-IDF</span><span class="tag tag-purple">Logistic Reg.</span></div>
    </div>
    <div class="stack-item">
      <div class="stack-cat">AI Models</div>
      <div class="stack-tags"><span class="tag tag-coral">Grok</span><span class="tag tag-coral">xAI API</span><span class="tag tag-coral">GitHub Models</span></div>
    </div>
    <div class="stack-item">
      <div class="stack-cat">Database</div>
      <div class="stack-tags"><span class="tag tag-amber">SQLite</span><span class="tag tag-amber">PostgreSQL</span></div>
    </div>
    <div class="stack-item">
      <div class="stack-cat">Deployment</div>
      <div class="stack-tags"><span class="tag tag-teal">Vercel</span><span class="tag tag-teal">Render</span></div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-label">Key Modules</div>
  <div class="modules-grid">
    <div class="module-card ml">
      <div class="module-head">
        <div class="module-icon" style="background:var(--teal-l)"><i class="ti ti-cpu" style="color:var(--teal)"></i></div>
        <div class="module-title">ML Classification Pipeline</div>
      </div>
      <ul class="module-list">
        <li>Text preprocessing and tokenization</li>
        <li>TF-IDF feature extraction</li>
        <li>Logistic Regression classifier</li>
        <li>Risk prediction and keyword matching</li>
      </ul>
    </div>
    <div class="module-card mood">
      <div class="module-head">
        <div class="module-icon" style="background:var(--purple-l)"><i class="ti ti-chart-line" style="color:var(--purple)"></i></div>
        <div class="module-title">Mood &amp; Journal Tracking</div>
      </div>
      <ul class="module-list">
        <li>Daily mood logging</li>
        <li>Personal journal entries</li>
        <li>Sentiment analysis</li>
        <li>Emotional trend visualization</li>
      </ul>
    </div>
    <div class="module-card rag">
      <div class="module-head">
        <div class="module-icon" style="background:var(--coral-l)"><i class="ti ti-books" style="color:var(--coral)"></i></div>
        <div class="module-title">RAG Pipeline + Grok</div>
      </div>
      <ul class="module-list">
        <li>Context-aware retrieval system</li>
        <li>Trusted mental health resources</li>
        <li>Grok-powered empathetic responses</li>
      </ul>
    </div>
    <div class="module-card admin">
      <div class="module-head">
        <div class="module-icon" style="background:var(--amber-l)"><i class="ti ti-shield" style="color:var(--amber)"></i></div>
        <div class="module-title">Admin Dashboard</div>
      </div>
      <ul class="module-list">
        <li>Review flagged conversations</li>
        <li>Escalate critical cases</li>
        <li>Analytics and audit logs</li>
      </ul>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-label">Installation</div>
  <div class="install-tabs">
    <button class="tab-btn active" onclick="showTab('clone',this)">Clone</button>
    <button class="tab-btn" onclick="showTab('backend',this)">Backend</button>
    <button class="tab-btn" onclick="showTab('frontend',this)">Frontend</button>
    <button class="tab-btn" onclick="showTab('deploy',this)">Deploy</button>
  </div>
  <div id="tab-clone" class="tab-pane active">
    <div class="code-block"><pre><span class="cmd">$</span> git clone https://github.com/your-username/amica.git
<span class="cmd">$</span> cd amica</pre></div>
  </div>
  <div id="tab-backend" class="tab-pane">
    <div class="code-block"><pre><span class="cmd">$</span> cd backend
<span class="cmd">$</span> pip install -r requirements.txt
<span class="cmd">$</span> uvicorn main:app --reload</pre></div>
  </div>
  <div id="tab-frontend" class="tab-pane">
    <div class="code-block"><pre><span class="cmd">$</span> cd frontend
<span class="cmd">$</span> npm install
<span class="cmd">$</span> npm run dev</pre></div>
  </div>
  <div id="tab-deploy" class="tab-pane">
    <div class="code-block"><pre><span style="color:var(--muted);font-size:11px">## Vercel (Frontend)</span>
<span class="cmd">$</span> npm run build
<span style="color:var(--muted)">Deploy dist/ folder to Vercel</span>

<span style="color:var(--muted);font-size:11px">## Render (Backend)</span>
Build:  <span class="cmd">pip install -r requirements.txt</span>
Start:  <span class="cmd">uvicorn main:app --host 0.0.0.0 --port 10000</span></pre></div>
  </div>
</div>

<div class="section">
  <div class="section-label">Roadmap</div>
  <div class="future-list">
    <div class="future-item"><i class="ti ti-phone-call"></i> Real-time crisis hotline integration</div>
    <div class="future-item"><i class="ti ti-device-mobile"></i> Mobile application support</div>
    <div class="future-item"><i class="ti ti-stethoscope"></i> Therapist recommendation system</div>
    <div class="future-item"><i class="ti ti-language"></i> Multi-language support</div>
    <div class="future-item"><i class="ti ti-brain"></i> Advanced deep learning models</div>
  </div>
</div>

<div class="disclaimer">
  <i class="ti ti-info-circle"></i>
  <p><strong>Disclaimer:</strong> This project is intended for educational and support purposes only and is not a substitute for professional mental health care. If you or someone you know is in crisis, please contact a qualified mental health professional.</p>
</div>

<script>
function showTab(name, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');
}
</script>
</body>
</html>
