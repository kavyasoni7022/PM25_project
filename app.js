"use strict";

/* ==========================================================================
   PM2.5 RESEARCH EDITORIAL APPLICATION SCRIPT
   High-performance Chart.js visualizer & interactive data explorer.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. DATA AND GLOBAL CONFIGURATION
   -------------------------------------------------------------------------- */
const DATA = window.PM25_DATA;

if (!DATA) {
    throw new Error("PM25_DATA was not loaded. Check that data.js is included before app.js.");
}

const COLORS = {
    teal: "#10b981",
    tealLight: "#34d399",
    tealDark: "#059669",
    tealGlow: "rgba(16, 185, 129, 0.15)",
    blue: "#38bdf8",
    blueGlow: "rgba(56, 189, 248, 0.15)",
    orange: "#f59e0b",
    orangeGlow: "rgba(245, 158, 11, 0.15)",
    red: "#f43f5e",
    redGlow: "rgba(244, 63, 94, 0.15)",
    purple: "#a855f7",
    grey: "#94a3b8",
    gridDark: "rgba(255, 255, 255, 0.07)",
    gridLight: "rgba(15, 23, 42, 0.06)"
};

const charts = {};

// Chart.js Global Typography & Visual Defaults
Chart.defaults.font.family = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
Chart.defaults.font.size = 11.5;
Chart.defaults.color = "#94a3b8";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 7;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = "rgba(10, 15, 23, 0.94)";
Chart.defaults.plugins.tooltip.titleFont = { family: '"Manrope", sans-serif', weight: "700", size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { family: '"DM Mono", monospace', size: 11.5 };
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.borderColor = "rgba(255, 255, 255, 0.12)";
Chart.defaults.plugins.tooltip.borderWidth = 1;

/* --------------------------------------------------------------------------
   2. GENERAL HELPER FUNCTIONS
   -------------------------------------------------------------------------- */
function normalizeKey(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function getValue(object, candidates, fallback = null) {
    if (!object || typeof object !== "object") return fallback;
    const keys = Object.keys(object);
    for (const candidate of candidates) {
        const exact = keys.find(key => key === candidate);
        if (exact !== undefined) return object[exact];
        const normalized = normalizeKey(candidate);
        const match = keys.find(key => normalizeKey(key) === normalized);
        if (match !== undefined) return object[match];
    }
    return fallback;
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function formatNumber(value, digits = 2) {
    const number = toNumber(value);
    if (number === null) return "—";
    return number.toLocaleString("en-IN", {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits
    });
}

function formatInteger(value) {
    const number = toNumber(value);
    if (number === null) return "—";
    return Math.round(number).toLocaleString("en-IN");
}

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}

function getRows(section, key) {
    const value = DATA?.[section]?.[key];
    return Array.isArray(value) ? value : [];
}

function setHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    }
}

function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    if (charts[id]) {
        charts[id].destroy();
    }
    charts[id] = new Chart(canvas, config);
    return charts[id];
}

function emptyMessage(id, message) {
    setHTML(id, `<p class="empty-state">${message}</p>`);
}

function createBarOptions(horizontal = false, isDark = false) {
    const gridColor = isDark ? COLORS.gridDark : COLORS.gridLight;
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? "y" : "x",
        plugins: {
            legend: {
                position: "bottom"
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: !horizontal,
                    color: gridColor
                },
                ticks: {
                    color: isDark ? "#94a3b8" : "#64748b"
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: horizontal,
                    color: gridColor
                },
                ticks: {
                    color: isDark ? "#94a3b8" : "#64748b"
                }
            }
        }
    };
}

/* --------------------------------------------------------------------------
   3. INTERACTIVE NAVIGATION, SCROLL SPY & PROGRESS
   -------------------------------------------------------------------------- */
