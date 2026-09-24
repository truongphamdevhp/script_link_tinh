// ==UserScript==
// @name         QH24h - Fake VIP UI
// @namespace    qh24h-dev
// @version      1.0
// @match        https://quyhoach24h.vn/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function ()
{
    'use strict';

    function removeVipPopup()
    {
        document.querySelectorAll(
            '[aria-label="Yêu cầu tài khoản VIP"]'
        ).forEach(function (dialog)
        {
            const root = dialog.closest('.fixed.inset-0');

            if (root)
            {
                root.remove();
            }
            else
            {
                dialog.remove();
            }
        });
    }

    function fakeVipTextState()
    {
        try
        {
            const nuxtData = document.getElementById('__NUXT_DATA__');

            if (nuxtData && nuxtData.textContent)
            {
                nuxtData.textContent = nuxtData.textContent
                    .replace(/"vip_status":0/g, '"vip_status":1')
                    .replace(/"vip_status":false/g, '"vip_status":true');
            }
        }
        catch (e)
        {
        }
    }

    function enableAllLayerUI()
    {
        const rows = document.querySelectorAll(
            '.flex.items-center.gap-2\\.5.group.cursor-pointer'
        );

        rows.forEach(function (row)
        {
            const track = row.querySelector(
                '.relative.inline-flex.w-9.h-5 > span:first-child'
            );

            const knob = row.querySelector(
                '.relative.inline-flex.w-9.h-5 > span:nth-child(2)'
            );

            if (!track)
            {
                return;
            }

            track.classList.remove(
                'bg-gray-500',
                'bg-gray-400',
                'bg-gray-300'
            );

            track.classList.add('bg-blue-500');

            if (knob)
            {
                knob.classList.remove('translate-x-0');
                knob.classList.add('translate-x-4');
            }
        });
    }

    function removeVipVisualHints()
    {
        document.querySelectorAll('sup').forEach(function (el)
        {
            const text = el.textContent.trim();

            if (
                text === '1/500' ||
                text === '1/2000' ||
                text === '1/5000' ||
                text === '1/10000' ||
                text === '100 năm' ||
                text === 'Hiển thị đầy đủ'
            )
            {
                el.style.opacity = '0.6';
            }
        });
    }

    function patch()
    {
        removeVipPopup();
        enableAllLayerUI();
        removeVipVisualHints();
    }

    fakeVipTextState();

    const observer = new MutationObserver(function ()
    {
        patch();
    });

    function start()
    {
        patch();

        observer.observe(document.documentElement,
        {
            childList: true,
            subtree: true
        });

        setInterval(patch, 500);
    }

    if (document.readyState === 'loading')
    {
        document.addEventListener('DOMContentLoaded', start);
    }
    else
    {
        start();
    }
})();
