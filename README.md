# 🌟 PromptSmith

An AI-powered tool that analyzes and improves prompts with clarity scoring, weakness detection, 
and optimized rewrites. Built with <strong>Next.js</strong>, <strong>Gemini 2.5 Flash</strong>, and 
<strong>serverless API routes</strong>.

## Features

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
      <li>Detailed</li>
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

## Tech Stack

<ul>
  <li>Next.js (Pages Router)</li>
  <li>React</li>
  <li>Gemini 2.5 Flash API</li>
  <li>Serverless Functions (<code>/pages/api/analyze.js</code>)</li>
  <li>Deployed on Vercel</li>
</ul>

## Local Setup

### 1. Clone the repository
<pre><code>git clone https://github.com/MaryamAishah/PromptSmith.git
cd promptsmith
</code></pre>

### 2. Install dependencies
<pre><code>npm install
</code></pre>

### 3. Add your Gemini API key 
<p>Create a <code>.env.local</code> file:</p>

<pre><code>GEMINI_API_KEY=AIza...
</code></pre>

### 4. Run the dev server 
<pre><code>npm run dev
</code></pre>

<p>App runs at: 👉 <a href="http://localhost:3000">http://localhost:3000</a></p>

## Deployment (Vercel)

<ul>
  <li>Push the repository to GitHub</li>
  <li>Import it into Vercel</li>
  <li>Add environment variable:
    <pre><code>GEMINI_API_KEY = your_key_here
</code></pre>
  </li>
  <li>Deploy!</li>
</ul>


## Project Structure 

<pre><code>promptsmith/
  pages/
    index.js            
    api/
      analyze.js        
  public/
    favicon.ico         
  styles/ 
    globals.css
  .env.local            
  package.json
</code></pre>

<h2>License</h2>
<p>MIT License.</p>
