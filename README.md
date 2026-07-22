# Connection Aviation Frontend Portal

A premium, interactive client web application for private jet chartering, helicopter booking, aircraft fleet browsing, and luxury aviation travel, built with **Vite**, **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **TanStack Query**.

---

## 📌 Features

- **Private Jet & Helicopter Charter Booking**: Multi-step, interactive enquiry form supporting origin/destination, date pickers, passenger count, jet category, and custom flight requirements.
- **Fleet Showcase**: Interactive fleet catalog showing aircraft specifications, passenger capacity, cruising speed, flight range, and cabin amenities.
- **Service Offerings**: Detail views for Private Jet Charters, Cargo Flights, VIP Transfers, and Medical Evacuation flights.
- **Real-Time Interactive AI Assistant**: Customer support chatbot integration for instant quotes and FAQs.
- **News, Blog & Media**: Aviation industry insights, luxury travel guides, and press updates.
- **Dynamic Content & Reviews**: Real-time integration with backend APIs for live customer testimonials and FAQs.
- **Fluid UI & Animations**: Premium visual design with glassmorphism, micro-interactions, and smooth animations using **Motion** (Framer Motion).

---

## 🛠️ Tech Stack

- **Build Tool**: Vite
- **UI Library**: React 18 + TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **State & Data Fetching**: TanStack React Query v5
- **Routing**: React Router DOM v6
- **Animations**: Motion (formerly Framer Motion)
- **Forms & Validation**: React Hook Form, Zod
- **Testing**: Vitest, React Testing Library

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **npm** or **bun**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<username>/connection-aviation-frontend-project.git
   cd connection-aviation-frontend-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. Development Server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the application in the browser.

5. Production Build:
   ```bash
   npm run build
   ```

6. Run Tests:
   ```bash
   npm run test
   ```

---

## 📂 Project Structure

```
connection-aviation-frontend-project/
├── src/
│   ├── assets/           # Images, logos, and static design assets
│   ├── components/       # UI components (Header, Footer, Flight Search, Jet Cards, Chatbot)
│   ├── data/             # Static configuration data & mock models
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Helper utilities
│   ├── pages/            # Page components (Index, Fleet, Services, Enquiry, About, Contact, Blog)
│   ├── services/         # API client & fetch functions
│   └── test/             # Vitest test specs
├── index.html            # App entry HTML template
├── tailwind.config.ts    # Tailwind styling configuration
└── vite.config.ts        # Vite configuration
```

---

## 🔒 Security & Privacy

This is a private repository containing proprietary frontend code for Aviation Braventra. Unauthorized copying or redistribution is strictly prohibited.
