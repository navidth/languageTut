# ExamificatioN

ExamificatioN is a bilingual, RTL-ready language-learning platform built with Next.js.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The centralized brand palette and typography tokens live in `src/styles/globals.css`. Persian content uses the bundled IRANSans font with Tahoma and Arial fallbacks; English content uses Abyssinica SIL with Georgia and Times New Roman fallbacks.
