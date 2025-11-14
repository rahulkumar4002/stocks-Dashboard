from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import pandas as pd
import os

app = FastAPI()

# ⭐⭐⭐ CORS FIX ⭐⭐⭐
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # allow every frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Correct absolute path for data folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


# ---------------------- Helper Function ----------------------
def load_csv(symbol):
    file_path = os.path.join(DATA_DIR, f"{symbol}.csv")
    if not os.path.exists(file_path):
        return None

    df = pd.read_csv(file_path)

    # Normalize column names to lowercase (important)
    df.columns = [col.lower() for col in df.columns]

    return df


# ---------------------- API ROUTES ----------------------

@app.get("/")
def home():
    return {"message": "Stock API is running!"}


@app.get("/companies")
def get_companies():
    files = os.listdir(DATA_DIR)
    companies = [f.replace(".csv", "") for f in files]
    return {"companies": companies}


@app.get("/data/{symbol}")
def get_stock_data(symbol: str):
    df = load_csv(symbol)

    if df is None:
        return {"error": "Company not found"}

    last_30 = df.tail(30)
    return last_30.to_dict(orient="records")


# ---------------------- SUMMARY API (FIXED) ----------------------

@app.get("/summary/{symbol}")
def get_summary(symbol: str):
    df = load_csv(symbol)

    if df is None:
        return {"error": "Company not found"}

    # Lowercase columns
    df.columns = [c.lower() for c in df.columns]

    # Support multiple possible column names
    high_cols = ["high", "h"]
    low_cols = ["low", "l"]
    close_cols = ["close", "adj close", "adj_close", "closing"]

    # Auto detect correct columns
    high_col = next((c for c in high_cols if c in df.columns), None)
    low_col = next((c for c in low_cols if c in df.columns), None)
    close_col = next((c for c in close_cols if c in df.columns), None)

    if not high_col or not low_col or not close_col:
        return {"error": f"CSV column mismatch. Found columns: {df.columns.tolist()}"}

    high_52 = df[high_col].max()
    low_52 = df[low_col].min()
    avg_close = df[close_col].mean()

    return {
        "symbol": symbol,
        "52_week_high": float(high_52),
        "52_week_low": float(low_52),
        "avg_close": float(avg_close)
    }


# ---------------------- COMPARE API (FIXED) ----------------------

@app.get("/compare")
def compare(symbol1: str, symbol2: str):
    df1 = load_csv(symbol1)
    df2 = load_csv(symbol2)

    if df1 is None or df2 is None:
        return {"error": "One of the symbols is invalid"}

    df1.columns = [c.lower() for c in df1.columns]
    df2.columns = [c.lower() for c in df2.columns]

    # Safe fallback for close column
    close_candidates = ["close", "adj close", "adj_close"]

    col1 = next((c for c in close_candidates if c in df1.columns), None)
    col2 = next((c for c in close_candidates if c in df2.columns), None)

    if not col1 or not col2:
        return {"error": "Close column missing in one of the CSV files"}

    avg1 = float(df1[col1].mean())
    avg2 = float(df2[col2].mean())

    return {
        symbol1: avg1,
        symbol2: avg2
    }


#uvicorn app:app --reload --port 9000
