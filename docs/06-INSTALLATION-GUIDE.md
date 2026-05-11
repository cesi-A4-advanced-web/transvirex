# 🚀 Guide de Déploiement - Deux Phases

## 📚 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Phase 1: Initialisation du VPS](#phase-1-initialisation-du-vps)
4. [Phase 2: Déploiements automatisés](#phase-2-déploiements-automatisés)
5. [Secrets GitHub Actions](#secrets-github-actions)
6. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Le déploiement de Transvirex repose sur deux étapes claires:

- Préparer le VPS une seule fois avec Docker, Kubernetes, Helm, Traefik et les secrets.
- Laisser [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) construire l'image, la publier sur GHCR et mettre à jour le cluster automatiquement.

```mermaid
flowchart LR
    Phase1[Phase 1 - VPS] --> Phase2[Phase 2 - GitHub Actions]
    Phase2 --> Deploy[Déploiement automatique sur production]
```

---

## 🏗️ Architecture

Après la mise en place complète:

- `production` contient `transvirex-frontend`, Traefik et les ingress publics.
- `databases` contient PostgreSQL, Redis et RabbitMQ.
- GitHub Actions orchestre le build et le déploiement via SSH.

---

## 📋 Phase 1: Initialisation du VPS

### Prérequis

- Ubuntu 22.04 LTS recommandé.
- Accès SSH avec droits sudo.
- Docker, Kubernetes et Helm doivent être installables sur le VPS.

### Étapes

1. Mettre à jour le système.
2. Installer Docker et le plugin Compose.
3. Installer `kubelet`, `kubeadm` et `kubectl`.
4. Désactiver le swap et charger les modules kernel nécessaires.
5. Initialiser le cluster Kubernetes.
6. Installer Helm.
7. Créer les namespaces `production` et `databases`.
8. Installer Traefik avec `server/traefik/values.yaml`.
9. Créer les secrets TLS et GHCR dans le namespace `production`.

### Vérifications utiles

```bash
kubectl get nodes
kubectl get namespaces
kubectl get pods -n production
kubectl get pods -n databases
kubectl get svc -n production
```

---

## 🔄 Phase 2: Déploiements automatisés

### Ce que fait le workflow

Le workflow [.github/workflows/deploy.yml](../.github/workflows/deploy.yml):

1. Se déclenche sur `push` et `pull_request` vers `main` et `develop`.
2. Construit l'image depuis `src/frontend`.
3. Pousse l'image sur GHCR.
4. Se connecte au VPS via SSH.
5. Applique les manifests de `server/k8s`.
6. Redémarre `deployment/transvirex-frontend` dans `production`.

### Schéma du flux

```mermaid
flowchart LR
    Commit[Push sur GitHub] --> Actions[GitHub Actions]
    Actions --> Build[Build image frontend]
    Build --> GHCR[Push sur GHCR]
    GHCR --> SSH[SSH vers le VPS]
    SSH --> K8s[kubectl apply -k server/k8s]
    K8s --> Rollout[kubectl rollout restart transvirex-frontend]
```

---

## 🔐 Secrets GitHub Actions

Les secrets à configurer dans le dépôt sont:

- `VPS_HOST`
- `VPS_SSH_KEY`

`GITHUB_TOKEN` est fourni automatiquement par GitHub Actions pour l'accès à GHCR.

---

## 🆘 Dépannage

### Le workflow ne démarre pas

- Vérifier les branches ciblées dans `deploy.yml`.
- Vérifier que le fichier `.github/workflows/deploy.yml` est bien présent.

### L'accès SSH échoue

- Vérifier `VPS_HOST`.
- Vérifier la clé `VPS_SSH_KEY`.
- Tester la connexion SSH depuis une machine locale.

### Le déploiement Kubernetes échoue

```bash
kubectl get pods -n production
kubectl get events -n production
kubectl logs -n production -l app=transvirex-frontend
```

---

## ✅ Checklist finale

- [ ] Docker et Kubernetes installés sur le VPS
- [ ] Helm installé
- [ ] Namespaces `production` et `databases` créés
- [ ] Traefik déployé
- [ ] Secrets TLS et GHCR créés
- [ ] Secrets GitHub Actions configurés
- [ ] Workflow GitHub Actions validé
- [ ] Application accessible via `transvirex.com`

---

## 📖 Références

- [03-CONCEPTS-GITHUB-ACTIONS.md](./03-CONCEPTS-GITHUB-ACTIONS.md)
- [04-GITHUB-SECRETS.md](./04-GITHUB-SECRETS.md)
- [05-CONFIGURATION-REFERENCE.md](./05-CONFIGURATION-REFERENCE.md)
- [07-DEPLOYMENT-VPS.md](./07-DEPLOYMENT-VPS.md)
