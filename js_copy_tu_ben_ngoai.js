// ==UserScript==
// @name         Redmine Issue - Copy Button outside
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Add copy button on issue list and issue detail pages
// @include      https://dev.atomi.vn/projects/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  function parseIssueDoc(doc) {
    const tracker = doc.querySelector('h2.inline-flex')?.textContent.trim() ?? '';
    const title   = doc.querySelector('.subject h3')?.textContent.trim() ?? '';

    // Giữ newline đúng: thay <br> thành \n trước khi lấy text
    const wikiEl = doc.querySelector('.description .wiki');
    if (wikiEl) {
      wikiEl.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    }
    const desc = wikiEl?.innerText?.trim() ?? wikiEl?.textContent?.trim() ?? '';

    return `${tracker}: ${title}\n\nDescription\n${desc}`;
  }

  function makeBtn(label = '📋') {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      padding: 1px 6px;
      font-size: 12px;
      cursor: pointer;
      border: 1px solid #aaa;
      border-radius: 3px;
      background: #f5f5f5;
      margin-left: 6px;
      vertical-align: middle;
    `;
    return btn;
  }

  function initList() {
    document.querySelectorAll('table.issues tbody tr').forEach(row => {
      const link = row.querySelector('td.subject a');
      if (!link || link.dataset.copyAdded) return;
      link.dataset.copyAdded = '1';

      const btn = makeBtn();
      link.parentElement.appendChild(btn);

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        btn.textContent = '⏳';
        try {
          const res  = await fetch(link.href);
          const html = await res.text();
          const doc  = new DOMParser().parseFromString(html, 'text/html');
          GM_setClipboard(parseIssueDoc(doc));
          btn.textContent = '✅';
        } catch {
          btn.textContent = '❌';
        }
        setTimeout(() => btn.textContent = '📋', 2000);
      });
    });
  }

  function initDetail() {
    const subjectDiv = document.querySelector('.subject div');
    if (!subjectDiv || subjectDiv.dataset.copyAdded) return;
    subjectDiv.dataset.copyAdded = '1';

    const btn = makeBtn('📋 Copy');
    btn.style.fontSize = '13px';
    subjectDiv.appendChild(btn);

    btn.addEventListener('click', () => {
      GM_setClipboard(parseIssueDoc(document));
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });
  }

  if (document.querySelector('table.issues')) {
    initList();
  } else if (document.querySelector('.subject h3')) {
    initDetail();
  }

})();