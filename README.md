# EstateIQ — House Price Prediction Web App

A premium AI-powered house price prediction web application built with Flask, HTML, CSS, and JavaScript.

## 🏠 About the Model

- **Algorithm**: Random Forest Regressor (best accuracy among tested models)
- **Estimators**: 100 decision trees
- **Training Samples**: 1,168 homes (Ames Housing Dataset)
- **Features Used**: 9 key property attributes
- **Model File**: `model.pkl`

### Features Used for Prediction
| Feature | Description |
|---------|-------------|
| OverallQual | Overall material and finish quality (1–10) |
| GrLivArea | Above-grade living area (sq ft) |
| GarageArea | Garage size (sq ft) |
| TotalBsmtSF | Total basement area (sq ft) |
| 1stFlrSF | First floor area (sq ft) |
| YearBuilt | Year of construction |
| LotArea | Lot size (sq ft) |
| GarageCars | Garage capacity (cars) |
| FullBath | Full bathrooms above grade |

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the app**
   ```bash
   python app.py
   ```

3. **Open your browser**
   ```
   http://localhost:5000
   ```

## 📁 Project Structure

```
house_price_app/
│
├── app.py                  # Flask backend
├── model.pkl               # Trained Random Forest model
├── requirements.txt        # Python dependencies
├── README.md               # This file
│
├── templates/
│   └── index.html          # Main HTML template (Jinja2)
│
└── static/
    ├── css/
    │   └── style.css       # Premium UI styles
    └── js/
        └── app.js          # Frontend logic & animations
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main prediction page |
| POST | `/predict` | Get price prediction (JSON) |
| GET | `/model-info` | Model metadata |

### POST /predict — Request Body
```json
{
  "OverallQual": 7,
  "GrLivArea": 1500,
  "GarageArea": 480,
  "TotalBsmtSF": 1000,
  "1stFlrSF": 1100,
  "YearBuilt": 2000,
  "LotArea": 10000,
  "GarageCars": 2,
  "FullBath": 2
}
```

### POST /predict — Response
```json
{
  "success": true,
  "prediction": 215000.0,
  "formatted": "$215,000",
  "tier": "Mid-Range",
  "tier_color": "#81C784",
  "model_used": "Random Forest"
}
```

## 🎨 UI Features
- Dark luxury aesthetic with gold accents
- Animated grain texture background
- Floating ambient orbs
- Smooth price animation on prediction
- Property breakdown display
- Responsive design (mobile-friendly)
- Slider + number input for all features
