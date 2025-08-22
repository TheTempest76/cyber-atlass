#!/usr/bin/env python3

import pandas as pd
import sys

def main():

    csv_file = "./whatsapp_scam_dataset.csv"

    try:
        df = pd.read_csv(csv_file)

        # Get unique values from second column (index 1)
        unique_items = sorted(df.iloc[:, 1].dropna().unique().tolist())

        print("\n✅ Unique items from column 2:\n")
        for item in unique_items:
            print(item)

        # Also show counts
        print("\n📊 Value counts:\n")
        print(df.iloc[:, 1].value_counts())

    except FileNotFoundError:
        print(f"Error: File '{csv_file}' not found.")
    except Exception as e:
        print("Error while processing CSV:", e)

if __name__ == "__main__":
    main()