function initializeNavigation() {
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

function initializeScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll("#mainNav a");
    if (!sections.length || !navLinks.length) return;

    function onScroll() {
        const scrollPosition = window.scrollY + 120;
        let currentId = "";

        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentId = sec.getAttribute("id");
            }
        });

        if (currentId) {
            navLinks.forEach(link => {
                if (link.getAttribute("href") === `#${currentId}`) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
}

function initializeScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    const backToTop = document.getElementById("backToTop");

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
        if (bar) bar.style.width = `${pct}%`;

        if (backToTop) {
            if (scrollY > 400) {
                backToTop.classList.add("visible");
            } else {
                backToTop.classList.remove("visible");
            }
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}

/* --------------------------------------------------------------------------
   4. ANIMATED STAT COUNTERS & OVERVIEW
   -------------------------------------------------------------------------- */
function animateCounter(element, target, duration = 1400) {
    if (!element || target === null || isNaN(target)) return;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * ease);
        element.textContent = current.toLocaleString("en-IN");
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = Math.round(target).toLocaleString("en-IN");
        }
    }

    requestAnimationFrame(update);
}

function renderOverview() {
    const meta = DATA.meta || {};
    const cityCount = Array.isArray(meta.pooledCities) ? meta.pooledCities.length : 6;
    const modelReady = meta.modelReadyRows || 11037;
    const testRows = DATA.regression?.testPredictions?.length || meta.testRows || 1098;
    const unseenRows = Array.isArray(meta.unseenCities) ? meta.unseenCities.length : 2;

    const statsGrid = document.getElementById("overviewStats");
    let hasAnimated = false;

    if (statsGrid && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateCounter(document.getElementById("statCities"), cityCount);
                animateCounter(document.getElementById("statRows"), modelReady);
                animateCounter(document.getElementById("statTest"), testRows);
                animateCounter(document.getElementById("statUnseen"), unseenRows);
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        observer.observe(statsGrid);
    } else {
        const values = [
            ["statCities", formatInteger(cityCount)],
            ["statRows", formatInteger(modelReady)],
            ["statTest", formatInteger(testRows)],
            ["statUnseen", formatInteger(unseenRows)]
        ];
        values.forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }
}

/* --------------------------------------------------------------------------
   5. HERO CHART (Delhi / Initial PM2.5 Time-series)
   -------------------------------------------------------------------------- */
