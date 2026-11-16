This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Recruiter chatbot

A floating assistant (`components/chat/ChatWidget.tsx`) answers recruiter questions about Sharath's experience, projects, skills and availability.

- **Facts** live in one place: `lib/chat/knowledge.ts`, built from `lib/data.ts` plus the recruiter facts (salary, notice period, work mode, relocation). Edit the data and the bot's answers change; no retraining.
- **Fallback (always works):** `lib/chat/fallback.ts` answers by retrieval over those facts. It can only repeat site data, so it cannot make things up.
- **Model (optional):** set `CHAT_MODEL_URL` (and `CHAT_MODEL_TOKEN`) to a self-hosted fine-tuned model server exposing `GET /health` (`{"status":"ok"}`) and `POST /chat` (`{question, history, facts[]}` -> `{answer}`). If the host is asleep or slow, `/api/chat` answers from the fallback and the widget shows a "waking up" note. Model answers containing numbers or emails not present in the supplied facts are discarded.
- Leave the env vars unset to run fallback-only.
- **Regression test:** `scripts/chat-questions.mjs` holds ~155 curated recruiter questions (salary, notice, projects, skills, typos,
  injections, things the bot must say it doesn't know, ...). With the site running (`npm run build && npm run start`) run
  `npm run test:chat`; set `BASE_URL=https://<preview>` to test a deployment including the model. Add a line there every time the
  bot gets a real question wrong.
