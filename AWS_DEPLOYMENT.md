# ☁️ CineVault Studio — AWS Deployment Guide

This guide details how to deploy **CineVault Studio** to **Amazon Web Services (AWS)** using **AWS Free Tier** services for the **AWS Builder Showcase Challenge**.

---

## ⚡ Option 1: AWS App Runner (Recommended — 1-Click Containerized Deployment)

**AWS App Runner** is a fully managed service that makes it easy for developers to quickly deploy containerized web applications directly from a GitHub repository.

### Steps:
1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy CineVault Studio to AWS App Runner"
   git push origin main
   ```
2. Open the [AWS App Runner Console](https://console.aws.amazon.com/apprunner).
3. Click **Create service**.
4. Select **Source code repository** and connect your GitHub repository (`ReelFind`).
5. Set deployment settings:
   - **Deployment trigger:** Automatic
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Port:** `4000`
6. Click **Create & Deploy**.
7. App Runner will generate your live production URL:
   `https://[your-app-id].us-east-1.awsapprunner.com`

---

## 🚀 Option 2: AWS Elastic Beanstalk (Node.js Platform)

1. Install AWS CLI & EB CLI:
   ```bash
   pip install awsebcli
   ```
2. Initialize Elastic Beanstalk in the project directory:
   ```bash
   eb init -p node.js cinevault-studio --region us-east-1
   ```
3. Create the production environment:
   ```bash
   eb create cinevault-prod
   ```
4. Open the deployed application:
   ```bash
   eb open
   ```
   Your app will be live at `http://cinevault-prod.us-east-1.elasticbeanstalk.com`.

---

## 📦 Option 3: AWS Amplify / EC2 Container Runner

1. Build & tag the Docker container locally:
   ```bash
   docker build -t cinevault-studio .
   ```
2. Push to **Amazon Elastic Container Registry (ECR)**:
   ```bash
   aws ecr create-repository --repository-name cinevault-studio
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com
   docker tag cinevault-studio:latest [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/cinevault-studio:latest
   docker push [ACCOUNT_ID].dkr.ecr.us-east-1.amazonaws.com/cinevault-studio:latest
   ```

---

## 🔒 Environment Variables to Configure on AWS

In your AWS App Runner / Beanstalk / ECS console, add the following environment variables:

| Key | Description | Optional / Required |
|---|---|---|
| `PORT` | `4000` | Required |
| `NODE_ENV` | `production` | Required |
| `GEMINI_API_KEY` | Your Gemini Pro / Flash API Key | Optional (Fallback built-in) |
| `PARALLEL_API_KEY` | Parallel Archival Search Key | Optional (Fallback built-in) |
| `CLERK_PUBLISHABLE_KEY` | Clerk Auth Key | Optional |
| `CLERK_SECRET_KEY` | Clerk Secret Key | Optional |

---

## ✅ Verifying Your AWS Deployment

After deploying, verify these routes on your live AWS domain:

- **Public Landing Page:** `https://[your-aws-domain]/`
- **Studio Workspace:** `https://[your-aws-domain]/dashboard`
- **Premiere Pro Panel:** `https://[your-aws-domain]/premiere`
- **Health Check:** `https://[your-aws-domain]/health` (Should return `{"status":"ok","timestamp":"..."}`)
