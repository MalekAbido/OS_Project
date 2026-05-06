// ─── State ───────────────────────────────────────────────────────────────
let processCounter = 1;
let currentPayload = null; // Saves the input data to retrieve AT/BT later

// Color palette for Gantt chart process blocks
const processColors = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-sky-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-cyan-400",
  "bg-slate-500",
  "bg-lime-400",
  "bg-orange-400",
  "bg-teal-400",
];
const processColorMap = {}; // { "P1": "bg-blue-400", ... }

// ─── 1. Initialization ────────────────────────────────────────────────────
function init() {
  addProcessRow("P1", 0, 7, 3);
  addProcessRow("P2", 2, 4, 1);
  addProcessRow("P3", 4, 2, 4);
  addProcessRow("P4", 5, 5, 2);
  addProcessRow("P5", 10, 3, 5);
  addProcessRow("P6", 30, 2, 1);

  // Also set Time Quantum to 3 for this scenario
  document.getElementById("time_quantum").value = 3;
}

// ─── 2. Row Management ────────────────────────────────────────────────────
function addProcessRow(id = "", arrival = "", burst = "", priority = "") {
  const tbody = document.getElementById("process-tbody");
  const rowId = `row-${processCounter++}`;
  const autoId = id || `P${processCounter - 1}`;

  const tr = document.createElement("tr");
  tr.id = rowId;
  tr.className = "hover:bg-slate-50 transition";
  tr.innerHTML = `
                <td class="p-2">
                    <input type="text" value="${autoId}" oninput="clearErrorHighlight(this)"
                           class="proc-id w-full px-3 py-1.5 border border-slate-300 rounded
                                  focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. P1">
                </td>
                <td class="p-2">
                    <input type="number" min="1" value="${arrival}" oninput="clearErrorHighlight(this)"
                           class="proc-arrival w-full px-3 py-1.5 border border-slate-300 rounded
                                  focus:ring-1 focus:ring-blue-500 outline-none text-left">
                </td>
                <td class="p-2">
                    <input type="number" min="1" value="${burst}" oninput="clearErrorHighlight(this)"
                           class="proc-burst w-full px-3 py-1.5 border border-slate-300 rounded
                                  focus:ring-1 focus:ring-blue-500 outline-none text-left">
                </td>
                <td class="p-2">
                    <input type="number" min="1" value="${priority}" oninput="clearErrorHighlight(this)"
                           class="proc-priority w-full px-3 py-1.5 border border-slate-300 rounded
                                  focus:ring-1 focus:ring-blue-500 outline-none text-left">
                </td>
                <td class="p-2 text-center">
                    <button onclick="removeRow('${rowId}')"
                            class="text-slate-400 hover:text-red-500 transition px-2 py-1" title="Remove Process">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
  tbody.appendChild(tr);
}

function removeRow(rowId) {
  const tbody = document.getElementById("process-tbody");
  if (tbody.children.length <= 1) {
    showError("You must have at least one process.");
    return;
  }
  document.getElementById(rowId).remove();
}

// ─── 3. Validation UI Helpers ─────────────────────────────────────────────
function showError(msgHTML) {
  const alert = document.getElementById("error-alert");
  document.getElementById("error-text").innerHTML = msgHTML;
  alert.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideError() {
  document.getElementById("error-alert").classList.add("hidden");
}

function clearErrorHighlight(inputEl) {
  // Removes red borders as soon as the user starts typing
  inputEl.classList.remove("border-red-500", "bg-red-50", "text-red-900");
  inputEl.classList.add("border-slate-300");
}

function clearAllValidationHighlights() {
  document.querySelectorAll(".border-red-500").forEach((el) => {
    if (el.tagName === "INPUT") clearErrorHighlight(el);
  });
}

function setInvalid(inputEl) {
  inputEl.classList.remove("border-slate-300");
  inputEl.classList.add("border-red-500", "bg-red-50", "text-red-900");
}

function isNumeric(val) {
  return /^-?\d+$/.test(val);
}

function containsLetters(val) {
  return /[a-zA-Z]/.test(val);
}

// ─── 4. Validation & Simulation Trigger ───────────────────────────────────
function triggerSimulation() {
  hideError();
  clearAllValidationHighlights();

  let errors = [];

  // Validate global fields
  const quantumInput = document.getElementById("time_quantum");
  const quantumRaw = quantumInput.value.trim();
  const priorityRule = document.getElementById("priority_rule").value;

  if (containsLetters(quantumRaw)) {
    setInvalid(quantumInput);
    errors.push("<strong>Global:</strong> Time Quantum contains letters. Please enter numbers only.");
  } else if (!quantumRaw || !isNumeric(quantumRaw) || Number(quantumRaw) <= 0) {
    setInvalid(quantumInput);
    errors.push("<strong>Global:</strong> Time Quantum must be a positive integer greater than 0.");
  }

  const rows = document.querySelectorAll("#process-tbody tr");
  if (rows.length === 0) {
    errors.push("Please add at least one process.");
  }

  const payload = {
    time_quantum: Number(quantumRaw),
    priority_rule: (priorityRule=="lower_is_higher" ? 0 : 1),
    num_processes: rows.length,
    processes: [],
  };
  const idSet = new Set();

  for (let i = 0; i < rows.length; i++) {
    const idInput = rows[i].querySelector(".proc-id");
    const arrivalInput = rows[i].querySelector(".proc-arrival");
    const burstInput = rows[i].querySelector(".proc-burst");
    const priorityInput = rows[i].querySelector(".proc-priority");

    const id = idInput.value.trim();
    const arrival = arrivalInput.value.trim();
    const burst = burstInput.value.trim();
    const priority = priorityInput.value.trim();

    let rowErrors = [];

    if (!id) {
      setInvalid(idInput);
      rowErrors.push("Missing ID");
    } else if (idSet.has(id)) {
      setInvalid(idInput);
      rowErrors.push(`Duplicate ID '${id}'`);
    }

    if (containsLetters(arrival)) {
      setInvalid(arrivalInput);
      rowErrors.push("Arrival contains letters (should have numbers only)");
    } else if (arrival === "" || !isNumeric(arrival) || Number(arrival) < 0) {
      setInvalid(arrivalInput);
      rowErrors.push("Invalid Arrival Time (must be number ≥ 0)");
    }

    if (containsLetters(burst)) {
      setInvalid(burstInput);
      rowErrors.push("Burst contains letters (should have numbers only)");
    } else if (burst === "" || !isNumeric(burst) || Number(burst) <= 0) {
      setInvalid(burstInput);
      rowErrors.push("Invalid Burst Time (must be number > 0)");
    }

    if (containsLetters(priority)) {
      setInvalid(priorityInput);
      rowErrors.push("Priority contains letters (should have numbers only)");
    } else if (priority === "" || !isNumeric(priority) || Number(priority) < 1) {
      setInvalid(priorityInput);
      rowErrors.push("Invalid Priority Time (must be number ≥ 1)");
    }

    if (rowErrors.length > 0) {
      errors.push(
        `<strong>Row ${i + 1}:</strong> ${rowErrors.join(", ")}`,
      );
    } else {
      idSet.add(id);
      if (!processColorMap[id]) {
        processColorMap[id] =
          processColors[
            Object.keys(processColorMap).length % processColors.length
          ];
      }
      payload.processes.push({
        process_id: id,
        arrival_time: Number(arrival),
        burst_time: Number(burst),
        priority: Number(priority),
      });
    }
  }

  if (errors.length > 0) {
    const formattedErrors = `<ul class="list-disc pl-5 space-y-1"><li>${errors.join("</li><li>")}</li></ul>`;
    return showError(formattedErrors);
  }

  // Save the valid payload so we can look up AT and BT for the metrics table
  payload.processes.sort((a, b) => a.arrival_time - b.arrival_time);
  currentPayload = payload;

  const btn = document.getElementById("btn-simulate");
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Simulating...`;
  btn.disabled = true;

  console.log(
    "Sending to /api/simulate:",
    JSON.stringify(payload, null, 2),
  );

  // MOCK DATA
  
  const MOCK_BACKEND_RESPONSE = {
    round_robin: {
      gantt_chart: [
        { process_id: "P1", start_time: 0, end_time: 3 },
        { process_id: "P2", start_time: 3, end_time: 6 },
        { process_id: "P1", start_time: 6, end_time: 9 },
        { process_id: "P3", start_time: 9, end_time: 11 },
        { process_id: "P4", start_time: 11, end_time: 14 },
        { process_id: "P2", start_time: 14, end_time: 15 },
        { process_id: "P1", start_time: 15, end_time: 16 },
        { process_id: "P5", start_time: 16, end_time: 19 },
        { process_id: "P4", start_time: 19, end_time: 21 },
        { process_id: "P6", start_time: 30, end_time: 32 },
      ],
      metrics: [
        {
          process_id: "P1",
          waiting_time: 9,
          turnaround_time: 16,
          response_time: 0,
        },
        {
          process_id: "P2",
          waiting_time: 9,
          turnaround_time: 13,
          response_time: 1,
        },
        {
          process_id: "P3",
          waiting_time: 5,
          turnaround_time: 7,
          response_time: 5,
        },
        {
          process_id: "P4",
          waiting_time: 11,
          turnaround_time: 16,
          response_time: 6,
        },
        {
          process_id: "P5",
          waiting_time: 6,
          turnaround_time: 9,
          response_time: 6,
        },
        {
          process_id: "P6",
          waiting_time: 0,
          turnaround_time: 2,
          response_time: 0,
        },
      ],
      averages: {
        avg_wt: 6.67,
        avg_tat: 10.5,
        avg_rt: 3.0,
      },
    },
    priority_preemptive: {
      gantt_chart: [
        { process_id: "P1", start_time: 0, end_time: 2 },
        { process_id: "P2", start_time: 2, end_time: 6 },
        { process_id: "P4", start_time: 6, end_time: 11 },
        { process_id: "P1", start_time: 11, end_time: 16 },
        { process_id: "P3", start_time: 16, end_time: 18 },
        { process_id: "P5", start_time: 18, end_time: 21 },
        { process_id: "P6", start_time: 30, end_time: 32 },
      ],
      metrics: [
        {
          process_id: "P1",
          waiting_time: 9,
          turnaround_time: 16,
          response_time: 0,
        },
        {
          process_id: "P2",
          waiting_time: 0,
          turnaround_time: 4,
          response_time: 0,
        },
        {
          process_id: "P3",
          waiting_time: 12,
          turnaround_time: 14,
          response_time: 12,
        },
        {
          process_id: "P4",
          waiting_time: 1,
          turnaround_time: 6,
          response_time: 1,
        },
        {
          process_id: "P5",
          waiting_time: 8,
          turnaround_time: 11,
          response_time: 8,
        },
        {
          process_id: "P6",
          waiting_time: 0,
          turnaround_time: 2,
          response_time: 0,
        },
      ],
      averages: {
        avg_wt: 5.0,
        avg_tat: 8.83,
        avg_rt: 3.5,
      },
    },
  };

  setTimeout(() => {
    processAndRenderResults(MOCK_BACKEND_RESPONSE);
    const btn = document.getElementById("btn-simulate");
    btn.innerHTML = `<span>Run Simulation</span><i class="fa-solid fa-play ml-2"></i>`;
    btn.disabled = false;
  }, 500); // 500ms delay to simulate network loading

  // Connection with the Backend

  // fetch("/api/simulate", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // })
  //   .then((response) => {
  //     if (!response.ok) {
  //       return response.json().then((errData) => {
  //         throw new Error(
  //           errData.error || `Server returned HTTP ${response.status}`,
  //         );
  //       });
  //     }
  //     return response.json();
  //   })
  //   .then((data) => {
  //     if (!data.round_robin || !data.priority_preemptive) {
  //       throw new Error(
  //         "Unexpected response format from scheduler. Check backend output.",
  //       );
  //     }
  //     processAndRenderResults(data);
  //   })
  //   .catch((err) => {
  //     const isNetworkError = err instanceof TypeError;
  //     const msg = isNetworkError
  //       ? "Cannot reach the Flask server. Make sure 'python app.py' is running."
  //       : err.message;
  //     showError(`<strong>Simulation failed:</strong> ${msg}`);
  //   })
  //   .finally(() => {
  //     btn.innerHTML = `<span>Run Simulation</span><i class="fa-solid fa-play ml-2"></i>`;
  //     btn.disabled = false;
  //   });
}

