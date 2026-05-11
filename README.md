# 🚀 Transvirex ERP - Deployment Documentation

Welcome! This project contains complete, step-by-step documentation for deploying the Transvirex ERP system using Kubernetes, Traefik, and Jenkins.

**All documentation is in the `docs/` folder** → [Start Here! 📖](./docs/00-GETTING-STARTED.md)

---

## 📂 Quick Navigation

| Document                                                             | Purpose                                | Duration  |
| -------------------------------------------------------------------- | -------------------------------------- | --------- |
| **[📖 Getting Started](./docs/00-GETTING-STARTED.md)**               | Start here! Complete navigation guide  | 5 min     |
| [01 - Kubernetes Concepts](./docs/01-CONCEPTS-KUBERNETES.md)         | Understanding Kubernetes basics        | 15 min    |
| [02 - Traefik Concepts](./docs/02-CONCEPTS-TRAEFIK.md)               | Understanding routing & load balancing | 15 min    |
| [03 - Jenkins Concepts](./docs/03-CONCEPTS-JENKINS.md)               | Understanding CI/CD automation         | 15 min    |
| [04 - GitHub Secrets](./docs/04-GITHUB-SECRETS.md)                   | Secure configuration setup             | 15 min    |
| [05 - Configuration Reference](./docs/05-CONFIGURATION-REFERENCE.md) | YAML examples & configs                | 20 min    |
| [06 - Installation Guide](./docs/06-INSTALLATION-GUIDE.md)           | Main deployment guide                  | 30 min    |
| [07 - VPS Deployment](./docs/07-DEPLOYMENT-VPS.md)                   | Hands-on VPS setup (detailed)          | 2-3 hours |

---

## 🎯 What is this project?

**Transvirex ERP** is a complete microservices application with:

- 🌐 **Frontend**: NuxtJS single-page app
- 🔌 **Backend Services**: NestJS microservices (operations, users, AI, etc.)
- 💾 **Databases**: PostgreSQL, Redis, RabbitMQ, MongoDB
- 🚀 **Infrastructure**: Kubernetes cluster with Traefik ingress
- 🤖 **CI/CD**: Jenkins with GitHub webhooks for automated deployments

All deployable on **any VPS** by configuring GitHub secrets only!

---

## ⚡ Quick Start (2-3 minutes)

```bash
# 1. Read the main guide
open ./docs/00-GETTING-STARTED.md

# 2. For deployment
cd /your/vps
# Follow ./docs/07-DEPLOYMENT-VPS.md

# 3. GitHub secrets configured?
# Follow ./docs/04-GITHUB-SECRETS.md
```

---

## 📋 Project Structure

```
CESI_A4_DevWeb/
├── README.md                          # This file
├── index.html                         # Frontend template
│
├── docs/                              # 📚 Complete documentation
│   ├── 00-GETTING-STARTED.md         # Navigation & overview
│   ├── 01-CONCEPTS-KUBERNETES.md     # Kubernetes 101
│   ├── 02-CONCEPTS-TRAEFIK.md        # Traefik 101
│   ├── 03-CONCEPTS-JENKINS.md        # Jenkins 101
│   ├── 04-GITHUB-SECRETS.md          # GitHub secrets setup
│   ├── 05-CONFIGURATION-REFERENCE.md # YAML config examples
│   ├── 06-INSTALLATION-GUIDE.md      # Main deployment guide
│   └── 07-DEPLOYMENT-VPS.md          # Hands-on VPS setup
│
├── server/                            # Infrastructure config
│   ├── k8s/                          # Kubernetes manifests
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   ├── production/
│   │   └── databases/
│   ├── traefik/                      # Traefik Helm config
│   │   └── values.yaml
│   ├── jenkins/                      # Jenkins Helm config
│   │   └── values.yaml
│   └── install.sh                    # VPS setup script
│
├── .github/
│   └── workflows/                    # GitHub Actions CI/CD
│       ├── deploy-traefik.yml
│       ├── deploy-jenkins.yml
│       └── deploy-app.yml
│
└── [microservices]/                  # Your service code
    ├── service-operations/
    ├── service-users/
    └── service-ai/
```

---

## 🚀 Deployment Overview

### Phase 1: GitHub Configuration (5 min)

- Add 4 secrets to GitHub (KUBECONFIG, tokens, TLS certs)

### Phase 2: VPS Setup (2-3 hours, one-time)

- Install Docker, Kubernetes, Helm
- Deploy Traefik & Jenkins

### Phase 3: Automated Deployments

- Every git push triggers Jenkins
- Automatic tests, build, push, deploy

---

## 🆘 Support

1. **Start with**: [Getting Started guide](./docs/00-GETTING-STARTED.md)
2. **Learn concepts**: Read docs 01-03 for understanding
3. **Setup secrets**: Follow [GitHub Secrets guide](./docs/04-GITHUB-SECRETS.md)
4. **Deploy VPS**: Follow [VPS Deployment guide](./docs/07-DEPLOYMENT-VPS.md)
5. **Troubleshoot**: Check each doc's troubleshooting section

---

## 📞 Need Help?

- 📖 **All answers are in the docs/** folder
- 🔍 Search the docs for your error message
- 💬 Google: "Kubernetes [error]" or "Jenkins [problem]"
- 🤖 Ask ChatGPT technical questions

---

## 📝 License

This project uses open-source tools:

- [Kubernetes](https://kubernetes.io/)
- [Helm](https://helm.sh/)
- [Traefik](https://traefik.io/)
- [Jenkins](https://jenkins.io/)

---

## ✅ Ready?

👉 **[Start with Getting Started Guide →](./docs/00-GETTING-STARTED.md)**

Good luck! 🚀
