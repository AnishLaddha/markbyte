# 📝 Markbyte

**Markbyte** is a markdown-based no-code blogsite creation platform. It allows users to easily draft, publish, and manage styled markdown blog content — all powered by a modern full-stack web application.

> 🚀 Live Docs: [Markbyte Usage Docs](https://markbyte.xyz/markbyte-devs/usage_docs) | [GitHub Repo](https://github.com/AnishLaddha/markbyte)

---

## 📌 Overview

Markbyte is designed for bloggers, developers, and technical writers who want to effortlessly create beautiful blog posts using markdown, without needing to handle frontend code or deployment details.

**Tech Stack:**
- **Frontend:** React 18, TailwindCSS, ShadCN, Vite
- **Backend:** Golang, Chi, MongoDB, Redis, AWS S3
- **DevOps:** Docker, Docker Compose, GitHub Actions CI

---

## 📂 Project Structure

```

/
├── backend/           # Golang-based backend API
├── frontend/markbyte/ # React-based frontend
├── .github/           # CI/CD workflows
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md          # (This file)

````

For full file/folder reference, see:  
📄 [Folder Structure Documentation](https://markbyte.xyz/markbyte-devs/frontend_docs/folder-structure)

---

## ⚙️ Getting Started

### 🚧 Prerequisites
- Docker & Docker Compose
- (Optional for local development) Node.js & Go
- .env file  in backend/ with the following

```
S3_BUCKET_NAME=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
MONGO_URL=
GITHUB_TOKEN=
```

### 🐳 Run Entire Stack with Docker

```bash
# 1. Clone the repository
git clone https://github.com/AnishLaddha/markbyte
cd markbyte

# 2. Build and run the stack
docker-compose up -d --build

# 3. View the app
Frontend: http://localhost:5173  
Backend:  http://localhost:8080
````

### 🔍 Logs

```bash
docker-compose logs -f backend frontend       # Live logs
docker-compose logs -f | tee -a logs.txt      # Pipe all logs to file
docker-compose down                           # Stop all services
```

---

## 📚 Documentation

### 📌 Overview Docs (Self-Hosted)

* [Usage Docs](https://markbyte.xyz/markbyte-devs/usage_docs)
* [Backend Docs](https://markbyte.xyz/markbyte-devs/backend_docs)
* [Frontend Docs](https://markbyte.xyz/markbyte-devs/frontend_docs)
* [API Reference](https://markbyte.xyz/markbyte-devs/api_docs)

### 📄 GitHub Markdown Versions

* [`/README.md`](https://github.com/AnishLaddha/markbyte/blob/dev/README.md)
* [`/backend/README.md`](https://github.com/AnishLaddha/markbyte/blob/dev/backend/README.md)
* [`/frontend/docs/getting-started.md`](https://github.com/AnishLaddha/markbyte/blob/dev/frontend/markbyte/docs/getting-started.md)

---

## 🙋‍♀️ FAQ

> ❓ **Is there a CLI or user manual?**
> Not yet. The UI is designed to be intuitive for end-users. For devs running locally, follow the usage docs above.

> ❓ **Where do I find routing details and folder structure?**
> See: [`frontend_docs/routing.md`](https://markbyte.xyz/markbyte-devs/frontend_routing) and [`folder-structure.md`](https://markbyte.xyz/markbyte-devs/frontend_folder-structure)

---

## ✍️ Authors & Contributions

* **Shrijan Swaminathan**, **Anish Laddha**, and **Rishab Pangal**
  We welcome contributions via pull requests and issues!

> Feel free to fork the repo, submit PRs, or log issues. To get involved, check the GitHub Issues tab.

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
