# 🚀 Zenith — Production-Level Full-Stack Todo App 📝

A high-performance, production-ready Todo application built with a modern tech stack. Features include real-time updates, background job processing, robust authentication, and a clean layered architecture.

---

## 🛠️ Tech Stack & Technologies

| Layer                | Technology                                       |
| -------------------- | ------------------------------------------------ |
| **Frontend**         | ⚛️ React 18, 🔄 React Query, 🐻 Zustand          |
| **Backend**          | 🟢 Node.js, 🚂 Express 4                         |
| **Database**         | 🐬 MySQL 8 (RDS)                                 |
| **Cache & Realtime** | 🔴 Redis (Sessions, Cache, Rate Limit)           |
| **Cloud Infra**      | ☁️ AWS (EKS, RDS, VPC, ALB)                      |
| **IaC**              | 🏗️ Terraform, ☸️ Helm                             |
| **Background Jobs**  | 🐂 BullMQ (Retry + Backoff)                      |
| **Realtime**         | 🔌 Socket.io (Per-user rooms)                    |
| **Security & Auth**  | 🔐 JWT (Access + Refresh Token Rotation), Helmet |
| **AI Assistant**     | 🤖 Google Gemini API (@google/genai)             |

---

## 📂 Folder Structure

```text
todo-app/
├── ⚙️ backend/               # Node.js/Express API
├── 🎨 frontend/              # React Frontend Application
├── 🏗️ terraform/             # IaC for AWS (EKS, VPC, RDS)
├── ☸️ k8s/                   # Kubernetes Manifests
└── 🐋 docker-compose.yml     # Local Development Stack
```

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: `>= 18.x` 🟩
- **MySQL**: `8.x` running locally 🐬
- **Redis**: Running locally (`redis-server`) 🔴
- **Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/) 🤖

---

## 🚀 Setup & Installation — Step by Step

### 1️⃣ Clone the Repository

```bash
cd todo-app
```

### 2️⃣ Backend Setup

```bash
cd backend
cp .env.example .env
# ✏️ Edit .env: Set DB_PASSWORD, JWT secrets, SESSION_SECRET, and GEMINI_API_KEY
npm install
node src/migrations/run.js     # 🏗️ Creates DB, tables & indexes
npm run dev                    # 🚀 Starts API server on port :4000
```

### 3️⃣ Frontend Setup

Open a new terminal session:

```bash
cd ../frontend
cp .env.example .env
npm install
npm start                      # 🎨 Starts React app on port :3000
```

