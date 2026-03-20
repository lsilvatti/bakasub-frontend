# Bakasub - Web Interface

This is the frontend repository for **Bakasub**, the graphical interface where you manage your video folders, configure AI models, and track translation progress.

> **Note:** This repository is part of a larger ecosystem. If you just want to install and use Bakasub, check out the [main orchestration repository](https://github.com/YOUR_USERNAME/bakasub).

## 🛠️ Technologies Used
* **Framework:** React
* **Language:** TypeScript
* **Build Tool:** Vite

## 💻 Local Development

If you want to modify the interface, add new components, or adjust the layout:

### Prerequisites
* Node.js (version 20 or higher recommended).

### Setup
1. Install project dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and point it to your local API (the Go backend):
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   *The interface will be available at `http://localhost:5173` (default Vite port).*

## 📦 Production Build
To generate the optimized static files:
```bash
npm run build
```
The files will be generated in the `/dist` folder, ready to be served by Nginx or any static web server.