// ==UserScript==
// @name         Redmine Issue - Copy Button inside
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Add copy button to Redmine issue pages
// @include      https://dev.atomi.vn/issues/*
// @grant        GM_setClipboard
// ==/UserScript==
(function () {
  'use strict';

  function getIssueText() {
    const tracker = document.querySelector('h2.inline-block')?.textContent.trim() ?? '';
    const title = document.querySelector('.subject h3')?.textContent.trim() ?? '';
    const description = document.querySelector('#issue_description_wiki')?.innerText.trim() ?? '';
    return `${tracker}: ${title}\n\nDescription\n${description}`;
  }

  function addCopyButton() {
    const subject = document.querySelector('.subject');
    if (!subject) {
      return;
    }
    const btn = document.createElement('button');
    btn.textContent = '📋 Copy';
    btn.style.cssText = `
      margin-left: 12px;
      padding: 4px 10px;
      font-size: 13px;
      cursor: pointer;
      vertical-align: middle;
      border: 1px solid #aaa;
      border-radius: 4px;
      background: #f5f5f5;
    `;
    btn.addEventListener('click', () => {
      const text = getIssueText();
      GM_setClipboard(text);
      btn.textContent = '✅ Copied!';
      const RESET_DELAY_MS = 2000;
      setTimeout(() => btn.textContent = '📋 Copy', RESET_DELAY_MS);
    });
    subject.querySelector('div')?.appendChild(btn);
  }

  addCopyButton();
})();
