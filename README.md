# No-Code ML Pipeline Builder

A full-stack web application that empowers users to build, train, and evaluate machine learning models without writing a single line of code. This tool guides users through a clear 5-step pipeline: uploading data, preprocessing, splitting data, training a model, and viewing results.

## 🚀 Technologies

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/), [Pandas](https://pandas.pydata.org/), [Scikit-learn](https://scikit-learn.org/)

## ✨ Features

- **Dataset Upload**: drag-and-drop CSV upload with validation and preview.
- **Preprocessing**: Automatic handling of missing values and feature scaling.
- **Train-Test Split**: Interactive slider to configure training and testing stats.
- **Model Selection**: Choose between Logistic Regression, Decision Trees, and Random Forests.
- **Visual Results**: Real-time accuracy metrics and performance charts.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.8 or higher)

### 1. Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at `http://localhost:8000`. API docs can be viewed at `http://localhost:8000/docs`.

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies.

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The application will be running at `http://localhost:3000`.

## 📁 Project Structure

```
d:\assignment\
├── backend/            # FastAPI backend code
│   ├── main.py         # API Endpoints
│   ├── pipeline.py     # ML Pipeline Logic
│   └── requirements.txt
├── frontend/           # Next.js frontend code
│   ├── app/            # App router pages
│   └── components/     # UI Components
├── .gitignore
└── README.md
```
