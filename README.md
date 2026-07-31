# NUTRI.AI — Dynamic Multi-Model Vision Architecture

An enterprise-grade, 2-pass AI vision application built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Lucide Icons**, **Google Gemini 3.6 Flash (High)**, and **Gemini 3.1 Pro (High)**.

---

## 7-Domain Dynamic Vision Architecture

Rather than running a generic single prompt, **NUTRI.AI** uses a **2-Pass Dynamic Router**:

- **Pass 1 (Domain Router Classifier)**: Executes a sub-second router prompt using `gemini-3.6-flash` (~150ms) that classifies input photos into 1 of 7 domain pipelines:
  1. `non_food` — Plastic ID cards, badges, driver's licenses, documents, selfies, pets, furniture, or empty dishes.
  2. `packaged_food` — Branded snack wrappers, chips packets (Lay's, Doritos), protein bars, canned drinks.
  3. `fast_food_chain` — Commercial fast food or franchise items (Starbucks, McDonald's, Chipotle, Domino's).
  4. `home_cooked_meal` — Plated meals, home-cooked dishes, curries, bowls without commercial packaging.
  5. `whole_produce` — Fresh raw fruits, vegetables, raw eggs, unseasoned whole produce.
  6. `multi_dish_platter` — Multi-compartment platters, Indian Thalis, Bento Boxes, Mezze platters.
  7. `partially_eaten` — Leftover meals showing percentage remaining vs. consumed.

- **Pass 2 (Domain Specialized Prompt & Model Execution)**:
  - Dispatches to specialized prompts (`PACKAGED_GOODS_PROMPT`, `FAST_FOOD_PROMPT`, `HOME_MEAL_PROMPT`, `PLATTER_PROMPT`, `NON_FOOD_PROMPT`).
  - Uses **`gemini-3.6-flash`** for ultra-fast packaged/fast food OCR and **`gemini-3.1-pro`** for complex multi-dish spatial platters.

---

## Key Features

- **Bulletproof Non-Food Rejection**: Immediately rejects ID cards/documents and displays a `Non-Food Detected` alert badge with the exact object name.
- **Packaged Goods OCR & Processing Warnings**: Identifies brand names (e.g., *Lay's*), product titles, net weight, NOVA Ultra-Processed Grade, and additive alerts (High Sodium, Palm Oil).
- **Fast Food Franchise Matching**: Matches commercial photos to official franchise menu items (*Starbucks Grande Iced Latte*).
- **Multi-Dish Platter Breakdown**: Compartment-by-compartment breakdown for Indian Thalis and Bento boxes.
- **Micronutrients Breakdown Card**: Dietary Fiber, Total Sugar, and Sodium.
- **Image Quality & Lighting Check**: Evaluates photo luminance in real time to alert users if lighting is dim or glare is present.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 14+ (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4, Light Mode Theme |
| **Icons** | Lucide React Icons (`lucide-react`) |
| **Animations** | Framer Motion (`framer-motion`) |
| **Pass 1 Classifier** | Google Gemini 3.6 Flash (High) |
| **Pass 2 Ensemble** | Google Gemini 3.6 Flash & Gemini 3.1 Pro |

---

## Environment Setup

Create `.env.local` or `.env`:

```env
# Google Gemini API Key (Get free key at https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Getting Started Locally

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
