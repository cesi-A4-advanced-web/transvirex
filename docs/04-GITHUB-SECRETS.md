# 🔐 GitHub Secrets et Configuration CI/CD

## 🎯 En une phrase

Les **GitHub Secrets** sont des variables chiffrées stockées dans GitHub qui contiennent des informations sensibles. Le workflow actif [`deploy.yml`](../.github/workflows/deploy.yml) utilise principalement `VPS_HOST` et `VPS_SSH_KEY`.

---

## 📍 Pourquoi les secrets?

Ton pipeline CI/CD a besoin d'informations sensibles:

- Token d'accès GitHub (pour pusher les images)
- Credentials Docker (pour se connecter au registry)
- Kubeconfig (pour accéder au cluster Kubernetes)
- Tokens API (pour les services tiers)

**On NE peut PAS** les mettre en clair dans le code / GitHub (même repo privé = risqué).

**Solution :** GitHub Secrets

```
❌ Mauvais (JAMAIS faire ça):
  docker login ghcr.io -u myuser -p ghp_abc123def456xyz

✅ Bon (utiliser secrets):
  docker login ghcr.io -u ${{ secrets.GITHUB_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
```

---

## 🛠️ Types de secrets

### 1️⃣ **Repository Secrets** (au niveau du repo)

Visibles seulement pour ce repo et ses workflows.

**Configuration:** Settings → Secrets and variables → Actions → New repository secret

```
Repo: my-project
├─ Secret 1: KUBECONFIG_BASE64
├─ Secret 2: DOCKER_PASSWORD
└─ Secret 3: DOCKER_USERNAME
```

### 2️⃣ **Organization Secrets** (au niveau de l'org)

Partageables entre plusieurs repos d'une organisation.

**Configuration:** Organization → Settings → Secrets and variables → Actions

```
Org: mycompany
├─ Secret 1: VPS_SSH_KEY
├─ Secret 2: DOCKER_REGISTRY_URL
└─ Peut être utilisé par tous les repos de l'org
```

### 3️⃣ **Environment Secrets** (au niveau de l'environnement)

Spécifiques à un environnement de déploiement (dev, staging, production).

**Configuration:** Settings → Environments → [Env Name] → Secrets

```
Repo: my-project
├─ Environment: production
│  ├─ Secret 1: PROD_KUBECONFIG_BASE64
│  └─ Secret 2: PROD_ALERT_EMAIL
└─ Environment: staging
   ├─ Secret 1: STAGING_KUBECONFIG_BASE64
   └─ Secret 2: STAGING_ALERT_EMAIL
```

---

## 📋 Secrets nécessaires pour ce projet

### 0️⃣ **Secrets utilisés par `deploy.yml`**

- `VPS_HOST` : adresse du VPS cible
- `VPS_SSH_KEY` : clé privée SSH utilisée par GitHub Actions
- `GITHUB_TOKEN` : fourni automatiquement par GitHub Actions pour pousser sur GHCR

Les sections suivantes décrivent d'autres secrets historiques ou optionnels utilisés dans d'anciennes variantes du projet.

### 1️⃣ **KUBECONFIG_BASE64** (Accès au cluster K8s)

**Qu'est-ce que c'est :** Fichier de configuration Kubernetes encodé en base64

**Où le trouver :**

```bash
# Sur ton VPS, récupère la config Kubernetes
cat ~/.kube/config | base64 -w 0

# Si tu utilises Windows PowerShell:
[convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\.kube\config")) | Set-Clipboard
```

**Comment le créer dans GitHub :**

1. Va dans Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `KUBECONFIG_BASE64`
4. Value: Colle l'output `base64` (c'est un très long texte)
5. Click "Add secret"

**Utilisation dans workflow:**

```yaml
- name: Configure kubeconfig
  env:
      KUBECONFIG_BASE64: ${{ secrets.KUBECONFIG_BASE64 }}
  run: |
      echo "$KUBECONFIG_BASE64" | base64 -d > $HOME/.kube/config
      chmod 600 $HOME/.kube/config
      kubectl cluster-info  # Vérifie que ça marche
```

---

### 2️⃣ **DOCKER_PASSWORD** (Push images Docker)

**Qu'est-ce que c'est :** Token d'accès GitHub pour se connecter à GitHub Container Registry (ghcr.io)

