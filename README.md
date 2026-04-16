# Bootcamp Courses Platform

Production-style React + Vite application for the Bootcamp XI assignment.

## Stack

- React 18 + Vite
- React Router
- Axios
- React Hook Form + Zod
- Tailwind CSS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

## Available scripts

- `npm run dev` - run local development
- `npm run build` - build production bundle
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## API

Default API URL is configured for production backend:

- `https://api.redclass.redberryinternship.ge/api`

To override it, set:

- `VITE_API_BASE_URL`
