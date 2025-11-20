<h1>🌟 PromptSmith</h1>

<p>
An AI-powered tool that analyzes and improves prompts with clarity scoring, weakness detection, 
and optimized rewrites. Built with <strong>Next.js</strong>, <strong>Gemini 2.5 Flash</strong>, and 
<strong>serverless API routes</strong>.
</p>

<hr>

<h2>Features</h2>

<ul>
  <li><strong>Prompt Clarity Score (0–100)</strong> based on:
    <ul>
      <li>Vagueness</li>
      <li>Missing context</li>
      <li>Structure completeness</li>
      <li>Constraints</li>
      <li>Contradictions</li>
    </ul>
  </li>

  <li><strong>Automatic Weakness Detection</strong></li>

  <li><strong>Multiple Improved Prompt Versions</strong>
    <ul>
      <li>Structured</li>
      <li>Concise</li>
      <li>Detailed (no examples)</li>
    </ul>
  </li>

  <li><strong>Highlight System</strong>
    <ul>
      <li>Vague words</li>
      <li>Missing output specification</li>
      <li>Conflicting instructions</li>
    </ul>
  </li>

  <li><strong>Secure Gemini-powered analysis via API</strong></li>
  <li><strong>Next.js API routes</strong> for server-side model calls</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>

<ul>
  <li>Next.js (Pages Router)</li>
  <li>React</li>
  <li>Gemini 2.5 Flash API</li>
  <li>Serverless Functions (<code>/pages/api/analyze.js</code>)</li>
  <li>Deployed on Vercel</li>
</ul>

<hr>

<h2>Local Setup</h2>

<h3>1. Clone the repository</h3>
<pre><code>git clone https://github.com/MaryamAishah/PromptSmith.git
cd promptsmith
</code></pre>

<h3>2. Install dependencies</h3>
<pre><code>npm install
</code></pre>

<h3>3. Add your Gemini API key</h3>
<p>Create a <code>.env.local</code> file:</p>

<pre><code>GEMINI_API_KEY=AIza...
</code></pre>

<h3>4. Run the dev server</h3>
<pre><code>npm run dev
</code></pre>

<p>App runs at: 👉 <a href="http://localhost:3000">http://localhost:3000</a></p>

<hr>

<h2>Deployment (Vercel)</h2>

<ul>
  <li>Push the repository to GitHub</li>
  <li>Import it into Vercel</li>
  <li>Add environment variable:
    <pre><code>GEMINI_API_KEY = your_key_here
</code></pre>
  </li>
  <li>Deploy!</li>
</ul>

<hr>

<h2>Project Structure</h2>

<pre><code>promptsmith/
  pages/
    index.js            # UI and frontend logic
    api/
      analyze.js        # Serverless API route calling Gemini
  public/
    favicon.ico         # Site icon
  styles/ 
    globals.css
  .env.local            # API key (not committed)
  package.json
</code></pre>

<hr>

<h2>License</h2>
<p>MIT License.</p>