function renderHeroChart() {
    const canvas = document.getElementById("heroChart");
    if (!canvas) return;

    const cities = Object.keys(DATA.series || {});
    if (!cities.length) return;

    const city = cities.includes("Delhi") ? "Delhi" : cities[0];
    const values = DATA.series[city];
    if (!values) return;

    const ctx = canvas.getContext("2d");
    let gradientFill = "rgba(16, 185, 129, 0.12)";
    if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.28)");
        gradient.addColorStop(0.8, "rgba(16, 185, 129, 0.02)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");
        gradientFill = gradient;
    }

    createChart("heroChart", {
        type: "line",
        data: {
            labels: values.dates,
            datasets: [
                {
                    label: `Actual PM2.5 (${city})`,
                    data: values.actual,
                    borderColor: COLORS.tealLight,
                    backgroundColor: gradientFill,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.25,
                    fill: true
                },
                {
                    label: "SVR prediction",
                    data: values.svr,
                    borderColor: COLORS.orange,
                    borderWidth: 1.6,
                    pointRadius: 0,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "index"
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#cbd5e1",
                        padding: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        title: items => formatDate(items[0]?.label),
                        label: context => ` ${context.dataset.label}: ${formatNumber(context.raw, 1)} µg/m³`
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8",
                        maxTicksLimit: 7
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: COLORS.gridDark
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   6. POLLUTANT MISSINGNESS CHART (FIG. 01)
   -------------------------------------------------------------------------- */
function renderMissingness() {
    const rows = DATA.dataset?.pollutantMissingness || [];
    if (!rows.length) {
        emptyMessage("missingnessChart", "No pollutant missingness records available.");
        return;
    }

    const labels = rows.map(row => getValue(row, ["Pollutant", "feature", "column"]));
    const values = rows.map(row => toNumber(getValue(row, ["Missing_Percent", "missing_percent", "missing_pct"])));

    createChart("missingnessChart", {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Missing values (%)",
                data: values,
                backgroundColor: labels.map(label =>
                    label === "Xylene" || label === "PM10" ? COLORS.orange : COLORS.teal
                ),
                borderRadius: 4,
                barThickness: 16
            }]
        },
        options: {
            ...createBarOptions(true, true),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => ` ${formatNumber(context.raw, 1)}% missing`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Missing values (%)",
                        color: "#94a3b8"
                    },
                    grid: {
                        color: COLORS.gridDark
                    },
                    ticks: {
                        color: "#94a3b8"
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        color: "#cbd5e1"
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   7. CITY-YEAR COVERAGE HEATMAP (FIG. 02)
   -------------------------------------------------------------------------- */
function renderCoverage() {
    const rows = DATA.dataset?.cityYearCoverage || [];
    if (!rows.length) {
        emptyMessage("coverageHeatmap", "No city-year coverage records available.");
        return;
    }

    const cities = [...new Set(rows.map(row => getValue(row, ["City"])))].filter(Boolean);
    const years = [...new Set(rows.map(row => toNumber(getValue(row, ["Year"]))))]
        .filter(v => v !== null)
        .sort((a, b) => a - b);

    function cellColor(value) {
        if (value === null) return "#1e293b";
        if (value >= 95) return "#059669";
        if (value >= 85) return "#10b981";
        if (value >= 70) return "#34d399";
        if (value >= 50) return "#d97706";
        return "#e11d48";
    }

    let html = `
        <table class="heatmap-table">
            <thead>
                <tr>
                    <th>City</th>
                    ${years.map(year => `<th>${year}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
    `;

    cities.forEach(city => {
        html += `<tr><td>${city}</td>`;
        years.forEach(year => {
            const record = rows.find(row =>
                getValue(row, ["City"]) === city &&
                toNumber(getValue(row, ["Year"])) === year
            );
            const value = record
                ? toNumber(getValue(record, ["Coverage_Percent", "coverage_percent"]))
                : null;
            const display = value === null ? "—" : `${formatNumber(value, 1)}%`;

            html += `
                <td style="background:${cellColor(value)};color:#ffffff"
                    title="${city} (${year}): ${display} PM2.5 coverage">
                    ${display}
                </td>
            `;
        });
        html += "</tr>";
    });

    html += `
            </tbody>
        </table>
        <p class="footnote">Coverage = observed PM2.5 days divided by total daily records in each year.</p>
    `;

    setHTML("coverageHeatmap", html);
}

/* --------------------------------------------------------------------------
   8. REGRESSION COMPARISON CHART (FIG. 03)
   -------------------------------------------------------------------------- */
function renderRegressionComparison() {
    const rows = DATA.regression?.validationModelComparison || [];
    if (!rows.length) {
        emptyMessage("regressionComparisonChart", "No validation model comparison records available.");
        return;
    }

    const labels = rows.map(row => getValue(row, ["Model", "model"]));
    const mae = rows.map(row => toNumber(getValue(row, ["MAE", "mae"])));
    const rmse = rows.map(row => toNumber(getValue(row, ["RMSE", "rmse"])));

    createChart("regressionComparisonChart", {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Validation MAE (µg/m³)",
                    data: mae,
                    backgroundColor: COLORS.teal,
                    borderRadius: 4
                },
                {
                    label: "Validation RMSE (µg/m³)",
                    data: rmse,
                    backgroundColor: COLORS.blue,
                    borderRadius: 4
                }
            ]
        },
        options: {
            ...createBarOptions(true, false),
            plugins: {
                legend: {
                    position: "bottom"
                },
                tooltip: {
                    callbacks: {
                        label: context => ` ${context.dataset.label}: ${formatNumber(context.raw, 2)} µg/m³`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   9. REGRESSION TEST METRICS CARDS
   -------------------------------------------------------------------------- */
function renderRegressionMetrics() {
    const rows = DATA.regression?.testMetrics || [];
    const preferred = rows.filter(row => {
        const model = String(getValue(row, ["Model", "model"], "")).toLowerCase();
        const dataset = String(getValue(row, ["Dataset", "Split", "split"], "")).toLowerCase();
        return (model.includes("svr") || model.includes("support vector")) && (!dataset || dataset.includes("test"));
    });

    const row = preferred[0] || rows.find(item =>
        String(getValue(item, ["Model"], "")).toLowerCase().includes("svr")
    );

    if (!row) {
        emptyMessage("regressionMetrics", "Regression metrics unavailable.");
        return;
    }

    const mae = getValue(row, ["MAE", "mae"]);
    const rmse = getValue(row, ["RMSE", "rmse"]);
    const count = getValue(row, ["Rows", "N", "Count"]) || DATA.regression?.testPredictions?.length || 1098;

    const cards = [
        ["TEST MAE", mae, "µg/m³", "Mean Absolute Error"],
        ["TEST RMSE", rmse, "µg/m³", "Root Mean Squared Error"],
        ["TEST OBSERVATIONS", count, "Predictions", "Chronological held-out test"]
    ];

    setHTML("regressionMetrics", cards.map(([label, value, unit, note]) => `
        <article class="metric-card">
            <span>${label}</span>
            <strong>${label.includes("OBSERVATIONS") ? formatInteger(value) : formatNumber(value, 2)}</strong>
            <small>${unit} · ${note}</small>
        </article>
    `).join(""));
}

/* --------------------------------------------------------------------------
   10. INTERACTIVE PREDICTION EXPLORER (FIG. 04)
   -------------------------------------------------------------------------- */
function renderPredictionExplorer() {
    const citySelect = document.getElementById("citySelect");
    const modelSelect = document.getElementById("modelSelect");
    const periodSelect = document.getElementById("periodSelect");
    const liveStatsEl = document.getElementById("explorerLiveStats");

    if (!citySelect || !modelSelect || !periodSelect) return;

    const cities = Object.keys(DATA.series || {});
    if (!cities.length) return;

    citySelect.innerHTML = cities.map(city =>
        `<option value="${city}">${city}</option>`
    ).join("");

    function update() {
        const city = citySelect.value;
        const model = modelSelect.value;
        const period = periodSelect.value;
        const series = DATA.series[city];

        if (!series) return;

        const indices = series.dates.map((_, i) => i)
            .filter(i => period === "all" || series.period[i] === period);

        const labels = indices.map(i => series.dates[i]);
        const actual = indices.map(i => series.actual[i]);
        const predicted = indices.map(i => series[model]?.[i] ?? null);

        // Compute Live Metrics for selected City, Model & Period
        const validPairs = indices.map(i => ({
            act: series.actual[i],
            pred: series[model]?.[i]
        })).filter(p => p.act !== null && p.pred !== null && !isNaN(p.act) && !isNaN(p.pred));

        let liveMae = 0;
        let liveRmse = 0;
        let liveMeanAct = 0;

        if (validPairs.length > 0) {
            const sumErr = validPairs.reduce((acc, p) => acc + Math.abs(p.act - p.pred), 0);
            const sumSqErr = validPairs.reduce((acc, p) => acc + Math.pow(p.act - p.pred, 2), 0);
            const sumAct = validPairs.reduce((acc, p) => acc + p.act, 0);
            liveMae = sumErr / validPairs.length;
            liveRmse = Math.sqrt(sumSqErr / validPairs.length);
            liveMeanAct = sumAct / validPairs.length;
        }

        if (liveStatsEl) {
            liveStatsEl.innerHTML = `
                <div class="explorer-stat-item">
                    <span>SELECTION</span>
                    <strong>${city}</strong>
                </div>
                <div class="explorer-stat-item">
                    <span>PERIOD SAMPLES</span>
                    <strong>${formatInteger(validPairs.length)}</strong>
                </div>
                <div class="explorer-stat-item">
                    <span>SUBSET MAE</span>
                    <strong style="color:var(--emerald-dark)">${formatNumber(liveMae, 2)} µg/m³</strong>
                </div>
                <div class="explorer-stat-item">
                    <span>SUBSET RMSE</span>
                    <strong style="color:var(--sky-blue)">${formatNumber(liveRmse, 2)} µg/m³</strong>
                </div>
            `;
        }

        const modelLabel = modelSelect.options[modelSelect.selectedIndex]?.text || model;

        createChart("predictionChart", {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Actual PM2.5",
                        data: actual,
                        borderColor: COLORS.teal,
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.2
                    },
                    {
                        label: modelLabel,
                        data: predicted,
                        borderColor: COLORS.orange,
                        borderWidth: 1.8,
                        pointRadius: 0,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        position: "bottom"
                    },
                    tooltip: {
                        callbacks: {
                            title: items => formatDate(items[0]?.label),
                            label: context => ` ${context.dataset.label}: ${formatNumber(context.raw, 1)} µg/m³`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxTicksLimit: 10,
                            color: "#64748b"
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "PM2.5 (µg/m³)",
                            color: "#64748b"
                        },
                        grid: {
                            color: COLORS.gridLight
                        },
                        ticks: {
                            color: "#64748b"
                        }
                    }
                }
            }
        });
    }

    [citySelect, modelSelect, periodSelect].forEach(control => {
        control.addEventListener("change", update);
    });

    update();
}

/* --------------------------------------------------------------------------
   11. CLASSIFICATION METRICS CARDS
   -------------------------------------------------------------------------- */
function renderClassificationMetrics() {
    const rows = DATA.classification?.testMetrics || [];
    const row = rows[0];

    if (!row) {
        emptyMessage("classificationMetrics", "Classification test metrics unavailable.");
        return;
    }

    const metrics = [
        ["PRECISION", ["Precision", "precision"], "Test positive accuracy"],
        ["RECALL", ["Recall", "recall"], "Exceedance detection rate"],
        ["F1 SCORE", ["F1", "F1_score", "F1-score"], "Harmonic mean"],
        ["PR-AUC", ["PR_AUC", "PRAUC", "Average_Precision"], "Area under precision-recall"],
        ["ACCURACY", ["Accuracy", "accuracy"], "Overall test classification"]
    ];

    setHTML("classificationMetrics", metrics.map(([label, keys, note]) => {
        const value = getValue(row, keys);
        return `
            <article class="metric-card">
                <span>${label}</span>
                <strong>${formatNumber(value, 3)}</strong>
                <small>${note}</small>
            </article>
        `;
    }).join(""));
}

/* --------------------------------------------------------------------------
   12. CONFUSION MATRIX (FIG. 05)
   -------------------------------------------------------------------------- */
function renderConfusionMatrix() {
    const rows = DATA.classification?.testConfusionMatrix || [];
    if (!rows.length) {
        emptyMessage("confusionMatrix", "Confusion matrix data unavailable.");
        return;
    }

    let tn = null, fp = null, fn = null, tp = null;
    const first = rows[0];
    tn = getValue(first, ["TN", "True_Negative"]);
    fp = getValue(first, ["FP", "False_Positive"]);
    fn = getValue(first, ["FN", "False_Negative"]);
    tp = getValue(first, ["TP", "True_Positive"]);

    if ([tn, fp, fn, tp].some(v => v === null)) {
        if (rows.length >= 2) {
            const numericKeys = Object.keys(rows[0]).filter(k => toNumber(rows[0][k]) !== null);
            if (numericKeys.length >= 2) {
                tn = toNumber(rows[0][numericKeys[0]]);
                fp = toNumber(rows[0][numericKeys[1]]);
                fn = toNumber(rows[1][numericKeys[0]]);
                tp = toNumber(rows[1][numericKeys[1]]);
            }
        }
    }

    if ([tn, fp, fn, tp].some(v => v === null)) {
        emptyMessage("confusionMatrix", "Could not identify confusion matrix columns.");
        return;
    }

    const total = tn + fp + fn + tp;
    const tnPct = total > 0 ? ((tn / total) * 100).toFixed(1) : "0";
    const fpPct = total > 0 ? ((fp / total) * 100).toFixed(1) : "0";
    const fnPct = total > 0 ? ((fn / total) * 100).toFixed(1) : "0";
    const tpPct = total > 0 ? ((tp / total) * 100).toFixed(1) : "0";

    setHTML("confusionMatrix", `
        <table class="confusion-table">
            <thead>
                <tr>
                    <th></th>
                    <th>PREDICTED NEGATIVE (≤ 90)</th>
                    <th>PREDICTED POSITIVE (> 90)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>ACTUAL NEGATIVE</th>
                    <td>
                        <strong>${formatInteger(tn)}</strong>
                        <span>True Negative (${tnPct}%)</span>
                    </td>
                    <td>
                        <strong style="color:var(--coral-rose)">${formatInteger(fp)}</strong>
                        <span style="color:var(--coral-rose)">False Positive (${fpPct}%)</span>
                    </td>
                </tr>
                <tr>
                    <th>ACTUAL POSITIVE</th>
                    <td>
                        <strong style="color:var(--amber-gold)">${formatInteger(fn)}</strong>
                        <span style="color:var(--amber-gold)">False Negative (${fnPct}%)</span>
                    </td>
                    <td>
                        <strong style="color:var(--emerald-light)">${formatInteger(tp)}</strong>
                        <span style="color:var(--emerald-light)">True Positive (${tpPct}%)</span>
                    </td>
                </tr>
            </tbody>
        </table>
    `);
}

/* --------------------------------------------------------------------------
   13. CLASSIFICATION THRESHOLD CURVE (FIG. 06)
   -------------------------------------------------------------------------- */
function renderThresholdChart() {
    const rows = DATA.classification?.thresholdCurves || [];
    if (!rows.length) {
        emptyMessage("thresholdChart", "Classification threshold records unavailable.");
        return;
    }

    const models = [...new Set(rows.map(row => getValue(row, ["Model", "model"])))].filter(Boolean);
    const datasets = [];

    models.forEach((model, index) => {
        const modelRows = rows.filter(row => getValue(row, ["Model", "model"]) === model)
            .sort((a, b) => toNumber(getValue(a, ["Threshold", "threshold"])) - toNumber(getValue(b, ["Threshold", "threshold"])));

        datasets.push({
            label: `${model} — Precision`,
            data: modelRows.map(row => ({
                x: toNumber(getValue(row, ["Threshold", "threshold"])),
                y: toNumber(getValue(row, ["Precision", "precision"]))
            })),
            borderColor: index === 0 ? COLORS.tealLight : COLORS.blue,
            backgroundColor: "transparent",
            borderWidth: 2,
            pointRadius: 2.5,
            tension: 0.2
        });

        datasets.push({
            label: `${model} — Recall`,
            data: modelRows.map(row => ({
                x: toNumber(getValue(row, ["Threshold", "threshold"])),
                y: toNumber(getValue(row, ["Recall", "recall"]))
            })),
            borderColor: index === 0 ? COLORS.orange : COLORS.purple,
            backgroundColor: "transparent",
            borderWidth: 1.8,
            borderDash: [5, 4],
            pointRadius: 2.5,
            tension: 0.2
        });
    });

    createChart("thresholdChart", {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#cbd5e1" }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw.y, 3)} (Threshold ${formatNumber(ctx.raw.x, 2)})`
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: "Classification threshold",
                        color: "#94a3b8"
                    },
                    grid: { color: COLORS.gridDark },
                    ticks: { color: "#94a3b8" }
                },
                y: {
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: "Score",
                        color: "#94a3b8"
                    },
                    grid: { color: COLORS.gridDark },
                    ticks: { color: "#94a3b8" }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   14. ERROR ANALYSIS BY CITY (FIG. 07)
   -------------------------------------------------------------------------- */
function renderCityErrors() {
    const rows = DATA.regression?.errorsByCity || [];
    if (!rows.length) {
        emptyMessage("cityErrorChart", "City-wise error records unavailable.");
        return;
    }

    const labels = rows.map(row => getValue(row, ["City", "city"]));
    const values = rows.map(row => toNumber(getValue(row, ["MAE", "mae"])));

    createChart("cityErrorChart", {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "MAE (µg/m³)",
                data: values,
                backgroundColor: COLORS.teal,
                borderRadius: 4
            }]
        },
        options: {
            ...createBarOptions(true, false),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` SVR MAE: ${formatNumber(ctx.raw, 2)} µg/m³`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   15. MONTHLY ERROR CHART (FIG. 08)
   -------------------------------------------------------------------------- */
function renderMonthlyErrors() {
    const rows = DATA.regression?.errorsByMonth || [];
    if (!rows.length) {
        emptyMessage("monthlyErrorChart", "Monthly error records unavailable.");
        return;
    }

    const labels = rows.map(row => getValue(row, ["Month", "month", "YearMonth", "year_month"]));
    const values = rows.map(row => toNumber(getValue(row, ["MAE", "mae"])));

    createChart("monthlyErrorChart", {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "MAE (µg/m³)",
                data: values,
                borderColor: COLORS.teal,
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                fill: true,
                tension: 0.25,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Test MAE: ${formatNumber(ctx.raw, 2)} µg/m³`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { maxTicksLimit: 8, color: "#64748b" },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#64748b" },
                    grid: { color: COLORS.gridLight }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   16. PERIOD COMPARISON CHART (FIG. 09)
   -------------------------------------------------------------------------- */
function renderPeriodChart() {
    const rows = DATA.regression?.metricsByPeriod || [];
    if (!rows.length) {
        emptyMessage("periodChart", "Period-wise regression metrics unavailable.");
        return;
    }

    const models = [...new Set(rows.map(row => getValue(row, ["Model", "model"])))].filter(Boolean);
    const periods = [...new Set(rows.map(row => getValue(row, ["Period", "period"])))].filter(Boolean);

    const datasets = models.map((model, index) => {
        const color = [COLORS.teal, COLORS.orange, COLORS.blue][index % 3];
        return {
            label: model,
            data: periods.map(period => {
                const row = rows.find(item =>
                    getValue(item, ["Model", "model"]) === model &&
                    getValue(item, ["Period", "period"]) === period
                );
                return row ? toNumber(getValue(row, ["MAE", "mae"])) : null;
            }),
            backgroundColor: color,
            borderRadius: 4
        };
    });

    createChart("periodChart", {
        type: "bar",
        data: {
            labels: periods,
            datasets
        },
        options: {
            ...createBarOptions(false, false),
            plugins: {
                legend: { position: "bottom" },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw, 2)} µg/m³`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   17. WORST PREDICTIONS TABLE (TABLE 01)
   -------------------------------------------------------------------------- */
function renderWorstErrors() {
    const rows = DATA.regression?.worstErrors || [];
    if (!rows.length) {
        setHTML("worstErrorsTable", '<tr><td colspan="6">No worst-error records available.</td></tr>');
        return;
    }

    const html = rows.map(row => {
        const date = getValue(row, ["date", "Target_Date", "Date"]);
        const city = getValue(row, ["city", "City"]);
        const actual = getValue(row, ["actual", "Actual", "PM2.5_next_day"]);
        const predicted = getValue(row, ["predicted", "Prediction", "SVR_prediction"]);
        const error = getValue(row, ["error", "Absolute_Error", "Abs_Error"]);
        const period = getValue(row, ["period", "Period"]);

        return `
            <tr>
                <td><strong>${formatDate(date)}</strong></td>
                <td>${city ?? "—"}</td>
                <td>${formatNumber(actual, 1)}</td>
                <td>${formatNumber(predicted, 1)}</td>
                <td><span class="error-badge-positive">+${formatNumber(error, 1)}</span></td>
                <td>${period ?? "—"}</td>
            </tr>
        `;
    }).join("");

    setHTML("worstErrorsTable", html);
}

/* --------------------------------------------------------------------------
   18. UNSEEN CITIES EVALUATION (FIG. 10)
   -------------------------------------------------------------------------- */
function renderUnseenCities() {
    const rows = DATA.unseen?.metricsByCity || [];
    if (!rows.length) {
        emptyMessage("unseenCityMetrics", "Unseen-city metrics unavailable.");
        return;
    }

    const html = rows.map(row => {
        const city = getValue(row, ["City", "city"], "Unknown");
        const mae = getValue(row, ["MAE", "mae"]);
        const rmse = getValue(row, ["RMSE", "rmse"]);
        const count = getValue(row, ["Rows", "Count", "N"]);

        return `
            <article class="unseen-card">
                <h3>${city}</h3>
                <div class="unseen-stat">
                    <span>MAE</span>
                    <strong>${formatNumber(mae, 2)} µg/m³</strong>
                </div>
                <div class="unseen-stat">
                    <span>RMSE</span>
                    <strong>${formatNumber(rmse, 2)} µg/m³</strong>
                </div>
                <div class="unseen-stat">
                    <span>Observations</span>
                    <strong>${formatInteger(count)}</strong>
                </div>
            </article>
        `;
    }).join("");

    setHTML("unseenCityMetrics", html);

    createChart("unseenChart", {
        type: "bar",
        data: {
            labels: rows.map(row => getValue(row, ["City", "city"])),
            datasets: [
                {
                    label: "SVR MAE (µg/m³)",
                    data: rows.map(row => toNumber(getValue(row, ["MAE", "mae"]))),
                    backgroundColor: COLORS.teal,
                    borderRadius: 4
                },
                {
                    label: "SVR RMSE (µg/m³)",
                    data: rows.map(row => toNumber(getValue(row, ["RMSE", "rmse"]))),
                    backgroundColor: COLORS.orange,
                    borderRadius: 4
                }
            ]
        },
        options: {
            ...createBarOptions(false, true),
            plugins: {
                legend: { position: "bottom", labels: { color: "#cbd5e1" } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${formatNumber(ctx.raw, 2)} µg/m³`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   19. FEATURE IMPORTANCE (FIG. 11)
   -------------------------------------------------------------------------- */
function renderImportance() {
    const rows = DATA.interpretation?.randomForestImportance || [];
    if (!rows.length) {
        emptyMessage("importanceChart", "Feature-importance records unavailable.");
        return;
    }

    const featureKey = Object.keys(rows[0]).find(k => ["feature", "feature_name", "variable"].includes(normalizeKey(k)));
    const importanceKey = Object.keys(rows[0]).find(k => ["importance", "feature_importance", "importance_score"].includes(normalizeKey(k)));

    if (!featureKey || !importanceKey) {
        emptyMessage("importanceChart", "Could not identify feature and importance columns.");
        return;
    }

    const sorted = [...rows].sort((a, b) => Number(b[importanceKey]) - Number(a[importanceKey]));

    createChart("importanceChart", {
        type: "bar",
        data: {
            labels: sorted.map(row => row[featureKey]),
            datasets: [{
                label: "Feature importance",
                data: sorted.map(row => toNumber(row[importanceKey])),
                backgroundColor: COLORS.teal,
                borderRadius: 4
            }]
        },
        options: {
            ...createBarOptions(true, false),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Importance: ${formatNumber(ctx.raw, 4)}`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   20. LASSO COEFFICIENTS (FIG. 12)
   -------------------------------------------------------------------------- */
function renderLasso() {
    const rows = DATA.interpretation?.lassoCoefficients || [];
    if (!rows.length) {
        emptyMessage("lassoChart", "Lasso coefficient records unavailable.");
        return;
    }

    const featureKey = Object.keys(rows[0]).find(k => ["feature", "feature_name", "variable"].includes(normalizeKey(k)));
    const coefficientKey = Object.keys(rows[0]).find(k => ["coefficient", "coef", "lasso_coefficient"].includes(normalizeKey(k)));

    if (!featureKey || !coefficientKey) {
        emptyMessage("lassoChart", "Could not identify feature and coefficient columns.");
        return;
    }

    const sorted = [...rows].sort((a, b) => Math.abs(Number(b[coefficientKey])) - Math.abs(Number(a[coefficientKey])));

    createChart("lassoChart", {
        type: "bar",
        data: {
            labels: sorted.map(row => row[featureKey]),
            datasets: [{
                label: "Lasso coefficient",
                data: sorted.map(row => toNumber(row[coefficientKey])),
                backgroundColor: sorted.map(row => Number(row[coefficientKey]) >= 0 ? COLORS.teal : COLORS.orange),
                borderRadius: 4
            }]
        },
        options: {
            ...createBarOptions(true, false),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ` Coefficient: ${formatNumber(ctx.raw, 4)}`
                    }
                }
            }
        }
    });
}

/* --------------------------------------------------------------------------
   21. TABLE STATUS ENHANCEMENTS
   -------------------------------------------------------------------------- */
function enhanceStaticTables() {
    // Add status pill badges to the screening table
    const tableCells = document.querySelectorAll(".table-wrapper td");
    tableCells.forEach(td => {
        const text = td.textContent.trim();
        if (text === "Passed") {
            td.innerHTML = `<span class="status-pill status-passed">Passed</span>`;
        } else if (text === "Below threshold") {
            td.innerHTML = `<span class="status-pill status-failed">Below threshold</span>`;
        }
    });
}

/* --------------------------------------------------------------------------
   22. INITIALIZE ALL WEBSITE COMPONENTS
   -------------------------------------------------------------------------- */
function initializeWebsite() {
    initializeNavigation();
    initializeScrollSpy();
    initializeScrollProgress();

    renderOverview();
    renderHeroChart();
    renderMissingness();
    renderCoverage();
    renderRegressionMetrics();
    renderRegressionComparison();
    renderPredictionExplorer();
    renderClassificationMetrics();
    renderConfusionMatrix();
    renderThresholdChart();
    renderCityErrors();
    renderMonthlyErrors();
    renderPeriodChart();
    renderWorstErrors();
    renderUnseenCities();
    renderImportance();
    renderLasso();
    enhanceStaticTables();

    console.log("PM2.5 research editorial platform initialized.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWebsite);
} else {
    initializeWebsite();
}
