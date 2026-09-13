'use strict';
const { evalInTab } = require('/home/yuki/ai_works/tiny_coder/tools/cdp.js');

const WS_URL = 'ws://127.0.0.1:9223/devtools/page/B933A88312DFFDF5D025135AC7D17086';

// Optimization data from fiverr-kenzo-gig-optimization.md
const TITLE = "I will build an AI chatbot that books appointments for your business";
const DESCRIPTION = `Your customers message you at 2am and nobody's answering. That's the problem I fix.

I'm Kenzo — a solo dev from Davao City who builds AI chatbots for small businesses. Not the kind that say "I apologize, I didn't understand that." I mean chatbots that actually know your business.

Here's how it goes: I configure the AI on YOUR FAQ, YOUR products, YOUR services using a knowledge base (RAG) — not model retraining. So when a customer asks something, it sounds like you'd answer it yourself. Then I embed it on your website, or set it up on WhatsApp or Telegram — wherever your customers already are.

You send me your info, I build and train the bot in 3-5 days, and you get a live link to embed or start messaging. If anything breaks from delivery defects, I'm on it for 14 days.

I use OpenAI and LangChain — not some toy template. You deal directly with the builder, not a middleman or a support queue.

Starter from $15, full setups to $80. Message me and I'll have your chatbot running in days.`;
const TAGS = "ai chatbot, chatgpt, whatsapp bot, customer support, ai agent";
const FAQ_QUESTION = "Is this secure?";
const FAQ_ANSWER = "Your customer data stays on your own Vercel/Supabase — encrypted, and I don't keep anything. You own it, I don't touch it.";

const jsCode = `
(function() {
  const title = ${JSON.stringify(TITLE)};
  const description = ${JSON.stringify(DESCRIPTION)};
  const tags = ${JSON.stringify(TAGS)};
  const faqQuestion = ${JSON.stringify(FAQ_QUESTION)};
  const faqAnswer = ${JSON.stringify(FAQ_ANSWER)};

  const form = document.querySelector('form');
  if (!form) return { error: 'no form found' };

  const fd = new FormData(form);

  // Override fields
  fd.set('gig[title]', title);
  fd.set('gig[description]', description);
  fd.set('gig[tag_list]', tags);

  // Handle FAQ array - remove existing and add new
  fd.delete('gig[faq][0][question]');
  fd.delete('gig[faq][0][answer]');
  fd.append('gig[faq][0][question]', faqQuestion);
  fd.append('gig[faq][0][answer]', faqAnswer);

  // Ensure _method=patch
  fd.set('_method', 'patch');

  // Get authenticity_token
  const tokenInput = document.querySelector('input[name="authenticity_token"]');
  const token = tokenInput ? tokenInput.value : '';

  // Determine submit URL
  const action = form.getAttribute('action') || window.location.href;
  const url = action === 'javascript:void(0)' ? window.location.href : action;

  // Submit via fetch
  return fetch(url, {
    method: 'POST',
    body: fd,
    headers: {
      'X-CSRF-Token': token,
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': window.location.href
    },
    credentials: 'same-origin'
  }).then(r => r.text().then(text => ({
    status: r.status,
    ok: r.ok,
    statusText: r.statusText,
    responseText: text.substring(0, 500)
  }))).catch(e => ({ error: e.message }));
})()
`;

(async () => {
  try {
    const result = await evalInTab(WS_URL, jsCode);
    console.log('RESULT:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  }
})();
