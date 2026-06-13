# ⚖️ JudyRecords Background Search App

A web application for searching 760 million+ U.S. public court records by name, powered by the [JudyRecords API](https://www.judyrecords.com/api).

## 🖥️ What It Does

- **Search by Name** — Find court cases where someone appears as a plaintiff or defendant
- **Full-Text Search** — Search the full text of court records using keywords and phrases
- **State Filter** — Narrow results to a specific U.S. state
- **Pagination** — Browse through multiple pages of results
- **View Full Records** — Links directly to the full case on JudyRecords.com

---

## 🚀 Setup Instructions

### Step 1: Get a JudyRecords API Key
Contact JudyRecords to request an API key: **api@judyrecords.com**

### Step 2: Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org) (choose the LTS version).

### Step 3: Clone This Repository
```bash
git clone https://github.com/Infinitty35/judyrecords-search.git
cd judyrecords-search
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Configure Your API Key
Copy the example environment file:
```bash
cp .env.example .env
```
Then open `.env` in a text editor and replace `your_api_key_here` with your actual API key:
```
JUDYRECORDS_API_KEY=your_actual_key_here
PORT=3000
```

### Step 6: Start the App
```bash
npm start
```

Then open your browser and go to: **http://localhost:3000**

---

## 📁 Project Structure

```
judyrecords-search/
├── server.js          # Node.js backend — proxies API requests securely
├── package.json       # Project dependencies
├── .env.example       # Template for your API key (copy to .env)
├── .gitignore         # Keeps your .env secret from GitHub
└── public/
    ├── index.html     # Main web page
    ├── styles.css     # Styling
    └── app.js         # Frontend search logic
```

## 🔌 API Endpoints (Backend Routes)

| Route | Description |
|-------|-------------|
| `GET /api/parties?name=John+Smith&state=TX` | Search by party name |
| `GET /api/fulltext?q=John+Smith+fraud` | Full-text search |
| `GET /api/case/:caseId` | Get details for a specific case |

## ⚠️ Important Notes

- **Never commit your `.env` file** — your API key should stay private
- All records are public court data from [JudyRecords.com](https://www.judyrecords.com)
- Always verify information independently before making decisions
- Use responsibly and in accordance with [JudyRecords Terms of Service](https://www.judyrecords.com/terms)

---

Built with Node.js + Express + JudyRecords API
