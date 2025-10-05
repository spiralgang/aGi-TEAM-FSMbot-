# FSM Operational Overview

This document contains the Mermaid diagrams for the core operational flowchart of the aGi²TEAM³FSMbot¹ system.

---

## Diagram 1: Application Logic & FSM Workflow (`/src` Environment)

This diagram represents the internal logic of the FSMAssist application itself. It shows how a single user interaction is processed through a deterministic sequence: a request is received, intent is parsed, and the task is routed to the appropriate FSM (a Genkit Flow) or the creative AI. This is a linear, transactional model that accurately reflects the code architecture within the `/src` directory.

```mermaid
graph TD
    A[Start] --> B{User Request};
    B --> C[Parse Intent];
    C --> D{Route to Agent};
    D --> E[FSM: Validator];
    D --> F[FSM: Parser];
    D --> G[AI: Code Gen];
    E --> H[Validate];
    F --> I[Parse];
    G --> J[Generate];
    H --> K{Result};
    I --> K;
    J --> K;
    K --> L[Format Output];
    L --> M[Respond to User];
```

---

## Diagram 2: Overall Build & Operational Environment (Firebase/CI/CD)

This diagram represents the broader, continuous build and operational environment. It illustrates a looping, event-driven system with external triggers, feedback mechanisms, and parallel processes. This model accurately reflects how a modern CI/CD pipeline and hosting environment (like Firebase App Hosting with GitHub Actions) operates—as a perpetual, self-regulating "code-energy loop."

```mermaid
graph TD
    subgraph "Triggers/Test"
        T1["<i class='fas fa-hammer'></i> hammer transference"]
        T2["<i class='fas fa-folder'></i> org digital hammer"]
        T3["<i class='fas fa-robot'></i> gemini oversee goals"]
    end

    A[Mind-Matter Provocation<br/>(Mental -> Code)] -- solid --> D{Digital Hammer Enforcer v27}
    
    subgraph "Inputs"
        direction LR
        P((Pressure on Stagnation))
    end
    
    P -.-> A

    T1 -.-> D
    T2 -.-> F[TermiMation CLI Chains<br/>(Shell, Modular, CI/CD)]
    T3 -.-> G[Gemini AGI Oversee<br/>(Goal Handling, Directory<br/>Monitor)]

    D -- solid --> E1[/Exponential AGI FLOPs<br/>(Cloud TPU, Distributed<br/>Training)/]
    D -- solid --> E2[fs-utils Hygiene<br/>(Config Trees, Folder<br/>Purge/Normalize)]
    D -- solid --> F
    D -.-> G

    E1 -- solid --> H((Perpetual Code-Energy Loop<br/>(No Stagnation, Only Exertion)))
    E2 -- solid --> H
    F -- solid --> H
    G -- solid --> H

    H -- solid --> I(((X)))
    
    subgraph "Feedback"
        RL[Re-loop]
    end

    G -.-> P
    RL -.-> P
    
    style T1 fill:#f8d7da,stroke:#f5c6cb
    style T2 fill:#fff3cd,stroke:#ffeeba
    style T3 fill:#d1ecf1,stroke:#bee5eb
    style A fill:#d1ecf1,stroke:#bee5eb
    style D fill:#d1ecf1,stroke:#bee5eb
    style E1 fill:#f8d7da,stroke:#f5c6cb
    style E2 fill:#f8d7da,stroke:#f5c6cb
    style F fill:#f8d7da,stroke:#f5c6cb
    style G fill:#d4edda,stroke:#c3e6cb
    style H fill:#fff3cd,stroke:#ffeeba
    style P fill:#e2e3e5,stroke:#d6d8db,stroke-dasharray: 5 5
    style I fill:#f8d7da,stroke:#f5c6cb
    style RL fill:#e2e3e5,stroke:#d6d8db
```
