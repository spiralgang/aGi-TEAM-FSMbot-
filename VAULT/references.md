# External References

This document contains a curated list of external resources that are relevant to our technology stack and architectural principles.

## Core Technologies

-   **Next.js App Router:** [https://nextjs.org/docs/app](https://nextjs.org/docs/app)
    - *Usage*: We use the App Router for all routing, server components, and data fetching.
-   **React:** [https://react.dev/](https://react.dev/)
    - *Usage*: The core of our UI. We use functional components and hooks exclusively.
-   **Genkit (v1.x):** [https://firebase.google.com/docs/genkit](https://firebase.google.com/docs/genkit)
    - *Usage*: The backbone for all AI flows and agentic logic. All FSMs are implemented as Genkit flows.
-   **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
    - *Usage*: For all styling. We use utility-first classes.
-   **ShadCN UI:** [https://ui.shadcn.com/](https://ui.shadcn.com/)
    - *Usage*: Our component library. We prefer using these components and styling them via `globals.css` theme variables.
-   **Lucide Icons:** [https://lucide.dev/](https://lucide.dev/)
    - *Usage*: The icon set for the entire application.

## Architectural & Theoretical

-   **Finite State Machines (FSMs):** [https://en.wikipedia.org/wiki/Finite-state_machine](https://en.wikipedia.org/wiki/Finite-state_machine)
    - *Relevance*: The core architectural principle of our "Mop Boy" agents. Understanding their deterministic nature is critical.
-   **Microsoft Bot Framework Design Patterns:** [https://learn.microsoft.com/en-us/azure/bot-service/bot-service-design-patterns](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-design-patterns)
    - *Relevance*: Provides inspiration for our event-driven, state-based agentic workflows, as mentioned in the `EmbedGeminiManager` script.
