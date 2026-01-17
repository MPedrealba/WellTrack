# WellTrack

This is a web-based system called WellTrack, an AI-Powered Monitoring and Support System for Student Mental Health.

## Tech Stack

- **Frontend:**
  - [React](https://reactjs.org/)
  - [Vite](https://vitejs.dev/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **Backend:**
  - [Express.js](https://expressjs.com/)
  - [Node.js](https://nodejs.org/)
- **Database:**
  - [Drizzle ORM](https://orm.drizzle.team/)
  - [MySQL](https://www.mysql.com/) / [SQLite](https://www.sqlite.org/index.html) (inferred from drivers)

## Key Dependencies

- **UI Components:**
  - [shadcn/ui](https://ui.shadcn.com/) (inferred from `@radix-ui/*` and `tailwind-merge`)
  - [Radix UI](https://www.radix-ui.com/)
  - [Framer Motion](https://www.framer.com/motion/) for animations
  - [Recharts](https://recharts.org/) for charts
- **Forms:**
  - [React Hook Form](https://react-hook-form.com/)
  - [Zod](https://zod.dev/) for validation
- **Routing:**
  - [Wouter](https://github.com/molefrog/wouter)
- **Authentication:**
  - [Passport.js](http://www.passportjs.org/) (with Google OAuth 2.0 and local strategies)
- **API & Data:**
  - [TanStack Query](https://tanstack.com/query/latest) for data fetching and caching
  - [OpenAI](https://openai.com/) for AI features
- **Tooling:**
    - [Drizzle Kit](https://orm.drizzle.team/kit/overview) for database migrations
    - [TSX](https://github.com/esbuild-kit/tsx) for running TypeScript files
    - [Vite](https://vitejs.dev/) for frontend tooling


## Getting Started

To get started with this project, you need to have Node.js and npm installed on your machine.

1.  Clone this repository.
2.  Install the dependencies by running `npm install` in the `MindWellPath` directory.
3.  Create a `.env` file in the `MindWellPath` directory and add the necessary environment variables.
4.  Run the development server by running `npm run dev` in the `MindWellPath` directory.

## Features

- Student and Admin dashboards
- Mood and stress level tracking
- AI-powered alerts for students at risk
- Resource library for mental health support
- User authentication

## Project Structure

The project is divided into two main parts: the client-side and the server-side.

- The client-side is located in the `MindWellPath/client` directory and is built with React and TypeScript.
- The server-side is located in the `MindWellPath/server` directory and is built with Express.js.
- The shared code between the client and the server is located in the `MindWellPath/shared` directory.
- The database schema is located in the `MindWellPath/shared/schema.ts` file.
- The database migrations are located in the `MindWellPath/migrations` directory.

### Path Aliases

The following path aliases are configured in `vite.config.ts` to simplify module imports:

- `@`: Resolves to `MindWellPath/client/src`.
- `@shared`: Resolves to `MindWellPath/shared`.
- `@assets`: Resolves to `MindWellPath/attached_assets`.

