# stocks-Dashboard
📈 Stocks Dashboard
 
A modern, neon-themed stock analysis dashboard built using **FastAPI (Backend)** and **HTML/CSS/JavaScript (Frontend)** with **Chart.js** for real-time data visualization.

This dashboard supports:
- Single stock mode  
- Compare mode (two stocks side-by-side)  
- Interactive charts  
- 30 / 90 / 365-day data range  
- Auto summary (52-week high, low, average close)  
- Downloadable chart  
- Neon animated UI + cursor trail  
- Internship-ready clean UI  

---

## 🚀 Project Features

### ✔ Backend (FastAPI)
- CSV-based stock data (TCS, INFY, RELIANCE)
- `/companies` → available stock list  
- `/data/{symbol}` → last 30/90/365 days  
- `/summary/{symbol}` →  
  - 52-week high  
  - 52-week low  
  - average close  
- Cleaned & normalized CSV column handling  
- Automatic fallback for `close / adj close / Adj Close`

### ✔ Frontend
- Modern AI Neon UI  
- Purple × Cyan theme  
- Left sidebar navigation  
- Cursor trailing glow effect  
- Smooth charts with animations  
- Compare mode with dual line charts  
- Loading screen  
- Responsive design 


## 📂 Folder Structure


```
STOCKS_DASHBOARD/
│
├── backend/
│   ├── app.py
│   ├── fetch_data.py
│   ├── data/
│   │   ├── TCS.csv
│   │   ├── INFY.csv
│   │   └── RELIANCE.csv
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 🛠 Backend Setup (FastAPI)

### 1️⃣ Install dependencies
```bash
pip install fastapi uvicorn pandas yfinance
```

### 2️⃣ Move to backend folder
```bash
cd backend
```

### 3️⃣ Run backend server
```bash
uvicorn app:app --reload --port 9000
```

### ✔ Backend will run at:
```
http://127.0.0.1:9000
```

---

## 🌐 Frontend Setup (IMPORTANT)

Directly opening `index.html` as:

```
file:///C:/...
```

❌ WILL NOT WORK (fetch fails)

### Correct way:

### 1️⃣ Move to frontend
```bash
cd frontend
```

### 2️⃣ Start Live Server  
✔ Using VS Code → **Right-click → Open with Live Server**

OR run manually:

```bash
python -m http.server 5500
```

### Frontend URL:
```
http://127.0.0.1:5500/frontend/index.html
```

---

## 🔌 API Endpoints

| Endpoint | Description |
|---------|-------------|
| `/` | Backend health check |
| `/companies` | List of stocks from data folder |
| `/data/{symbol}` | Stock OHLC data for selected company |
| `/summary/{symbol}` | 52-week stats + average close |
| `/compare?symbol1=A&symbol2=B` | Compare close prices |

---

## 📊 How Data Flows

### 🔵 Step 1: Frontend loads company list
```js
fetch("http://127.0.0.1:9000/companies")
```

### 🔵 Step 2: User selects company → fetch stock data
```js
fetch(`http://127.0.0.1:9000/data/TCS`)
```

### 🔵 Step 3: Data normalized
```js
close: r.Close || r.close || r["adj close"]
```

### 🔵 Step 4: Chart.js renders the line graph  
- Single mode → 1 dataset  
- Compare mode → 2 datasets  

### 🔵 Step 5: Summary section fetches:
```js
fetch("http://127.0.0.1:9000/summary/TCS")
```

---

## 📈 Compare Mode Logic

1. User selects "Compare"
2. B company dropdown becomes visible
3. Two datasets plotted:
```js
datasets: [
  { label: A, data: valuesA },
  { label: B, data: valuesB }
]
```
4. Summary always shows Company A stats

---

## 🎨 UI Insights / Logic

### ✔ Theme: Purple × Cyan Neon  
- Gradient moving background  
- Neon glass cards  
- Smooth shadows  
- Animated cursor trail  

### ✔ Sidebar Navigation
Three views:
- Dashboard → full controls + chart + summary  
- Compare → compare UI enabled  
- About → only info section  

### ✔ Chart.js Settings
- Smooth tension curves  
- Soft shadows  
- Glow-style point colors  
- Responsive height  

---

## ⚠ Common Issues & Fixes


### ❌ CORS / Fetch error
- Ensure backend running on `9000`
- Check `API_BASE = "http://127.0.0.1:9000"` inside script.js

---

---

## 🧩 Tech Stack

### Backend
- FastAPI  
- Python  
- Pandas  
- YFinance  
- Uvicorn  

### Frontend
- HTML  
- CSS  
- JavaScript  
- Chart.js  

---
## vedio demo



https://github.com/user-attachments/assets/c6500f63-53c0-4c47-a1ca-d1c5d1ac1334


## 🖼 Screenshots 
1.single mode - 2.compare mode
<img width="1920" height="1080" alt="Screenshot (621)" src="https://github.com/user-attachments/assets/2f54514f-697e-4f2d-92ac-69d326a0a9d5" />
<img width="1920" height="1080" alt="Screenshot (622)" src="https://github.com/user-attachments/assets/7012ce73-5516-4d0e-b4e6-135abfc8c90d" />





## 🚀 Future Enhancements

ick chart  
- MACD / RSI / EMA indicators  
- Realtime stock API  
- Database support  
- User accounts  
- Alerts & notifications  

---

## 🙌 Author
**Rahul Kumar**  
AI Neon Stock Dashboard – Internship Project  