**Comment le créer :**

1. Va sur https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Scopes à cocher:
    - ☑️ `repo` (accès aux repos)
    - ☑️ `write:packages` (push images Docker)
    - ☑️ `read:packages` (lire les images)
    - ☑️ `delete:packages` (supprimer les images)
4. Copy le token (tu ne le verras qu'une fois)

**Ajouter dans GitHub Secrets :**

1. Settings → Secrets and variables → Actions
2. Name: `DOCKER_PASSWORD_PERSONAL`
3. Value: Colle le token
4. Click "Add secret"

⚠️ Alternativement, GitHub fournit automatiquement `{{ secrets.DOCKER_PASSWORD }}` dans les workflows (avec les permissions du contexte actuel).

**Utilisation dans workflow:**

```yaml
- name: Login to GitHub Container Registry
  uses: docker/login-action@v2
  with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.DOCKER_PASSWORD }}

- name: Push image
  run: |
      docker push ghcr.io/${{ github.repository }}/mon-app:latest
```

---

### 3️⃣ **DOCKER_USERNAME** (Optionnel, si registry externe)

**Qu'est-ce que c'est :** Nom d'utilisateur pour se connecter au registry Docker

**Exemple :** Ton username GitHub

**Ajouter dans GitHub Secrets :**

1. Settings → Secrets and variables → Actions
2. Name: `DOCKER_USERNAME`
3. Value: `ton-username-github`
4. Click "Add secret"

---

### 4️⃣ **SSH_PRIVATE_KEY** (Optionnel, déploiement SSH)

**Qu'est-ce que c'est :** Clé SSH pour se connecter au VPS via SSH

**Comment le créer :**

```bash
# Sur ta machine locale
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""

# Envoie la clé publique au VPS
ssh-copy-id -i ~/.ssh/github-deploy.pub user@vps-ip

# Encode la clé privée en base64
cat ~/.ssh/github-deploy | base64 -w 0
```

**Ajouter dans GitHub Secrets :**

1. Settings → Secrets and variables → Actions
2. Name: `SSH_PRIVATE_KEY`
3. Value: Colle le contenu base64
4. Click "Add secret"

---

### 5️⃣ **TLS_CERT** & **TLS_KEY** (Certificats SSL)

**Qu'est-ce que c'est :** Certificat SSL custom (acheté chez Ionos ou autre)

**Format :** Fichiers `.crt` et `.key`

**Ajouter dans GitHub Secrets :**

```bash
# Encoder le certificat et la clé
cat nginx_transvirex.com.crt | base64 -w 0  # Copie le résultat
cat nginx_transvirex.com.key | base64 -w 0  # Copie le résultat
```

1. Settings → Secrets and variables → Actions
2. Name: `TLS_CERT_BASE64`
3. Value: Colle le certificat encodé
4. Repeat pour `TLS_KEY_BASE64`

**Utilisation dans workflow:**

```yaml
- name: Create TLS Secret
  env:
      TLS_CERT: ${{ secrets.TLS_CERT_BASE64 }}
      TLS_KEY: ${{ secrets.TLS_KEY_BASE64 }}
  run: |
      echo "$TLS_CERT" | base64 -d > /tmp/cert.crt
      echo "$TLS_KEY" | base64 -d > /tmp/cert.key

      kubectl create secret tls certs \
        --cert=/tmp/cert.crt \
        --key=/tmp/cert.key \
        -n production \
        --dry-run=client -o yaml | kubectl apply -f -
```

---

## 🔄 Workflow typique avec secrets

```yaml
name: Deploy Application

on:
    push:
        branches: [main]

jobs:
    deploy:
        runs-on: ubuntu-latest

        steps:
            - name: Checkout code
              uses: actions/checkout@v4

            - name: Configure kubeconfig
              env:
                  KUBECONFIG_BASE64: ${{ secrets.KUBECONFIG_BASE64 }}
              run: |
                  mkdir -p $HOME/.kube
                  echo "$KUBECONFIG_BASE64" | base64 -d > $HOME/.kube/config
                  chmod 600 $HOME/.kube/config

            - name: Login to GitHub Container Registry
              uses: docker/login-action@v2
              with:
                  registry: ghcr.io
                  username: ${{ github.actor }}
                  password: ${{ secrets.DOCKER_PASSWORD }}

            - name: Build and push image
              uses: docker/build-push-action@v4
              with:
                  context: ./services/my-app
                  push: true
                  tags: |
                      ghcr.io/${{ github.repository }}/my-app:latest
                      ghcr.io/${{ github.repository }}/my-app:${{ github.sha }}

            - name: Deploy to Kubernetes
              run: |
                  kubectl set image deployment/my-app \
                    my-app=ghcr.io/${{ github.repository }}/my-app:${{ github.sha }} \
                    -n production

                  kubectl rollout status deployment/my-app -n production --timeout=5m
```

---

## 📋 Variables d'environnement dans les workflows

GitHub fournit automatiquement des variables de contexte dans les workflows :

| Variable                                  | Valeur                                           |
| ----------------------------------------- | ------------------------------------------------ |
| `${{ github.actor }}`                     | Nom de l'utilisateur qui a déclenché le workflow |
| `${{ github.repository }}`                | `owner/repo-name`                                |
| `${{ github.ref }}`                       | La branche : `refs/heads/main`                   |
| `${{ github.sha }}`                       | Le commit SHA (complet ou court)                 |
| `${{ github.event.pull_request.number }}` | Numéro de la PR (si applicable)                  |
| `${{ secrets.DOCKER_PASSWORD }}`          | Token automatique du contexte                    |

**Exemple :**

```yaml
- name: Print context info
  run: |
      echo "Actor: ${{ github.actor }}"
      echo "Repository: ${{ github.repository }}"
      echo "Branch: ${{ github.ref }}"
      echo "Commit: ${{ github.sha }}"
```

---

## 🛡️ Bonnes pratiques de sécurité

### 1️⃣ **Limitation du scope des tokens**

- Crée un token dédié pour CI/CD (pas ton token personnel)
- Limite les scopes au strict nécessaire
- Ajoute une expiration

```bash
# ✅ Bon: Scopes limités
- repo
- write:packages
- read:packages

# ❌ Mauvais: Scope trop large
- admin (accès total)
```

### 2️⃣ **Rotation des secrets**

Renouvelle régulièrement les tokens/clés :

- Tous les 3-6 mois
- Immédiatement après compromission
- Après un changement de personnel

### 3️⃣ **Audit trail**

- Vérifie qui a accès aux secrets
- Github logs qui a lu un secret
- Use environment-specific secrets pour isoler prod

### 4️⃣ **Masquage automatique dans les logs**

GitHub masque automatiquement les secrets dans les logs :

```yaml
run: |
    echo "Token is: ${{ secrets.DOCKER_PASSWORD }}"
    # Output: Token is: ***
```

### 5️⃣ **Protection des workflows**

Exige des approvals pour les workflows sur branche main :

Settings → Environments → [Env] → Deployment protection rules → Require reviewers

---

## 🔍 Dépannage

### Problème: "Authentication failed"

```bash
# Vérifier que le token a les bonnes permissions
curl -H "Authorization: token ${{ secrets.DOCKER_PASSWORD }}" \
  https://api.github.com/user/repos

# Vérifier que la clé kubeconfig est valide
kubectl cluster-info
```

### Problème: Secret pas trouvé dans workflow

- Vérifier le nom exact du secret (case-sensitive)
- Vérifier que le secret est dans le bon scope (repo vs org vs env)
- Vérifier que le workflow a les permissions

### Problème: Docker push échoue

```yaml
# Vérifier la syntaxe du tag d'image
# Format correct: ghcr.io/OWNER/IMAGE_NAME:TAG

- name: Debug image tag
  run: echo "Image: ghcr.io/${{ github.repository }}/my-app:latest"
```

---

## ✅ Checklist configuration secrets

- [ ] KUBECONFIG_BASE64 créé et ajouté
- [ ] DOCKER_PASSWORD créé avec bons scopes
- [ ] TLS_CERT_BASE64 et TLS_KEY_BASE64 ajoutés (si custom certs)
- [ ] SSH_PRIVATE_KEY ajouté (si SSH deploy)
- [ ] Tokens testés et fonctionnels
- [ ] Accès aux secrets limités (security best practice)
- [ ] Expiration des tokens définie (rappel dans calendar)

---

## 📚 Ressources

- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- GitHub Container Registry: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry
- kubeconfig: https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/
