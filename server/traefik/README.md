# 🚦 Traefik Configuration

Traefik is the Ingress Controller that routes external traffic to services inside Kubernetes.

## Installation

```bash
# Add Helm repository
helm repo add traefik https://helm.traefik.io
helm repo update

# Install from root of repo
helm install traefik traefik/traefik \
  --namespace production \
  --create-namespace \
  -f server/traefik/values.yaml \
  --wait
```

## Verification

```bash
# Check deployment
kubectl get pods -n production -l app.kubernetes.io/name=traefik
kubectl get svc -n production

# Check logs
kubectl logs -n production -l app.kubernetes.io/name=traefik --tail=50

# Access dashboard
kubectl port-forward -n production svc/traefik 9000:9000
# Then visit: http://localhost:9000/dashboard
```

## Configuration

See `values.yaml` for:

- EntryPoints (ports 80, 443, 9000)
- TLS/SSL settings
- Dashboard settings
- Resource limits

## Troubleshooting

```bash
# If pods not running
kubectl describe pod -n production -l app.kubernetes.io/name=traefik

# If services not routing
kubectl get ingressroutes -n production
kubectl describe ingressroute -n production

# Common issues
# - Missing cert secret: kubectl get secrets -n production | grep certs
# - Port conflicts: netstat -tlnp | grep :80 or :443
```

## Documentation

- [Traefik Concepts](../../docs/02-CONCEPTS-TRAEFIK.md)
- [Installation Guide](../../docs/06-INSTALLATION-GUIDE.md)
- [Configuration Reference](../../docs/05-CONFIGURATION-REFERENCE.md)