// ─── 5. View Switching ────────────────────────────────────────────────────
function showInputView() {
  document.getElementById("view-results").classList.add("hidden");
  document.getElementById("view-input").classList.remove("hidden");
}

function showResultsView() {
  document.getElementById("view-input").classList.add("hidden");
  document.getElementById("view-results").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── 6. Rendering ─────────────────────────────────────────────────────────
function processAndRenderResults(data) {
  renderComparisonCards(
    data.round_robin.averages,
    data.priority_preemptive.averages,
  );

  const getMaxTime = (chart) =>
    chart.length > 0 ? chart[chart.length - 1].end_time : 0;
  const globalMax = Math.max(
    getMaxTime(data.round_robin.gantt_chart),
    getMaxTime(data.priority_preemptive.gantt_chart),
    1,
  );

  renderGantt("rr-gantt", data.round_robin.gantt_chart, globalMax);
  renderMetricsTable("rr-metrics-body", data.round_robin.metrics);

  renderGantt(
    "priority-gantt",
    data.priority_preemptive.gantt_chart,
    globalMax,
  );
  renderMetricsTable(
    "priority-metrics-body",
    data.priority_preemptive.metrics,
  );

  showResultsView();
}

function renderComparisonCards(rrAvg, prioAvg) {
  const container = document.getElementById("comparison-cards-container");

  const card = (label, rrVal, prioVal) => {
    const rrWins = rrVal <= prioVal;
    const prioWins = prioVal <= rrVal;
    return `
                <div class="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-col items-center">
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">${label}</span>
                    <div class="flex items-start justify-between w-full px-2 pt-2">
                        <div class="text-center w-1/3">
                            <div class="text-2xl font-bold ${rrWins ? "text-green-600" : "text-slate-700"}">${rrVal.toFixed(2)}</div>
                            <div class="text-xs font-medium text-slate-500 mt-1">Round Robin</div>
                            ${rrWins && !prioWins ? '<div class="text-xs text-green-500 font-bold mt-1">✓ Better</div>' : '<div class="h-5 mt-1"></div>'}
                        </div>
                        <div class="text-slate-300 font-light text-2xl px-2 mt-[-2px] w-1/3 text-center">vs</div>
                        <div class="text-center w-1/3">
                            <div class="text-2xl font-bold ${prioWins ? "text-green-600" : "text-slate-700"}">${prioVal.toFixed(2)}</div>
                            <div class="text-xs font-medium text-slate-500 mt-1">Priority</div>
                            ${prioWins && !rrWins ? '<div class="text-xs text-green-500 font-bold mt-1">✓ Better</div>' : '<div class="h-5 mt-1"></div>'}
                        </div>
                    </div>
                </div>`;
  };

  container.innerHTML =
    card("Avg Waiting Time (WT)", rrAvg.avg_wt, prioAvg.avg_wt) +
    card("Avg Turnaround Time (TAT)", rrAvg.avg_tat, prioAvg.avg_tat) +
    card("Avg Response Time (RT)", rrAvg.avg_rt, prioAvg.avg_rt);
}

function renderGantt(containerId, ganttData, totalTime) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!ganttData || ganttData.length === 0) return;

  let cursor = 0;

  ganttData.forEach((block, index) => {
    if (block.start_time > cursor) {
      const idlePct = ((block.start_time - cursor) / totalTime) * 100;
      const idle = document.createElement("div");
      idle.className =
        "gantt-bar bg-slate-200 border-r border-slate-300 flex items-center justify-center relative";
      idle.style.width = `${idlePct}%`;

      idle.innerHTML = `
                <span class="text-xs text-slate-400 font-mono truncate px-1">IDLE</span>
                <span class="absolute -bottom-1.5 right-0 w-px h-1.5 bg-slate-300"></span>
                <span class="time-label right">${block.start_time}</span>`;

      if (index === 0) {
        idle.innerHTML += `
                <span class="absolute -bottom-1.5 left-0 w-px h-1.5 bg-slate-300"></span>
                <span class="time-label left">${cursor}</span>`;
      }
      container.appendChild(idle);
    }

    const duration = block.end_time - block.start_time;
    const pct = (duration / totalTime) * 100;
    const color = processColorMap[block.process_id] || "bg-slate-400";

    const div = document.createElement("div");
    div.className = `gantt-bar ${color} border-r border-white/30 flex items-center justify-center
                                 text-white font-bold text-xs shadow-inner relative
                                 transition-all hover:brightness-110`;
    div.style.width = `${pct}%`;
    div.title = `${block.process_id}: ${block.start_time} → ${block.end_time}`;

    // Added a tiny vertical tick mark to anchor the timestamp perfectly
    let labels = `
            <span class="absolute -bottom-1.5 right-0 w-px h-1.5 bg-slate-400"></span>
            <span class="time-label right">${block.end_time}</span>
          `;

    if (index === 0 && block.start_time === 0) {
      labels += `
                <span class="absolute -bottom-1.5 left-0 w-px h-1.5 bg-slate-400"></span>
                <span class="time-label left">0</span>
            `;
    }

    div.innerHTML = `<span class="truncate px-1 relative z-10">${block.process_id}</span>${labels}`;
    container.appendChild(div);
    cursor = block.end_time;
  });
}

function renderMetricsTable(tbodyId, metricsData) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = "";
  if (!metricsData) return;

  metricsData.forEach((m) => {
    const color = processColorMap[m.process_id] || "bg-slate-400";

    // Lookup Arrival Time and Burst Time from the original payload
    let at = "-",
      bt = "-";
    if (currentPayload && currentPayload.processes) {
      const originalProc = currentPayload.processes.find(
        (p) => p.process_id === m.process_id,
      );
      if (originalProc) {
        at = originalProc.arrival_time;
        bt = originalProc.burst_time;
      }
    }

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50";
    tr.innerHTML = `
                    <td class="p-2 font-medium flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full ${color} inline-block flex-shrink-0"></span>
                        ${m.process_id}
                    </td>
                    <td class="p-2 text-right font-mono text-slate-600">${at}</td>
                    <td class="p-2 text-right font-mono text-slate-600">${bt}</td>
                    <td class="p-2 text-right font-mono text-slate-600">${m.waiting_time}</td>
                    <td class="p-2 text-right font-mono text-slate-600">${m.turnaround_time}</td>
                    <td class="p-2 text-right font-mono text-slate-600">${m.response_time}</td>
                `;
    tbody.appendChild(tr);
  });
}

window.onload = init;
