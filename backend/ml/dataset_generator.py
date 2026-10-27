import os
import random
import pandas as pd
import numpy as np

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

CURRENT_YEAR = 2026

DEVICE_PROFILES = [
    # Smartphones
    {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15 Pro Max', 'base_price': 159900, 'ram_range': [8], 'storage_range': [256, 512, 1024]},
    {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15 Pro', 'base_price': 134900, 'ram_range': [8], 'storage_range': [128, 256, 512]},
    {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 15', 'base_price': 79900, 'ram_range': [6], 'storage_range': [128, 256, 512]},
    {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 14', 'base_price': 69900, 'ram_range': [6], 'storage_range': [128, 256]},
    {'category': 'Smartphone', 'brand': 'Apple', 'model': 'iPhone 13', 'base_price': 59900, 'ram_range': [4], 'storage_range': [128, 256]},
    {'category': 'Smartphone', 'brand': 'Samsung', 'model': 'Galaxy S24 Ultra', 'base_price': 129999, 'ram_range': [12], 'storage_range': [256, 512, 1024]},
    {'category': 'Smartphone', 'brand': 'Samsung', 'model': 'Galaxy S23', 'base_price': 74999, 'ram_range': [8], 'storage_range': [128, 256]},
    {'category': 'Smartphone', 'brand': 'Samsung', 'model': 'Galaxy Z Fold 5', 'base_price': 154999, 'ram_range': [12], 'storage_range': [256, 512]},
    {'category': 'Smartphone', 'brand': 'OnePlus', 'model': 'OnePlus 12', 'base_price': 64999, 'ram_range': [12, 16], 'storage_range': [256, 512]},
    {'category': 'Smartphone', 'brand': 'OnePlus', 'model': 'OnePlus 11R', 'base_price': 39999, 'ram_range': [8, 16], 'storage_range': [128, 256]},
    {'category': 'Smartphone', 'brand': 'Google', 'model': 'Pixel 8 Pro', 'base_price': 106999, 'ram_range': [12], 'storage_range': [128, 256, 512]},
    {'category': 'Smartphone', 'brand': 'Google', 'model': 'Pixel 7a', 'base_price': 43999, 'ram_range': [8], 'storage_range': [128]},
    {'category': 'Smartphone', 'brand': 'Xiaomi', 'model': 'Xiaomi 14', 'base_price': 69999, 'ram_range': [12], 'storage_range': [512]},
    {'category': 'Smartphone', 'brand': 'Xiaomi', 'model': 'Redmi Note 13 Pro', 'base_price': 25999, 'ram_range': [8, 12], 'storage_range': [128, 256]},

    # Laptops
    {'category': 'Laptop', 'brand': 'Apple', 'model': 'MacBook Pro M3 14"', 'base_price': 169900, 'ram_range': [8, 16, 24], 'storage_range': [512, 1024]},
    {'category': 'Laptop', 'brand': 'Apple', 'model': 'MacBook Air M2 13"', 'base_price': 99900, 'ram_range': [8, 16], 'storage_range': [256, 512]},
    {'category': 'Laptop', 'brand': 'Dell', 'model': 'XPS 15 (9530)', 'base_price': 189990, 'ram_range': [16, 32], 'storage_range': [512, 1024]},
    {'category': 'Laptop', 'brand': 'Dell', 'model': 'Inspiron 15', 'base_price': 58990, 'ram_range': [8, 16], 'storage_range': [512]},
    {'category': 'Laptop', 'brand': 'HP', 'model': 'Spectre x360', 'base_price': 149999, 'ram_range': [16], 'storage_range': [512, 1024]},
    {'category': 'Laptop', 'brand': 'HP', 'model': 'Pavilion 15', 'base_price': 64999, 'ram_range': [8, 16], 'storage_range': [512]},
    {'category': 'Laptop', 'brand': 'Lenovo', 'model': 'ThinkPad X1 Carbon Gen 11', 'base_price': 174990, 'ram_range': [16, 32], 'storage_range': [512, 1024]},
    {'category': 'Laptop', 'brand': 'Asus', 'model': 'ROG Zephyrus G14', 'base_price': 144990, 'ram_range': [16, 32], 'storage_range': [1024]},

    # Tablets
    {'category': 'Tablet', 'brand': 'Apple', 'model': 'iPad Pro 11" (4th Gen)', 'base_price': 81900, 'ram_range': [8, 16], 'storage_range': [128, 256, 512]},
    {'category': 'Tablet', 'brand': 'Apple', 'model': 'iPad Air (5th Gen)', 'base_price': 59900, 'ram_range': [8], 'storage_range': [64, 256]},
    {'category': 'Tablet', 'brand': 'Samsung', 'model': 'Galaxy Tab S9', 'base_price': 72999, 'ram_range': [8, 12], 'storage_range': [128, 256]},
    {'category': 'Tablet', 'brand': 'Xiaomi', 'model': 'Pad 6', 'base_price': 26999, 'ram_range': [6, 8], 'storage_range': [128, 256]},

    # Smartwatches
    {'category': 'Smartwatch', 'brand': 'Apple', 'model': 'Apple Watch Series 9', 'base_price': 41900, 'ram_range': [1], 'storage_range': [64]},
    {'category': 'Smartwatch', 'brand': 'Apple', 'model': 'Apple Watch Ultra 2', 'base_price': 89900, 'ram_range': [1], 'storage_range': [64]},
    {'category': 'Smartwatch', 'brand': 'Samsung', 'model': 'Galaxy Watch 6 Classic', 'base_price': 36999, 'ram_range': [2], 'storage_range': [16]},
    {'category': 'Smartwatch', 'brand': 'OnePlus', 'model': 'OnePlus Watch 2', 'base_price': 24999, 'ram_range': [2], 'storage_range': [32]}
]

CONDITION_MAP = {
    'Excellent': 1.0,
    'Good': 0.85,
    'Fair': 0.68,
    'Poor': 0.45
}

def generate_dataset(num_samples=1800):
    rows = []
    for _ in range(num_samples):
        profile = random.choice(DEVICE_PROFILES)
        category = profile['category']
        brand = profile['brand']
        model = profile['model']
        base_original_price = profile['base_price']
        ram = random.choice(profile['ram_range'])
        storage = random.choice(profile['storage_range'])

        # Purchase year: between 2020 and 2025
        purchase_year = random.randint(2020, 2025)
        age_years = max(1, CURRENT_YEAR - purchase_year)

        # Battery health: 70% to 100%
        # older devices tend to have lower battery health
        battery_health = max(65, min(100, int(100 - (age_years * random.uniform(3.5, 7.0)) + random.gauss(0, 3))))

        # Conditions
        cond_choices = ['Excellent', 'Good', 'Fair', 'Poor']
        # older devices skew worse
        weights = [0.4, 0.4, 0.15, 0.05] if age_years <= 2 else [0.15, 0.45, 0.25, 0.15]
        overall_condition = random.choices(cond_choices, weights=weights)[0]
        screen_condition = random.choices(cond_choices, weights=weights)[0]
        body_condition = random.choices(cond_choices, weights=weights)[0]

        # Accessories
        has_box = random.choice([True, False])
        has_charger = random.choice([True, False])
        has_bill = random.choice([True, False])
        has_warranty = (age_years <= 1) and random.choice([True, False])

        # Calculate original price based on storage & ram upgrades
        storage_multiplier = 1.0 + (storage / 1024.0) * 0.15
        original_price = base_original_price * storage_multiplier

        # Realistic resale pricing logic:
        # Base annual depreciation
        annual_depreciation = 0.14 if brand == 'Apple' else 0.18
        age_decay = (1.0 - annual_depreciation) ** age_years

        # Condition multiplier
        cond_mult = CONDITION_MAP[overall_condition]

        # Battery factor
        battery_factor = 1.0
        if battery_health < 80:
            battery_factor -= (80 - battery_health) * 0.007

        # Accessories bonus
        acc_bonus = 0.0
        if has_box: acc_bonus += 0.02
        if has_charger: acc_bonus += 0.02
        if has_bill: acc_bonus += 0.015
        if has_warranty: acc_bonus += 0.06

        # Target resale price
        resale_price = original_price * age_decay * cond_mult * battery_factor * (1.0 + acc_bonus)

        # Add minor natural market variance
        noise = random.gauss(1.0, 0.035)
        resale_price = round(max(original_price * 0.10, resale_price * noise), -2)

        rows.append({
            'category': category,
            'brand': brand,
            'model': model,
            'purchase_year': purchase_year,
            'ram': ram,
            'storage': storage,
            'battery_health': battery_health,
            'screen_condition': screen_condition,
            'body_condition': body_condition,
            'overall_condition': overall_condition,
            'has_box': int(has_box),
            'has_charger': int(has_charger),
            'has_bill': int(has_bill),
            'has_warranty': int(has_warranty),
            'original_price': round(original_price, 2),
            'resale_price': resale_price
        })

    df = pd.DataFrame(rows)
    return df

if __name__ == '__main__':
    df = generate_dataset(2000)
    out_dir = os.path.join(os.path.dirname(__file__), 'dataset')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'device_pricing_dataset.csv')
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} realistic device pricing records to {out_path}")
