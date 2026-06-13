// ============================================================
// server.js - JudyRecords Background Search App Backend
// This server securely stores your API key and forwards
// requests to the JudyRecords API on behalf of your browser.
// ============================================================

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JUDY_BASE_URL = "https://api.judyrecords.com/v1";
const API_KEY = process.env.JUDYRECORDS_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// -------------------------------------------------------
// ROUTE 1: Full-Text Search
// GET /api/fulltext?q=John+Smith&page=1&rows=10
// -------------------------------------------------------
app.get("/api/fulltext", async (req, res) => {
  const { q, page = 1, rows = 10 } = req.query;
  if (!q) return res.status(400).json({ error: "Search query (q) is required." });
  if (!API_KEY) return res.status(500).json({ error: "API key not configured. Add JUDYRECORDS_API_KEY to your .env file." });

  try {
    const url = `${JUDY_BASE_URL}/search?q=${encodeURIComponent(q)}&page=${page}&rows=${rows}`;
    console.log(`[Full-Text Search] ${url}`);
    const response = await fetch(url, { headers: { "x-api-key": API_KEY } });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "API error", details: data });
    res.json(data);
  } catch (err) {
    console.error("Full-Text Search Error:", err.message);
    res.status(500).json({ error: "Failed to connect to JudyRecords API.", details: err.message });
  }
});

// -------------------------------------------------------
// ROUTE 2: Structured Party Name Search
// GET /api/parties?name=John+Smith&state=TX&page=1&rows=10
// -------------------------------------------------------
app.get("/api/parties", async (req, res) => {
  const { name, state, page = 1, rows = 10 } = req.query;
  if (!name) return res.status(400).json({ error: "Name parameter is required." });
  if (!API_KEY) return res.status(500).json({ error: "API key not configured. Add JUDYRECORDS_API_KEY to your .env file." });

  try {
    let url = `${JUDY_BASE_URL}/parties?name=${encodeURIComponent(name)}&page=${page}&rows=${rows}`;
    if (state) url += `&state=${encodeURIComponent(state)}`;
    console.log(`[Party Search] ${url}`);
    const response = await fetch(url, { headers: { "x-api-key": API_KEY } });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "API error", details: data });
    res.json(data);
  } catch (err) {
    console.error("Party Search Error:", err.message);
    res.status(500).json({ error: "Failed to connect to JudyRecords API.", details: err.message });
  }
});

// -------------------------------------------------------
// ROUTE 3: Get Case Detail by ID
// GET /api/case/:caseId
// -------------------------------------------------------
app.get("/api/case/:caseId", async (req, res) => {
  const { caseId } = req.params;
  if (!API_KEY) return res.status(500).json({ error: "API key not configured. Add JUDYRECORDS_API_KEY to your .env file." });

  try {
    const url = `${JUDY_BASE_URL}/cases/${encodeURIComponent(caseId)}`;
    console.log(`[Case Detail] ${url}`);
    const response = await fetch(url, { headers: { "x-api-key": API_KEY } });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "API error", details: data });
    res.json(data);
  } catch (err) {
    console.error("Case Detail Error:", err.message);
    res.status(500).json({ error: "Failed to connect to JudyRecords API.", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ JudyRecords Search Server running at http://localhost:${PORT}`);
  console.log(`🔑 API Key loaded: ${API_KEY ? "Yes ✓" : "NO — check your .env file!"}`);
});
