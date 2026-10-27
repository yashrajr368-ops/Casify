import os
import joblib
import pandas as pd
import numpy as np

# Cache loaded model in memory
_MODEL_CACHE = None

def get_model():
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'device_price_model.pkl')
        if os.path.exists(model_path):
            _MODEL_CACHE = joblib.load(model_path)
        else:
            from .train_model import train
            _MODEL_CACHE = train()
    return _MODEL_CACHE

FALLBACK_BASE_PRICES = {
    'Apple': 85000,
    'Samsung': 65000,
    'OnePlus': 45000,
    'Google': 55000,
    'Xiaomi': 30000,
    'Dell': 75000,
    'HP': 60000,
    'Lenovo': 70000,
    'Asus': 65000
}

CONDITION_SCORES = {
    'Excellent': 9.5,
    'Good': 7.8,
    'Fair': 5.5,
    'Poor': 3.2
}

def predict_device_price(device_data, original_price=None):
    """
    Evaluates device attributes using the trained Scikit-learn model
    and generates valuation range, confidence, condition score, and itemized breakdown.
    """
    model = get_model()

    category = device_data.get('category', 'Smartphone')
    brand = device_data.get('brand', 'Apple')
    device_model = device_data.get('model', 'iPhone 13')
    purchase_year = int(device_data.get('purchase_year', 2023))
    ram = int(device_data.get('ram', 6) or 6)
    storage = int(device_data.get('storage', 128) or 128)
    battery_health = int(device_data.get('battery_health', 85) or 85)

    screen_condition = device_data.get('screen_condition', 'Good')
    body_condition = device_data.get('body_condition', 'Good')
    overall_condition = device_data.get('overall_condition', 'Good')

    has_box = 1 if device_data.get('has_box') else 0
    has_charger = 1 if device_data.get('has_charger') else 0
    has_bill = 1 if device_data.get('has_bill') else 0
    has_warranty = 1 if device_data.get('has_warranty') else 0

    if original_price is None or original_price <= 0:
        base = FALLBACK_BASE_PRICES.get(brand, 40000)
        storage_mult = 1.0 + (storage / 1024.0) * 0.15
        original_price = base * storage_mult

    input_df = pd.DataFrame([{
        'category': category,
        'brand': brand,
        'model': device_model,
        'purchase_year': purchase_year,
        'ram': ram,
        'storage': storage,
        'battery_health': battery_health,
        'screen_condition': screen_condition,
        'body_condition': body_condition,
        'overall_condition': overall_condition,
        'has_box': has_box,
        'has_charger': has_charger,
        'has_bill': has_bill,
        'has_warranty': has_warranty,
        'original_price': float(original_price)
    }])

    # Predict with model
    try:
        raw_prediction = float(model.predict(input_df)[0])
    except Exception as e:
        # Fallback heuristic calculation if model encodings miss an unlearned brand/model
        print(f"Warning in model prediction: {e}. Utilizing statistical fallback.")
        age_years = max(1, 2026 - purchase_year)
        raw_prediction = original_price * (0.82 ** age_years) * (CONDITION_SCORES.get(overall_condition, 7.0) / 10.0)

    # Floor at reasonable value
    predicted_price = max(1500.0, round(raw_prediction, -2))
    minimum_price = max(1200.0, round(predicted_price * 0.94, -2))
    maximum_price = round(predicted_price * 1.06, -2)

    # Calculate overall condition score (0 - 10)
    screen_val = CONDITION_SCORES.get(screen_condition, 7.0)
    body_val = CONDITION_SCORES.get(body_condition, 7.0)
    overall_val = CONDITION_SCORES.get(overall_condition, 7.0)
    composite_condition_score = round(
        (screen_val * 0.35 + body_val * 0.25 + overall_val * 0.40),
        1
    )

    # Calculate confidence score (80% - 96%)
    base_confidence = 88.0
    if has_bill: base_confidence += 3.0
    if has_box and has_charger: base_confidence += 2.5
    if battery_health < 75: base_confidence -= 2.0
    confidence_score = round(min(96.0, max(78.0, base_confidence)), 1)

    # Itemized price breakdown
    age_years = max(0, 2026 - purchase_year)
    age_deduction = round(original_price * (1 - (0.85 ** max(1, age_years))), 2)
    condition_penalty = round(original_price * 0.15 * (1.0 - (composite_condition_score / 10.0)), 2)
    battery_penalty = round(max(0, (85 - battery_health) * (original_price * 0.003)), 2)
    accessories_bonus = round((has_box * 500) + (has_charger * 800) + (has_bill * 600), 2)
    warranty_bonus = round(original_price * 0.05 if has_warranty else 0.0, 2)

    breakdown = {
        'original_base_price': round(float(original_price), 2),
        'age_deduction': age_deduction,
        'condition_deduction': condition_penalty,
        'battery_adjustment': -battery_penalty if battery_penalty > 0 else 0.0,
        'accessories_credit': accessories_bonus,
        'warranty_credit': warranty_bonus,
        'condition_label': overall_condition,
        'estimated_market_value': predicted_price
    }

    return {
        'predicted_price': predicted_price,
        'minimum_price': minimum_price,
        'maximum_price': maximum_price,
        'confidence_score': confidence_score,
        'condition_score': composite_condition_score,
        'breakdown': breakdown,
        'model_version': '1.0'
    }
