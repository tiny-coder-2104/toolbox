// TinyCoder Lead Capture — intercepts Chatbase chat and POSTs to Make.com webhook
(function() {
  var WEBHOOK_URL = 'https://hook.us2.make.com/wgwq68459cpjed3h7is6onuf026q23cx';
  var seen = new Set();

  function extractEmail(text) {
    var m = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return m ? m[0] : '';
  }

  function extractName(text) {
    var lower = text.toLowerCase();
    var patterns = [
      /(?:my name is|i'm|i am|call me|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)$/
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = text.match(patterns[i]);
      if (m) return m[1];
    }
    return '';
  }

  function sendLead(data) {
    var body = JSON.stringify({
      name: data.name || '',
      email: data.email || '',
      company: data.company || '',
      message: data.message || '',
      source: 'chatbase'
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(WEBHOOK_URL, new Blob([body], {type: 'application/json'}));
    } else {
      fetch(WEBHOOK_URL, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: body, mode: 'no-cors'});
    }
  }

  function processMessage(text) {
    if (!text || text.length < 3 || seen.has(text)) return;
    seen.add(text);
    if (seen.size > 100) seen.clear();

    var email = extractEmail(text);
    var name = extractName(text);
    var companyMatch = text.match(/(?:company|org|organization|business|firm|from)\s+(?:is\s+)?([A-Z][\w\s&.]+)/i);
    var company = companyMatch ? companyMatch[1].trim() : '';

    if (email || name || company) {
      sendLead({name: name, email: email, company: company, message: text});
    }
  }

  function observeChat() {
    var target = document.querySelector('[class*="chatbase"], iframe[src*="chatbase"], #chatbase-widget');
    if (!target) {
      setTimeout(observeChat, 2000);
      return;
    }

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            var texts = node.querySelectorAll ? node.querySelectorAll('[class*="user"], [class*="human"], [data-message-type="user"]') : [];
            texts.forEach(function(el) { processMessage(el.textContent.trim()); });
            if (node.textContent && node.textContent.length > 3) {
              processMessage(node.textContent.trim());
            }
          }
        });
      });
    });

    observer.observe(document.body, {childList: true, subtree: true});
  }

  // Also listen for Chatbase API events if available
  window.addEventListener('load', function() {
    setTimeout(observeChat, 3000);

    // Try Chatbase widget API
    if (window.chatbase) {
      try {
        window.chatbase.on && window.chatbase.on('message', function(msg) {
          if (msg && msg.text) processMessage(msg.text);
        });
      } catch(e) {}
    }
  });
})();
