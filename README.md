# NUTRI.AI — Smart AI Nutrition & AR Food Callout Platform

An enterprise-grade, 2-pass AI vision platform built with **Next.js 16 (App Router)**, **Tailwind CSS**, **Framer Motion**, **Lucide Icons**, **Google Gemini 3.6 Flash**, and **Gemini 3.5 Flash**.

---

## 🚀 Key Features & Capabilities

### 1. 7-Domain Dynamic Vision Pipeline
Rather than running a generic single prompt, **NUTRI.AI** executes a **2-Pass Dynamic Router**:
- **Pass 1 (Domain Router Classifier)**: Sub-second classification of input photos into 1 of 7 specialized domain pipelines (`non_food`, `packaged_food`, `fast_food_chain`, `home_cooked_meal`, `whole_produce`, `multi_dish_platter`, `partially_eaten`).
- **Pass 2 (Domain Specialized Prompt & Model Execution)**: Dispatches to specialized prompts (`PACKAGED_GOODS_PROMPT`, `FAST_FOOD_PROMPT`, `HOME_MEAL_PROMPT`, `PLATTER_PROMPT`, `NON_FOOD_PROMPT`) using `gemini-3.6-flash`.

### 2. Interactive AR Spatial Food Callout View (Ingredient Callout Photo)
- **On-Demand Generation**: Triggered via `[ Generate Ingredient Callout Photo ]` calling POST `/api/annotate`.
- **Dynamic Smart Visibility**: Automatically shown for multi-item platters/meals; hidden for packaged snacks (e.g. Lay's) and single items (e.g. Aloo Paratha).
- **Collision-Free Spatial Layout**: Non-overlapping white target dots on food items connected by thin white leader lines to outer-margin white pill badges.
- **Dual-Layer Y-Axis Collision Engine**: Combines spatial LLM prompts with a frontend JavaScript collision pass enforcing minimum vertical gaps between badges.
- **Canvas Multi-Line Text Wrapping Engine**: Custom `wrapCanvasText` algorithm ensuring long ingredient names wrap onto neat lines without badge horizontal collisions.
- **Proportional Font & Geometry Scaling**: Dynamically scales font sizes, line thickness, and badge padding proportional to photo natural width (`naturalWidth`).
- **Fullscreen Lightbox**: View full-resolution annotated photos in a backdrop lightbox modal.
- **High-Res PNG Export**: Single-click `[ Save Image ]` button exporting crisp, high-res annotated cards.

### 3. Apple/Linear-Grade Upload & Scanning Experience
- **Minimalist Light Theme**: Sleek `#F8FAFC` background with emerald green accents.
- **Active Scanning Overlay**: Softly blurred image (`blur-[3px]`) with a centered emerald spinning icon and `"Analyzing Food Image & Nutrition..."` status pill.
- **Floating Controls**: Top-right floating `X` close/reset button to easily swap photos.
- **Widescreen Desktop Layout**: Expanded `max-w-6xl` container layout spanning comfortably across wide desktop monitors.

### 4. Robust AI Safety & Diagnostic Features
- **Bulletproof Non-Food Rejection**: Rejects ID cards, documents, and non-food items with explicit error banners.
- **Image Quality & Luminance Diagnostic**: Real-time canvas luminance check alerting users if lighting is too dim or glare is present.
- **Zero Database & Zero Cloud Storage**: Pure AI vision execution with zero database or Cloudinary overhead.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | Next.js 16+ (App Router, Turbopack, TypeScript) |
| **Styling** | Tailwind CSS v4, Clean Light Theme |
| **Icons** | Lucide React (`lucide-react`) |
| **Animations** | Framer Motion (`framer-motion`) |
| **Pass 1 Router** | Google Gemini 3.6 Flash |
| **Pass 2 Vision Engine** | Google Gemini 3.6 Flash |
| **Spatial Callout Engine** | Google Gemini 3.6 Flash 2D Coordinates + Canvas Engine |

---

## 🔑 Environment Setup

Create `.env.local` or `.env` in the root directory:

```env
# Google Gemini API Key (Get free key at https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ⚡ Getting Started Locally

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Production Verification & Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```
