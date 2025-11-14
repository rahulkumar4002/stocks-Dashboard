import yfinance as yf
import pandas as pd
import os

# Get absolute path of backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Correct path for data folder
DATA_DIR = os.path.join(BASE_DIR, "data")

# Create data folder safely
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Companies to download
COMPANIES = ["TCS.NS", "INFY.NS", "RELIANCE.NS"]

def fetch_and_save(symbol):
    print(f"Fetching data for: {symbol}")
    data = yf.download(symbol, period="1y")  # last 1 year data

    if data.empty:
        print(f"No data found for {symbol}")
        return

    df = data.reset_index()
    file_name = symbol.replace(".NS", "") + ".csv"
    save_path = os.path.join(DATA_DIR, file_name)

    df.to_csv(save_path, index=False)
    print(f"Saved → {save_path}")


if __name__ == "__main__":
    for comp in COMPANIES:
        fetch_and_save(comp)
