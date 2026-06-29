// ==UserScript==
// @name         Guland SQH UI Interaction Audit
// @namespace    https://guland.vn/
// @version      0.1.1
// @description  Internal QA helper: removes client-side UI gates so developers can verify server-side VIP enforcement.
// @match        https://guland.vn/soi-quy-hoach*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var CONFIG = {
    log: true,
    forceClientUiOpen: true,
    suppressVipModals: true,
    enableSearchTabs: true,
    enableLayerButtons: true,
    enableOpacityControls: true
  };

  var VIP_MODAL_SELECTOR = '#Modal-NotificationWithButton';
  var DEVICE_MODAL_SELECTOR = '#Modal-ExceedDeviceLimit';
  var BLOCKING_MODAL_SELECTOR = VIP_MODAL_SELECTOR + ', ' + DEVICE_MODAL_SELECTOR;
  var PATCH_FLAG = '__gulandSqhUiInteractionAuditPatched';
  var EVENT_NS = '.gulandSqhUiAudit';

  function log() {
    if (!CONFIG.log) {
      return;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Guland SQH UI Interaction Audit]');
    console.log.apply(console, args);
  }

  function injectCss() {
    if (document.getElementById('guland-sqh-ui-interaction-audit-css')) {
      return;
    }

    var css = [
      BLOCKING_MODAL_SELECTOR + ' { display: none !important; visibility: hidden !important; }',
      '.modal-backdrop { display: none !important; }',
      'body.modal-open { overflow: auto !important; padding-right: 0 !important; }',
      '#TabNav-SqhSearch .nav-link, .sdb-picker-map .disabled, .sdb-picker-map [aria-disabled="true"] {',
      '  pointer-events: auto !important;',
      '  cursor: pointer !important;',
      '  opacity: 1 !important;',
      '}',
      '.f-map-range, .f-map-range * { pointer-events: auto !important; }'
    ].join('\n');

    var style = document.createElement('style');
    style.id = 'guland-sqh-ui-interaction-audit-css';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function cleanupModalElement(el) {
    if (!el) {
      return;
    }
    if (el.classList.contains('show')) {
      el.classList.remove('show');
    }
    if (el.style.getPropertyValue('display') !== 'none' ||
      el.style.getPropertyPriority('display') !== 'important') {
      el.style.setProperty('display', 'none', 'important');
    }
    if (el.style.getPropertyValue('visibility') !== 'hidden' ||
      el.style.getPropertyPriority('visibility') !== 'important') {
      el.style.setProperty('visibility', 'hidden', 'important');
    }
    if (el.getAttribute('aria-hidden') !== 'true') {
      el.setAttribute('aria-hidden', 'true');
    }
    if (el.hasAttribute('aria-modal')) {
      el.removeAttribute('aria-modal');
    }
    if (el.hasAttribute('role')) {
      el.removeAttribute('role');
    }
  }

  function cleanupModalChrome() {
    if (document.body) {
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
      }
      if (document.body.style.getPropertyValue('padding-right')) {
        document.body.style.removeProperty('padding-right');
      }
      if (document.body.style.getPropertyValue('overflow')) {
        document.body.style.removeProperty('overflow');
      }
    }
    document.querySelectorAll('.modal-backdrop').forEach(function (el) {
      el.remove();
    });
  }

  function suppressBlockingModals() {
    if (!CONFIG.suppressVipModals) {
      return;
    }
    document.querySelectorAll(BLOCKING_MODAL_SELECTOR).forEach(cleanupModalElement);
    cleanupModalChrome();
  }

  function enableControls() {
    if (!CONFIG.forceClientUiOpen) {
      return;
    }

    var selector = [
      '#TabNav-SqhSearch .nav-link',
      '.sdb-picker-map .validate-money',
      '.sdb-picker-map .validate-device-limit',
      '.sdb-picker-map .disabled',
      '.sdb-picker-map [disabled]',
      '.sdb-picker-map [aria-disabled="true"]',
      '.btn--sqh-btm.btn--map-switch',
      '.btn--sqh-btm.btn--sqh-vip-layer',
      '[data-audit-client-gate]'
    ].join(', ');

    document.querySelectorAll(selector).forEach(function (el) {
      if (el.classList.contains('validate-money')) {
        el.setAttribute('data-audit-client-gate', 'validate-money');
        el.classList.remove('validate-money');
      }
      if (el.classList.contains('validate-device-limit')) {
        el.setAttribute('data-audit-client-device-gate', 'validate-device-limit');
        el.classList.remove('validate-device-limit');
      }
      if (el.classList.contains('disabled')) {
        el.classList.remove('disabled');
      }
      el.removeAttribute('disabled');
      el.removeAttribute('aria-disabled');
      if (el.style.pointerEvents !== 'auto') {
        el.style.pointerEvents = 'auto';
      }
    });
  }

  function patchBootstrapModal() {
    var $ = window.jQuery || window.$;
    if (!$ || !$.fn || !$.fn.modal || $.fn.modal[PATCH_FLAG]) {
      return;
    }

    var originalModal = $.fn.modal;
    function patchedModal(action) {
      var suppress = false;

      try {
        suppress = this && this.filter && this.filter(BLOCKING_MODAL_SELECTOR).length > 0 &&
          (action === 'show' || action === 'toggle' ||
            typeof action === 'undefined' || typeof action === 'object');
      } catch (err) {
        suppress = false;
      }

      if (suppress) {
        this.each(function (_, el) {
          cleanupModalElement(el);
        });
        cleanupModalChrome();
        log('Suppressed blocking modal:', action || 'default');
        return this;
      }

      return originalModal.apply(this, arguments);
    }

    Object.keys(originalModal).forEach(function (key) {
      try {
        patchedModal[key] = originalModal[key];
      } catch (err) {
        /* Ignore read-only plugin fields. */
      }
    });

    patchedModal[PATCH_FLAG] = true;
    patchedModal.__originalModal = originalModal;
    $.fn.modal = patchedModal;
  }

  function patchClientGateFunctions() {
    if (!CONFIG.forceClientUiOpen) {
      return;
    }

    window.__gulandSqhUiAuditOriginals = window.__gulandSqhUiAuditOriginals || {};

    if (typeof window.sqhHandleRegionSubLocationGate === 'function' &&
      !window.sqhHandleRegionSubLocationGate[PATCH_FLAG]) {
      window.__gulandSqhUiAuditOriginals.sqhHandleRegionSubLocationGate = window.sqhHandleRegionSubLocationGate;
      window.sqhHandleRegionSubLocationGate = function () {
        log('Bypassed client region/sub-location UI gate. Server must still enforce access.');
        return false;
      };
      window.sqhHandleRegionSubLocationGate[PATCH_FLAG] = true;
    }

    if (CONFIG.enableLayerButtons &&
      typeof window.sqhHandleVipLayerBtnClick === 'function' &&
      !window.sqhHandleVipLayerBtnClick[PATCH_FLAG]) {
      window.__gulandSqhUiAuditOriginals.sqhHandleVipLayerBtnClick = window.sqhHandleVipLayerBtnClick;
      window.sqhHandleVipLayerBtnClick = function () {
        log('Bypassed client map-layer UI gate. Server/tile URLs must still enforce access.');
        return false;
      };
      window.sqhHandleVipLayerBtnClick[PATCH_FLAG] = true;
    }
  }

  function activateTabFromLink(link) {
    if (!CONFIG.enableSearchTabs || !link || !link.getAttribute) {
      return;
    }

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') {
      return;
    }

    var pane = document.querySelector(href);
    var nav = link.closest('#TabNav-SqhSearch');
    var tabContent = document.querySelector('#TabContent-SqhSearch');
    if (!pane || !nav || !tabContent) {
      return;
    }

    nav.querySelectorAll('.nav-link').forEach(function (el) {
      el.classList.remove('active');
    });
    tabContent.querySelectorAll('.tab-pane').forEach(function (el) {
      el.classList.remove('active', 'show');
    });

    link.classList.add('active');
    pane.classList.add('active', 'show');
  }

  function installTabFallback() {
    if (!CONFIG.enableSearchTabs || document.__gulandSqhUiAuditTabFallback) {
      return;
    }

    document.__gulandSqhUiAuditTabFallback = true;
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest
        ? event.target.closest('#TabNav-SqhSearch .nav-link')
        : null;
      if (!link) {
        return;
      }

      link.classList.remove('validate-money', 'validate-device-limit', 'disabled');
      link.removeAttribute('aria-disabled');
      link.removeAttribute('disabled');
      activateTabFromLink(link);
    }, true);
  }

  function getRangeValue(range) {
    var value = Number(range.value);
    if (!Number.isFinite(value)) {
      value = 100;
    }
    var min = Number(range.min || 0);
    var max = Number(range.max || 100);
    return Math.max(min, Math.min(max, value));
  }

  function applyOpacityValue(range, value) {
    var wrapper = range.closest('.f-map-range');
    var min = Number(range.min || 0);
    var max = Number(range.max || 100);
    var clamped = Math.max(min, Math.min(max, Number(value)));
    range.value = String(clamped);

    if (wrapper) {
      var label = wrapper.querySelector('.f-map-range__val');
      if (label) {
        label.textContent = String(clamped);
        label.style.top = (clamped * 104 / 144) + '%';
      }
    }

    if (typeof window.change_range_value === 'function') {
      window.change_range_value(clamped);
    } else if (typeof window.mapPlanningSetLayerOpacity === 'function') {
      window.mapPlanningSetLayerOpacity(clamped);
    }
  }

  function patchOpacityControls() {
    if (!CONFIG.enableOpacityControls) {
      return;
    }

    var $ = window.jQuery || window.$;
    var rangeSelector = '.f-map-range, .f-map-range input[type="range"], .f-map-range .f-map-range__minus, .f-map-range .f-map-range__plus';
    var inputSelector = '.f-map-range input[type="range"]';

    if ($ && window.sqhOpacityHandlePaywall && !window.__gulandSqhUiAuditOpacityUnbound) {
      $(document).off('pointerdown mousedown touchstart click', rangeSelector, window.sqhOpacityHandlePaywall);
      $(document).off('input change touchmove pointermove', inputSelector, window.sqhOpacityHandlePaywall);
      window.__gulandSqhUiAuditOpacityUnbound = true;
      log('Detached client opacity paywall handler');
    }

    if ($ && !document.__gulandSqhUiAuditOpacityHandlers) {
      document.__gulandSqhUiAuditOpacityHandlers = true;

      $(document).on('input' + EVENT_NS + ' change' + EVENT_NS, inputSelector, function () {
        applyOpacityValue(this, getRangeValue(this));
      });

      $(document).on('click' + EVENT_NS, '.f-map-range .f-map-range__minus, .f-map-range .f-map-range__plus', function (event) {
        var wrapper = this.closest('.f-map-range');
        var range = wrapper ? wrapper.querySelector('input[type="range"]') : null;
        if (!range) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();

        var step = Number(range.step || 20);
        if (!Number.isFinite(step) || step <= 0) {
          step = 20;
        }

        var direction = this.classList.contains('f-map-range__minus') ? -1 : 1;
        applyOpacityValue(range, getRangeValue(range) + direction * step);
      });
    }
  }

  function addAuditBadge() {
    if (!document.body || document.getElementById('guland-sqh-ui-interaction-audit-badge')) {
      return;
    }

    var badge = document.createElement('div');
    badge.id = 'guland-sqh-ui-interaction-audit-badge';
    badge.textContent = 'SQH UI audit: client gates open';
    badge.style.cssText = [
      'position:fixed',
      'left:12px',
      'bottom:12px',
      'z-index:2147483647',
      'font:12px Arial,sans-serif',
      'background:#111827',
      'color:#fff',
      'padding:6px 8px',
      'border-radius:4px',
      'box-shadow:0 4px 16px rgba(0,0,0,.18)',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(badge);
  }

  function tick() {
    if (document.__gulandSqhUiAuditTicking) {
      return;
    }
    document.__gulandSqhUiAuditTicking = true;

    try {
      injectCss();
      patchBootstrapModal();
      patchClientGateFunctions();
      patchOpacityControls();
      enableControls();
      suppressBlockingModals();
      addAuditBadge();
    } catch (err) {
      log('Patch tick failed:', err);
    } finally {
      document.__gulandSqhUiAuditTicking = false;
    }
  }

  function scheduleTick() {
    if (document.__gulandSqhUiAuditScheduled) {
      return;
    }
    document.__gulandSqhUiAuditScheduled = true;
    window.setTimeout(function () {
      document.__gulandSqhUiAuditScheduled = false;
      tick();
    }, 100);
  }

  function installObserver() {
    if (!window.MutationObserver || !document.documentElement || document.__gulandSqhUiAuditObserver) {
      return;
    }

    document.__gulandSqhUiAuditObserver = true;
    var observer = new MutationObserver(scheduleTick);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  installTabFallback();
  installObserver();
  tick();

  var startupInterval = window.setInterval(tick, 1000);
  window.setTimeout(function () {
    window.clearInterval(startupInterval);
    tick();
    log('Startup patch window finished');
  }, 10000);

  document.addEventListener('DOMContentLoaded', tick, true);
  window.addEventListener('load', tick, true);
})();
