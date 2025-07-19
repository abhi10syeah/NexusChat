# Firebase Studio - Nexus Chat

This is a Next.js chat application built in Firebase Studio. It includes a front-end built with Next.js, React, and ShadCN, and a backend powered by Next.js API Routes with MongoDB.

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

### How It Works

-   **Frontend**: The UI is built with Next.js Pages Router, React, and styled with Tailwind CSS and ShadCN UI components. The state is managed globally with Zustand.
-   **Backend**: The backend is implemented using Next.js API Routes located in `src/app/api/`. These routes handle authentication, data fetching, and interactions with the MongoDB database via Mongoose.
-   **Authentication**: User authentication is handled using JSON Web Tokens (JWT). On signup or login, the server issues a token that the client stores and includes in the `Authorization` header for protected API requests.
-   **Database**: MongoDB is used as the database, with Mongoose as the ODM (Object Data Modeling) library to define schemas and interact with data.
