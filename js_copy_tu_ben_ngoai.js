// ==UserScript==
// @name         Redmine Issue - Copy Button
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Add copy button on issue list and issue detail pages
// @include      https://dev.atomi.vn/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  // ── Parse issue text từ HTML document ──
  function parseIssueDoc(doc) {
    const tracker = doc.querySelector('h2.inline-flex')?.textContent.trim() ?? '';
    const title   = doc.querySelector('.subject h3')?.textContent.trim() ?? '';
    const desc    = doc.querySelector('.description .wiki')?.innerText.trim() ?? '';
    return `${tracker}: ${title}\n\nDescription\n${desc}`;
  }

  // ── Tạo nút Copy ──
  function makeBtn() {
    const btn = document.createElement('button');
    btn.textContent = '📋';
    btn.title = 'Copy issue content';
    btn.style.cssText = `
      padding: 1px 5px;
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

  // ── Trang danh sách ──
  function initList() {
    const rows = document.querySelectorAll('table.issues tbody tr');
    rows.forEach(row => {
      const link = row.querySelector('td.subject a, td:nth-child(4) a');
      if (!link) return;

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
          const text = parseIssueDoc(doc);
          GM_setClipboard(text);
          btn.textContent = '✅';
        } catch {
          btn.textContent = '❌';
        }
        setTimeout(() => btn.textContent = '📋', 2000);
      });
    });
  }

  // ── Trang chi tiết issue ──
  function initDetail() {
    const subject = document.querySelector('.subject');
    if (!subject) return;

    const btn = makeBtn();
    btn.style.fontSize = '13px';
    btn.textContent = '📋 Copy';
    subject.querySelector('div')?.appendChild(btn);

    btn.addEventListener('click', () => {
      const text = parseIssueDoc(document);
      GM_setClipboard(text);
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    });
  }

  // ── Route ──
  if (document.querySelector('table.issues')) {
    initList();
  } else if (document.querySelector('.subject h3')) {
    initDetail();
  }

})();