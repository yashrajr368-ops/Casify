import os
import json
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, 'dataset', 'device_pricing_dataset.csv')
    models_dir = os.path.join(current_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(dataset_path):
        from .dataset_generator import generate_dataset
        df = generate_dataset(2000)
        os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
        df.to_csv(dataset_path, index=False)
    else:
        df = pd.read_csv(dataset_path)

    print(f"Loaded dataset with {len(df)} records.")

    # Target & features
    X = df.drop(columns=['resale_price'])
    y = df['resale_price']

    categorical_features = ['category', 'brand', 'model', 'screen_condition', 'body_condition', 'overall_condition']
    numeric_features = ['purchase_year', 'ram', 'storage', 'battery_health', 'has_box', 'has_charger', 'has_bill', 'has_warranty', 'original_price']

    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features),
            ('num', StandardScaler(), numeric_features)
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    candidate_models = {
        'Linear Regression': LinearRegression(),
        'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=150, learning_rate=0.1, max_depth=4, random_state=42)
    }

    best_r2 = -1.0
    best_name = None
    best_pipeline = None
    metrics_summary = {}

    print("\n" + "=" * 65)
    print(f"{'Model Name':<30} | {'MAE (Rs)':<10} | {'RMSE (Rs)':<10} | {'R2 Score':<8}")
    print("=" * 65)

    for name, model in candidate_models.items():
        pipe = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        pipe.fit(X_train, y_train)
        preds = pipe.predict(X_test)

        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)

        metrics_summary[name] = {
            'MAE': round(float(mae), 2),
            'RMSE': round(float(rmse), 2),
            'R2': round(float(r2), 4)
        }

        print(f"{name:<30} | {mae:<10.2f} | {rmse:<10.2f} | {r2:<8.4f}")

        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipe

    print("=" * 65)
    print(f"\nChampion Model Selected: {best_name} with R2 = {best_r2:.4f}")

    # Save champion model
    model_save_path = os.path.join(models_dir, 'device_price_model.pkl')
    joblib.dump(best_pipeline, model_save_path)
    print(f"Serialized model successfully to: {model_save_path}")

    # Save training metadata
    meta_path = os.path.join(models_dir, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump({
            'champion_model': best_name,
            'r2_score': round(float(best_r2), 4),
            'metrics_summary': metrics_summary,
            'dataset_size': len(df),
            'version': '1.0'
        }, f, indent=2)

    return best_pipeline

if __name__ == '__main__':
    train()
