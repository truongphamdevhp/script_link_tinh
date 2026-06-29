// ==UserScript==
// @name         Guland SQH VIP UI Audit
// @namespace    https://guland.vn/
// @version      0.1.0
// @description  Defensive QA PoC for checking whether Guland SQH VIP gates are enforced only in client UI.
// @match        https://guland.vn/soi-quy-hoach*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var CONFIG = {
    suppressVipPopup: true,
    removeClientGateClasses: true,
    log: true
  };

  var VIP_MODAL_SELECTOR = '#Modal-NotificationWithButton';
  var DEVICE_MODAL_SELECTOR = '#Modal-ExceedDeviceLimit';
  var AUDIT_MODAL_SELECTOR = VIP_MODAL_SELECTOR + ', ' + DEVICE_MODAL_SELECTOR;
  var PATCH_FLAG = '__gulandSqhVipUiAuditPatched';

  function log() {
    if (!CONFIG.log) {
      return;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[Guland SQH VIP UI Audit]');
    console.log.apply(console, args);
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

  function suppressVipModals() {
    if (!CONFIG.suppressVipPopup) {
      return;
    }
    document.querySelectorAll(AUDIT_MODAL_SELECTOR).forEach(cleanupModalElement);
    cleanupModalChrome();
  }

  function removeClientGateClasses() {
    if (!CONFIG.removeClientGateClasses) {
      return;
    }

    document.querySelectorAll(
      '#TabNav-SqhSearch .nav-link, ' +
      '.validate-money, ' +
      '.validate-device-limit, ' +
      '[data-audit-removed-class="validate-money"], ' +
      '[data-audit-removed-device-class="validate-device-limit"]'
    ).forEach(function (el) {
      if (el.classList.contains('disabled')) {
        el.classList.remove('disabled');
      }
      if (el.getAttribute('aria-disabled') === 'true') {
        el.removeAttribute('aria-disabled');
      }
      if (el.hasAttribute('disabled')) {
        el.removeAttribute('disabled');
      }
      if (el.classList.contains('validate-money')) {
        el.setAttribute('data-audit-removed-class', 'validate-money');
        el.classList.remove('validate-money');
      }
      if (el.classList.contains('validate-device-limit')) {
        el.setAttribute('data-audit-removed-device-class', 'validate-device-limit');
        el.classList.remove('validate-device-limit');
      }
    });
  }

  function patchJqueryModal() {
    var $ = window.jQuery || window.$;
    if (!$ || !$.fn || !$.fn.modal || $.fn.modal[PATCH_FLAG]) {
      return;
    }

    var originalModal = $.fn.modal;

    function patchedModal(action) {
      var shouldSuppress = false;

      try {
        shouldSuppress = this && this.filter && this.filter(AUDIT_MODAL_SELECTOR).length > 0 &&
          (action === 'show' || action === 'toggle' ||
            typeof action === 'undefined' || typeof action === 'object');
      } catch (err) {
        shouldSuppress = false;
      }

      if (shouldSuppress) {
        log('Suppressed Bootstrap modal call:', action || 'default');
        this.each(function (_, el) {
          cleanupModalElement(el);
        });
        cleanupModalChrome();
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