🎉 Open [http://localhost:3000](http://localhost:3000) in your browser!

> **💡 Pro Tip**: Monitor your background jobs via the **Bull Board UI** at: [http://localhost:4000/admin/queues](http://localhost:4000/admin/queues)

---

## 📡 Sample API Requests (via `curl`)

### 🟢 Register a New User

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123"}' | jq
```

### 🔑 Login

```bash
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}' | jq
```

_(Copy the `accessToken` from the response and export it as `$TOKEN` for the following requests)_

```bash
export TOKEN="<your_access_token>"
```

### ✍️ Create a Todo

```bash
curl -s -X POST http://localhost:4000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship the feature","priority":"high","tags":["work"],"dueDate":"2025-12-31T23:59:00"}' | jq
```

### 📋 List Todos (Paginated & Filtered)

```bash
curl -s "http://localhost:4000/api/todos?page=1&limit=10&priority=high&sortBy=dueDate&order=asc" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 🔄 Update Todo

```bash
curl -s -X PATCH http://localhost:4000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | jq
```

### ♻️ Refresh Token

```bash
curl -s -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your_refresh_token>"}' | jq
```

### 📊 Get Stats

```bash
curl -s http://localhost:4000/api/todos/stats \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 🤖 AI Chat

```bash
curl -s -X POST http://localhost:4000/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are my most important tasks?"}' | jq
```

---

## 🧠 Key Design Decisions & Architecture

### 🏛️ Architecture Layering

- **Clean Layered Boundaries**: Clear separation of concerns mapping **Router → Controller → Service → Repository → DB**.
- _No SQL in controllers!_
- _No business logic in repositories!_

### 🔒 Security Implementations

- **Robust Auth**: Short-lived Access Tokens (15 min) + securely rotating Refresh Tokens (7 days, stored as SHA-256 hashes in DB).
- **Endpoint Protection**: Utilising Helmet headers, strict CORS, and HttpOnly session cookies.
- **Rate Limiting**: Redis-backed limits (20 req/15min on auth endpoints, 100 req/15min on generic APIs).

### 💾 Database Optimisations

- **Smart Counting**: Uses the MySQL Window Function `COUNT(*) OVER()` to return both targeted rows and total row count in a **single query** (eliminating N+1 count queries).
- **Strategic Indexing**: Composite indexes deployed on `(user_id, completed)`, `(user_id, priority)`, and `(user_id, due_date)`. Active `FULLTEXT` indexing for rapid search features.

### ⚡ Performant Caching

- **User-Centric Cache Storage**: 60-second Redis cache tied strictly per user and filter combination.
- **Auto-Invalidation Mechanics**: The cache automatically flushes directly upon write operations (`create`/`update`/`delete`), ensuring users never see stale data.

### 🔄 Real-time Events

- **Socket.io Integration**: Includes native JWT middleware authentication interceptors.
- **Private Segmented Rooms**: Each authenticated user joins a dedicated `user:<id>` room upon connecting. Action events (`todo:created`, `todo:updated`) are safely emitted exclusively down their private channel.
- **Frontend Reactive Sync**: The React client acts transparently on this data, successfully invalidating the `react-query` cache instantaneously upon receiving socket broadcast events.

### 💼 Background Job Processing

- **BullMQ Integration**: Offloads demanding background actions (like notifications) safely with robust retry strategies and exponential backoff parameters.
- **Isolated Redis Link Config**: Utilizes a dedicated, secondary Redis connection strictly enforced for BullMQ message pub/sub separation.

### 🤖 AI Chat Assistant

- **Context-Aware Intelligence**: The AI assistant leverages the Google Gemini API, injected with the user's real-time todo context.
- **Natural Language Management**: Users can ask natural language questions about their tasks, priorities, and deadlines.

### 🖥️ Frontend UX

- **Performant Infinite Scrolling**: Modern `useInfiniteQuery` directly combined with a highly tuned `IntersectionObserver` sentinel div.
- **Optimistic UI Updates**: Snappy user interactions! Database changes (like toggling 'Done') visually process instantly for the user, while automatically rolling back state upon any network or database failures behind the scenes.
- **Smart Axios Interceptors**: Designed to silently detect `401 TOKEN_EXPIRED` exceptions, triggering a background background refresh, parsing the new token bundle into memory, and blindly cleanly re-submitting the queued original request totally transparently to the user!
- **Interactive AI Chat**: A floating, toggleable chat interface providing instant access to the AI assistant.

---

## 🐳 Deployment (Docker & Kubernetes)

### 🐋 Docker Compose (Local Dev)

Run the entire stack (Database, Redis, Backend, Frontend) locally:

```bash
export GEMINI_API_KEY="your_api_key"
docker-compose up --build
```

### 🏗️ AWS Cloud Infrastructure (Terraform)

Provision the production VPC, EKS Cluster, RDS Instance, and Ingress Controller:

1. **Initialize Terraform**:
```bash
cd terraform
terraform init
```

2. **Deploy Cluster**:
```bash
export TF_VAR_db_password="YourRDSSecretPassword"
terraform plan
terraform apply
```

3. **Configure Kubectl**:
```bash
aws eks update-kubeconfig --region us-east-1 --name zenith-eks-cluster
```

### ☸️ Kubernetes (Deployment)

1. **Configure Secrets**: Update `k8s/secrets.yaml` with your `gemini-api-key`.
2. **Apply Manifests**:
```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

> **Note**: The RDS instance address from Terraform output should be used to update the `DB_HOST` in the `backend.yaml` manifest.

---

## 👤 Author

**[Your Name]**
*Cloud Engineer*

Stay connected and feel free to reach out for collaborations or questions!

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/YOUR_LINKEDIN)
[![GitLab](https://img.shields.io/badge/GitLab-330F63?style=for-the-badge&logo=gitlab&logoColor=white)](https://gitlab.com/YOUR_GITLAB)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YOUR_GITHUB)

---

📝 _Built with ❤️ for productivity, efficiency, and scale._
