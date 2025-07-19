# CodeHaus

**CodeHaus** is a vibe-based coding platform — describe what you want, and we’ll build it for you.  
Your ideas, turned into working code within minutes.  
Write code with your vibe.

## ✨ Highlights

- Describe your idea, and CodeHaus does the heavy lifting — from UI to backend logic.
- View your project live in real-time.
- Share your project temporarily or keep it permanent as a pro user.
- All within a few minutes, powered by AI.

---

## 🔐 Features

1. **Clerk Authentication**  
   Secure sign-in with Clerk for seamless user management.

2. **AI Coding Agent with Modular Tools**  
   Integrated AI agent with powerful tools:
   - Code generation
   - File regeneration
   - Agent memory
   - Debugging and optimization

3. **Billing and Subscription Management**  
   Upgrade your plan via Clerk’s billing system. Pro users get extended sharing time, higher rate limits, and more powerful tools.

4. **Live Preview and Sharing**  
   View your app instantly. Share it with others for a limited time — extended sharing available for pro users.

5. **Credit-Based Rate Limiting**  
   Each user has limited AI credits. Once you run out, you can either wait for the monthly refresh or upgrade your plan.

---

## 🛠 Tech Stack

- **Next.js** – Full-stack React framework
- **Clerk** – Authentication and user management
- **Inngest** – Event-driven workflows for background jobs
- **Inngest AgentKit** – AI orchestration toolkit
- **PostgreSQL + Prisma** – Scalable database with ORM
- **OpenAI / Anthropic** – LLMs for smart code generation
- **Clerk Billing** – Subscription handling and upgrades

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/codehaus.git
   cd codehaus
    ```
2. **Install dependencies
    ```bash 
    # with npm
    npm install
    # or with pnpm
    pnpm install
    # or with bun
    bun install
    ```
3. **Setup Environment variables
    create a .env file and configure the following:
    ```bash
    DATABASE_URL =
    NEXT_PUBLIC_APP_URL = http://localhost:3000

    OPENAI_API_KEY = 
    ANTHROPIC_API_KEY = 

    E2B_API_KEY = 

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=

    NEXT_PUBLIC_CLERK_SIGN_UP_URL=
    ```
4. **Run the deployment server
    ```bash
    npm run dev
    ```
    