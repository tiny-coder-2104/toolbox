'use strict';
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates');

function loadTemplate(name) {
  const filePath = path.join(TEMPLATES_DIR, name + '.txt');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function renderTemplate(template, variables) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}

function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  return fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.txt'))
    .map(f => f.replace(/\.txt$/, ''));
}

function generateFromContext(prompt, context) {
  const topic = context.topic || context.subject || 'something';
  const observation = context.observation || context.insight || 'interesting stuff';
  const hashtag = context.hashtag || context.tag || 'dev';
  const audience = context.audience || context.target || 'developers';
  const reasoning = context.reasoning || context.explanation || 'it matters';
  const quote = context.quote || '';
  const author = context.author || 'unknown';

  const platform = context.platform || 'twitter';
  const templates = {
    twitter: ['twitter-general', 'twitter-deep-dive', 'twitter-quote'],
    reddit: ['reddit-general', 'reddit-question', 'reddit-discussion']
  };
  const pool = templates[platform] || templates.twitter;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const template = loadTemplate(chosen);
  if (!template) return prompt;

  return renderTemplate(template, { topic, observation, hashtag, audience, reasoning, quote, author });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--list')) {
    console.log(JSON.stringify(listTemplates(), null, 2));
    process.exit(0);
  }
  if (args.includes('--render')) {
    const idx = args.indexOf('--render');
    const name = args[idx + 1];
    const vars = {};
    for (let i = idx + 2; i < args.length; i++) {
      const eq = args[i].indexOf('=');
      if (eq !== -1) vars[args[i].substring(0, eq)] = args[i].substring(eq + 1);
    }
    if (!name) { console.error('Error: template name required after --render'); process.exit(1); }
    const tpl = loadTemplate(name);
    if (!tpl) { console.error('Template not found: ' + name); process.exit(1); }
    console.log(renderTemplate(tpl, vars));
    process.exit(0);
  }
  if (args.includes('--generate')) {
    const idx = args.indexOf('--generate');
    const context = {};
    for (let i = idx + 1; i < args.length; i++) {
      const eq = args[i].indexOf('=');
      if (eq !== -1) context[args[i].substring(0, eq)] = args[i].substring(eq + 1);
    }
    console.log(generateFromContext('', context));
    process.exit(0);
  }
  console.log('Usage: node content-templates.js --list | --render <name> [key val...] | --generate [key val...]');
  process.exit(0);
}

module.exports = { loadTemplate, renderTemplate, listTemplates, generateFromContext };
