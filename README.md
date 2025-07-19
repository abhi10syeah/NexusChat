Nexus Chat

This is a Next.js chat application . It includes a front-end built with Next.js, React, and ShadCN, and a backend powered by Next.js API Routes with MongoDB.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A MongoDB database instance (you can use a free tier from MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository** (if you haven't already).

2.  **Install dependencies**:
    Open your terminal in the project root and run:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a file named `.env.local` in the project root by copying the example file:
    ```bash
    cp .env.local.example .env.local
    ```
    Now, open `.env.local` and fill in the required values:
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: A long, random, and secret string used for signing authentication tokens. You can generate one easily online.

4.  **Seed the database**:
    To populate the database with initial dummy data (users and rooms), run the seed script:
    ```bash
    npm run seed
    ```
    This will create a few users and a general chat room so you can test the application immediately.

5.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will start, typically on `http://localhost:9002`. Open this URL in your browser to see the app.

## Project Structure

Here is an overview of the key directories and files in this project:

-   **/src/app/**: The core of the Next.js application, using the App Router.
    -   **/api/**: Contains all the backend API routes. Each folder corresponds to an endpoint (e.g., `api/auth/login`).
    -   **/(pages)/**: The main UI pages of the application (e.g., `login/page.tsx`, `signup/page.tsx`, `page.tsx`).
    -   **globals.css**: Global styles and Tailwind CSS directives.
    -   **layout.tsx**: The root layout for the entire application.

-   **/src/components/**: Reusable React components used throughout the app.
    -   **/ui/**: Core UI components provided by ShadCN (Button, Card, etc.).
    -   **chat-layout.tsx**: The main layout for the chat interface.
    -   **chat-sidebar.tsx**: The sidebar component for channels and DMs.
    -   **chat-window.tsx**: The main chat window for displaying and sending messages.
    -   **create-room-dialog.tsx**: Dialog for creating new public channels.
    -   **create-dm-dialog.tsx**: Dialog for creating new direct messages.

-   **/src/context/**: React Context providers for managing global state.
    -   **AuthContext.tsx**: Manages user authentication state, login, signup, and logout logic.

-   **/src/hooks/**: Custom React hooks for shared logic.
    -   **use-toast.ts**: Hook for displaying toast notifications.

-   **/src/lib/**: Shared utilities, libraries, and core logic.
    -   **api.ts**: A client for making requests to our backend API routes.
    -   **auth.ts**: Server-side helper for verifying JWT tokens.
    -   **dbConnect.ts**: Handles the Mongoose connection to MongoDB.
    -   **store.ts**: The Zustand store for managing real-time chat state on the client.
    -   **types.ts**: TypeScript interfaces for data models (User, Room, Message).

-   **/src/models/**: Mongoose schemas that define the structure of our data in MongoDB.
    -   **User.ts**, **Room.ts**, **Message.ts**.

-   **/src/ai/**: Houses the Genkit AI configuration and flows.
    -   **genkit.ts**: Initializes and configures the Genkit instance.
    -   **/flows/summarize-chatroom.ts**: The Genkit flow for summarizing chat messages.

-   **/scripts/**: Standalone scripts for development tasks.
    -   **seed.js**: A script to populate the database with initial data.

-   **.env.local**: Your local environment variables. **This file is not committed to version control.**
-   **.env.local.example**: An example file to show what environment variables are needed.

### How It Works

-   **Frontend**: The UI is built with Next.js App Router, React, and styled with Tailwind CSS and ShadCN UI components. The state is managed globally with Zustand.
-   **Backend**: The backend is implemented using Next.js API Routes located in `src/app/api/`. These routes handle authentication, data fetching, and interactions with the MongoDB database via Mongoose.
-   **Authentication**: User authentication is handled using JSON Web Tokens (JWT). On signup or login, the server issues a token that the client stores and includes in the `Authorization` header for protected API requests.
-   **Database**: MongoDB is used as the database, with Mongoose as the ODM (Object Data Modeling) library to define schemas and interact with data.
