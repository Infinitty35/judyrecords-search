// ============================================================
// app.js — JudyRecords Search Frontend Logic
// ============================================================

let currentPage = 1;
let currentSearchType = "party";
let currentQuery = {};

// -------------------------------------------------------
// Switch between the two search tabs
// -------------------------------------------------------
function switchTab(tab) {
  currentSearchType = tab;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

  const tabIndex = tab === "party" ? 0 : 1;
  document.querySelectorAll(".tab")[tabIndex].classList.add("active");
  document.getElementById(`tab-${tab}`).classList.add("active");

  // Clear results when switching tabs
  hideResults();
}

// -------------------------------------------------------
// Party Name Search — triggered by the first tab's button
// -------------------------------------------------------
function searchParties() {
  const name = document.getElementById("partyName").value.trim();
  const state = document.getElementById("partyState").value;

  if (!name) {
    alert("Please enter a name to search.");
    document.getElementById("partyName").focus();
    return;
  }

  currentPage = 1;
  currentQuery = { name, state };
  runPartySearch();
}

async function runPartySearch() {
  const { name, state } = currentQuery;
  showLoading(`Searching records for "${name}"${state ? ` in ${state}` : ""}...`);

  let url = `/api/parties?name=${encodeURIComponent(name)}&page=${currentPage}&rows=10`;
  if (state) url += `&state=${encodeURIComponent(state)}`;

  await fetchAndDisplay(url, `Results for "${name}"`);
}

// -------------------------------------------------------
// Full-Text Search — triggered by the second tab's button
// -------------------------------------------------------
function searchFullText() {
  const q = document.getElementById("fulltextQuery").value.trim();

  if (!q) {
    alert("Please enter a search query.");
    document.getElementById("fulltextQuery").focus();
    return;
  }

  currentPage = 1;
  currentQuery = { q };
  runFullTextSearch();
}

async function runFullTextSearch() {
  const { q } = currentQuery;
  showLoading(`Searching full text for "${q}"...`);

  const url = `/api/fulltext?q=${encodeURIComponent(q)}&page=${currentPage}&rows=10`;
  await fetchAndDisplay(url, `Full-text results for "${q}"`);
}

// -------------------------------------------------------
// Core fetch function — calls our backend, displays results
// -------------------------------------------------------
async function fetchAndDisplay(url, title) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    hideLoading();

    if (!response.ok || data.error) {
      showError(data.error || "An unexpected error occurred.");
      return;
    }

    displayResults(data, title);

  } catch (err) {
    hideLoading();
    showError("Could not reach the server. Make sure your Node.js server is running (npm start).");
    console.error(err);
  }
}

// -------------------------------------------------------
// Display search results as cards
// -------------------------------------------------------
function displayResults(data, title) {
  const list = document.getElementById("results-list");
  const resultsArea = document.getElementById("results-area");
  const resultsTitle = document.getElementById("results-title");
  const resultsCount = document.getElementById("results-count");

  resultsArea.classList.remove("hidden");
  resultsTitle.textContent = title;

  // Handle different response formats from the two APIs
  const hits = data.hits || data.results || data.cases || data.parties || [];
  const total = data.total || data.totalHits || hits.length || 0;

  resultsCount.textContent = `${total.toLocaleString()} record${total !== 1 ? "s" : ""} found`;

  if (hits.length === 0) {
    list.innerHTML = `
      <div class="no-results">
        <div class="icon">🔍</div>
        <h4>No records found</h4>
        <p>Try a different spelling, remove the state filter, or use the Full-Text Search tab.</p>
      </div>`;
    hidePagination();
    return;
  }

  list.innerHTML = hits.map(hit => buildResultCard(hit)).join("");
  updatePagination(total);
}

// -------------------------------------------------------
// Build a single result card from a hit object
// -------------------------------------------------------
function buildResultCard(hit) {
  // Field names vary between the two APIs — handle both
  const caseName   = hit.case_name || hit.caseName || hit.name || hit.title || "Unknown Case";
  const caseType   = hit.case_type || hit.caseType || hit.type || "";
  const court      = hit.court || hit.courtName || "";
  const state      = hit.state || hit.courtState || "";
  const filedDate  = hit.date_filed || hit.dateFiled || hit.fileDate || "";
  const caseNumber = hit.case_number || hit.caseNumber || hit.docketNumber || "";
  const snippet    = hit.snippet || hit.summary || hit.description || "";
  const caseId     = hit.case_id || hit.caseId || hit.id || "";
  const recordUrl  = hit.url || (caseId ? `https://www.judyrecords.com/record/${caseId}` : null);

  const formattedDate = filedDate ? new Date(filedDate).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  }) : "";

  return `
    <div class="result-card">
      <div class="result-card-top">
        <div class="case-name">${escapeHtml(caseName)}</div>
        ${caseType ? `<span class="case-type-badge">${escapeHtml(caseType)}</span>` : ""}
      </div>
      <div class="case-meta">
        ${court    ? `<span class="meta-item"><span class="meta-label">Court:</span> ${escapeHtml(court)}</span>` : ""}
        ${state    ? `<span class="meta-item"><span class="meta-label">State:</span> ${escapeHtml(state)}</span>` : ""}
        ${caseNumber ? `<span class="meta-item"><span class="meta-label">Case #:</span> ${escapeHtml(caseNumber)}</span>` : ""}
        ${formattedDate ? `<span class="meta-item"><span class="meta-label">Filed:</span> ${formattedDate}</span>` : ""}
      </div>
      ${snippet ? `<div class="case-snippet">${escapeHtml(snippet)}</div>` : ""}
      ${recordUrl ? `<a class="view-link" href="${escapeHtml(recordUrl)}" target="_blank" rel="noopener">View Full Record →</a>` : ""}
    </div>`;
}

// -------------------------------------------------------
// Pagination controls
// -------------------------------------------------------
function updatePagination(total) {
  const totalPages = Math.ceil(total / 10);
  if (totalPages <= 1) { hidePagination(); return; }

  document.getElementById("pagination").classList.remove("hidden");
  document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById("btn-prev").disabled = currentPage <= 1;
  document.getElementById("btn-next").disabled = currentPage >= totalPages;
}

function hidePagination() {
  document.getElementById("pagination").classList.add("hidden");
}

function changePage(direction) {
  currentPage += direction;
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (currentSearchType === "party") runPartySearch();
  else runFullTextSearch();
}

// -------------------------------------------------------
// UI helpers
// -------------------------------------------------------
function showLoading(message) {
  const resultsArea = document.getElementById("results-area");
  resultsArea.classList.remove("hidden");
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("results-list").innerHTML = "";
  document.getElementById("error-box").classList.add("hidden");
  document.getElementById("pagination").classList.add("hidden");
  document.getElementById("results-title").textContent = message || "Searching...";
  document.getElementById("results-count").textContent = "";
  document.querySelectorAll(".btn-search").forEach(b => b.disabled = true);
}

function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
  document.querySelectorAll(".btn-search").forEach(b => b.disabled = false);
}

function showError(message) {
  const box = document.getElementById("error-box");
  box.textContent = "⚠️ " + message;
  box.classList.remove("hidden");
}

function hideResults() {
  document.getElementById("results-area").classList.add("hidden");
  document.getElementById("results-list").innerHTML = "";
}

// Prevent XSS by escaping any HTML in the API response
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Allow pressing Enter to trigger search
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("partyName").addEventListener("keydown", e => {
    if (e.key === "Enter") searchParties();
  });
  document.getElementById("fulltextQuery").addEventListener("keydown", e => {
    if (e.key === "Enter") searchFullText();
  });
});
