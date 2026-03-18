# Hospital KPI Dashboard

A modern, responsive dashboard for tracking hospital quality indicators (KPIs), featuring many-to-many indicator-department mappings, Excel exports, and real-time validation.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd hospital-dashboard/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on http://localhost:3000.*

### 2. Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd hospital-dashboard/frontend/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The app will run on http://localhost:5173.*

## 🛠️ Features
- **Many-to-Many Mappings**: Indicators are assigned strictly to authorized departments.
- **Strict Validation**: Server-side checks prevent unauthorized data entry.
- **Excel Export**: Download detailed reports per indicator with monthly trends and department breakdowns.
- **Responsive Design**: Mobile-friendly glassmorphism UI.

## 📁 Project Structure
- `hospital-dashboard/backend/`: Express server, SQLite database, and API controllers.
- `hospital-dashboard/frontend/client/`: React/Vite application.
- `hospital-dashboard/backend/database/database.js`: Database schema and initialization logic.
