from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import warnings
import os

warnings.filterwarnings('ignore')

app = Flask(__name__)

# Load model with fallback
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def load_model():
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        return model, True
    except Exception as e:
        print(f"Model load warning: {e}")
        return None, False

model, model_loaded = load_model()

# Feature config with ranges and labels
FEATURES = [
    {
        "name": "OverallQual",
        "label": "Overall Quality",
        "description": "Overall material and finish quality",
        "min": 1, "max": 10, "default": 7,
        "unit": "/10",
        "icon": "⭐",
        "type": "slider"
    },
    {
        "name": "GrLivArea",
        "label": "Living Area",
        "description": "Above grade (ground) living area in sq ft",
        "min": 300, "max": 5000, "default": 1500,
        "unit": "sq ft",
        "icon": "🏠",
        "type": "number"
    },
    {
        "name": "GarageArea",
        "label": "Garage Area",
        "description": "Size of garage in square feet",
        "min": 0, "max": 1500, "default": 480,
        "unit": "sq ft",
        "icon": "🚗",
        "type": "number"
    },
    {
        "name": "TotalBsmtSF",
        "label": "Basement Area",
        "description": "Total square feet of basement area",
        "min": 0, "max": 3000, "default": 1000,
        "unit": "sq ft",
        "icon": "🏚️",
        "type": "number"
    },
    {
        "name": "1stFlrSF",
        "label": "First Floor Area",
        "description": "First floor square feet",
        "min": 300, "max": 4000, "default": 1100,
        "unit": "sq ft",
        "icon": "📐",
        "type": "number"
    },
    {
        "name": "YearBuilt",
        "label": "Year Built",
        "description": "Original construction year",
        "min": 1872, "max": 2024, "default": 2000,
        "unit": "",
        "icon": "📅",
        "type": "number"
    },
    {
        "name": "LotArea",
        "label": "Lot Area",
        "description": "Lot size in square feet",
        "min": 1300, "max": 50000, "default": 10000,
        "unit": "sq ft",
        "icon": "🌿",
        "type": "number"
    },
    {
        "name": "GarageCars",
        "label": "Garage Capacity",
        "description": "Size of garage in car capacity",
        "min": 0, "max": 5, "default": 2,
        "unit": "cars",
        "icon": "🚙",
        "type": "slider"
    },
    {
        "name": "FullBath",
        "label": "Full Bathrooms",
        "description": "Full bathrooms above grade",
        "min": 0, "max": 4, "default": 2,
        "unit": "baths",
        "icon": "🛁",
        "type": "slider"
    }
]

# Fallback prediction using simple regression if model fails
def fallback_predict(features):
    qual, liv, garage, bsmt, flr, year, lot, cars, bath = features
    base = 50000
    price = (
        base
        + qual * 18000
        + liv * 85
        + garage * 40
        + bsmt * 30
        + flr * 25
        + (year - 1872) * 400
        + lot * 0.5
        + cars * 8000
        + bath * 12000
    )
    return max(price, 50000)

@app.route('/')
def index():
    return render_template('index.html', features=FEATURES)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        feature_values = []
        for feat in FEATURES:
            val = float(data.get(feat['name'], feat['default']))
            feature_values.append(val)

        input_array = np.array([feature_values])

        if model_loaded and model is not None:
            try:
                prediction = model.predict(input_array)[0]
            except:
                prediction = fallback_predict(feature_values)
        else:
            prediction = fallback_predict(feature_values)

        prediction = max(float(prediction), 10000)

        # Price tier
        if prediction < 100000:
            tier = "Starter Home"
            tier_color = "#64B5F6"
        elif prediction < 200000:
            tier = "Mid-Range"
            tier_color = "#81C784"
        elif prediction < 350000:
            tier = "Premium"
            tier_color = "#FFB74D"
        elif prediction < 500000:
            tier = "Luxury"
            tier_color = "#F06292"
        else:
            tier = "Ultra Luxury"
            tier_color = "#CE93D8"

        return jsonify({
            'success': True,
            'prediction': round(prediction, 2),
            'formatted': f"${prediction:,.0f}",
            'tier': tier,
            'tier_color': tier_color,
            'model_used': 'Random Forest' if (model_loaded and model is not None) else 'Estimation Model'
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/model-info')
def model_info():
    return jsonify({
        'algorithm': 'Random Forest Regressor',
        'n_estimators': 100,
        'n_features': 9,
        'training_samples': 1168,
        'features': [f['name'] for f in FEATURES],
        'accuracy_note': 'Best accuracy among tested models (Linear Regression, Decision Tree, Random Forest)',
        'model_loaded': model_loaded
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
