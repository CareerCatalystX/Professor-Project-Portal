# CareerCatalystX — Professor Portal 🧑‍🏫

CareerCatalystX is a full-stack career acceleration platform designed to bridge the gap between students, professors, and real-world project opportunities.  
The **Professor Portal** enables faculty members to post real-world academic and research projects, evaluate student applications, and manage talent efficiently.

This repository contains the **professor-facing application** of CareerCatalystX.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)

---

## 🚀 Key Features

### 📢 Project Creation & Management
- Create and manage real-world projects with:
  - Title, description, duration, stipend
  - Required skills
  - Preferred student departments
  - Number of students required
- Enable project benefits:
  - Certification
  - Letter of Recommendation (LoR)
- Close or archive projects after completion

### 📥 Student Application Review
- View all applications per project
- Evaluate students based on:
  - Academic profile
  - Skills
  - Resume / CV
  - Cover letter
- Update application status:
  - Pending
  - Shortlisted
  - Accepted
  - Rejected
- Add internal professor notes for tracking decisions

### 🧑‍🏫 Professor Profile Management
- Department & designation
- Qualifications and research areas
- Office location & office hours
- Publications and personal website
- Profile completion tracking

### 🏫 College-Level Control
- Projects tied to verified college domains
- Controlled visibility across institutes
- Subscription-aware access to external students
- Structured project categorization

---

## 🧠 Architecture Highlights

- **Clear separation of roles** (Student vs Professor workflows)
- **Strong relational integrity** using Prisma ORM
- Efficient modeling of:
  - Professor → Projects → Applications
  - Project ↔ Skills (many-to-many)
- Designed to scale across multiple institutes and departments

---

## 🛠 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Node.js**
- **Express.js**
- **REST APIs**
- **Zod** (validation)

### Database
- **PostgreSQL**
- **Prisma ORM**

### Tooling
- Git & GitHub
- Docker (optional)
- Prisma Studio
- JWT-based authentication

---

## 📂 Core Models (Professor-Centric)

- User / UserAuth
- Professor Profile
- Project
- ProjectCategory
- Application
- Skill & ProjectSkill
- College
- Subscription & Plan

---

## 🧪 Local Setup

```bash
git clone https://github.com/CareerCatalystX/Professor-Project-Portal.git
cd careercatalystx-professor-portal

npm install
npx prisma generate
npx prisma migrate dev
npm run dev


# ================================
# Database Configuration
# ================================
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>/<DB_NAME>?sslmode=require"

# ================================
# Environment
# ================================
NODE_ENV="development"

# ================================
# Authentication
# ================================
JWT_SECRET="<your_jwt_secret>"

# ================================
# Application URLs
# ================================
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# ================================
# Email Service (Transactional Emails)
# ================================
EMAIL_USER="no-reply@yourdomain.com"
EMAIL_PASS="<email_password_or_app_key>"
