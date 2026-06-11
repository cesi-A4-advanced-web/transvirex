"""Base de connaissances métier Transvirex pour le RAG.

Ces documents sont insérés (upsert idempotent) dans la collection MongoDB
`rag_documents` au démarrage de l'AI service. Chaque entrée possède un `slug`
unique servant de clé d'upsert : modifier le `content` puis redémarrer le
service met le document à jour sans créer de doublon.

Pour ajouter une connaissance : ajoute une entrée avec un `slug` unique.
"""

KNOWLEDGE_DOCS: list[dict] = [
    {
        "content": (
            "Procédure de livraison standard chez Transvirex.\n"
            "1. À l'arrivée sur le lieu de livraison, vérifier l'adresse et le nom du client/destinataire.\n"
            "2. Contrôler l'état des colis avant remise (aucun dommage visible).\n"
            "3. Faire signer le bon de livraison ou prendre une preuve de livraison "
            "(photo du colis remis, signature électronique).\n"
            "4. Marquer la livraison comme 'Livré' (delivered) dans l'application une fois remise effectuée.\n"
            "5. En cas d'impossibilité de livrer, ne jamais laisser le colis sans preuve : "
            "signaler l'incident via l'assistant."
        ),
        "metadata": {"slug": "procedure-livraison-standard", "type": "procedure", "theme": "livraison"},
    },
    {
        "content": (
            "Client absent lors de la livraison.\n"
            "Si le destinataire est absent : 1) attendre quelques minutes et tenter de le joindre par téléphone ; "
            "2) ne jamais laisser un colis sans signature dans un lieu non sécurisé ; "
            "3) signaler l'incident dans l'assistant en précisant le client et l'adresse — "
            "le dispatcher décidera d'une nouvelle tentative ou d'un retour en hub.\n"
            "La livraison reste 'En cours' jusqu'à décision du dispatcher."
        ),
        "metadata": {"slug": "client-absent", "type": "incident", "theme": "livraison"},
    },
    {
        "content": (
            "Colis endommagé.\n"
            "Si un colis est endommagé (avant ou pendant la livraison) : "
            "1) prendre des photos du dommage ; "
            "2) ne pas remettre un colis manifestement détérioré sans accord du client ; "
            "3) signaler immédiatement l'incident via l'assistant avec une description du dommage. "
            "Un colis endommagé constitue un incident de sévérité MEDIUM à HIGH selon la valeur/criticité."
        ),
        "metadata": {"slug": "colis-endommage", "type": "incident", "theme": "colis"},
    },
    {
        "content": (
            "Retard et embouteillage.\n"
            "En cas de retard prévisible (bouchon, trafic dense, créneau dépassé) : "
            "signaler le retard via l'assistant pour que le dispatcher prévienne le client. "
            "Passer la livraison concernée au statut 'Retardé' (delayed) si tu ne peux pas tenir l'horaire. "
            "Un simple retard de trafic est généralement de sévérité LOW à MEDIUM."
        ),
        "metadata": {"slug": "retard-embouteillage", "type": "incident", "theme": "circulation"},
    },
    {
        "content": (
            "Accident, panne ou problème de sécurité.\n"
            "En cas d'accident de la route, de panne du véhicule ou de tout problème de sécurité : "
            "1) se mettre en sécurité et appeler les secours si nécessaire (112) ; "
            "2) signaler immédiatement l'incident via l'assistant — c'est une priorité CRITICAL ou HIGH ; "
            "3) le dispatcher est notifié automatiquement pour réorganiser la tournée. "
            "Ne jamais poursuivre la tournée avec un véhicule non sûr."
        ),
        "metadata": {"slug": "accident-panne-securite", "type": "incident", "theme": "securite"},
    },
    {
        "content": (
            "Statuts d'une livraison et transitions autorisées pour le chauffeur.\n"
            "- Planifié (planned) : la livraison est assignée mais pas commencée. Actions : Démarrer, Bloquer, Annuler.\n"
            "- En cours (delivering) : tournée en cours vers le client. Actions : Livré, Retard, Problème.\n"
            "- Retardé (delayed) : retard signalé. Actions : Reprendre, Livré.\n"
            "- Bloqué (blocked) : incident bloquant. Action : Reprendre.\n"
            "- Livré (delivered) : remise effectuée, statut final.\n"
            "- Annulé (cancelled) : livraison annulée, statut final.\n"
            "Le chauffeur change le statut depuis le dashboard livreur."
        ),
        "metadata": {"slug": "statuts-livraison", "type": "reference", "theme": "livraison"},
    },
    {
        "content": (
            "Preuve de livraison (POD).\n"
            "Toute livraison remise doit être accompagnée d'une preuve : signature du destinataire "
            "ou photo du colis remis avec horodatage. La preuve protège le chauffeur et Transvirex "
            "en cas de litige. Sans preuve, ne pas passer la livraison en 'Livré'."
        ),
        "metadata": {"slug": "preuve-de-livraison", "type": "procedure", "theme": "livraison"},
    },
    {
        "content": (
            "Escalade vers le dispatcher.\n"
            "Le dispatcher est le point de contact pour toute décision opérationnelle : nouvelle tentative, "
            "réaffectation d'une livraison, retour en hub, gestion d'un litige client. "
            "Lorsqu'un incident de sévérité CRITICAL ou HIGH est signalé via l'assistant, "
            "une notification est créée automatiquement pour le dispatcher. "
            "Pour les sévérités MEDIUM/LOW, l'incident est enregistré mais ne déclenche pas de notification immédiate."
        ),
        "metadata": {"slug": "escalade-dispatcher", "type": "procedure", "theme": "organisation"},
    },
    {
        "content": (
            "Relation client sur le terrain.\n"
            "Rester courtois et professionnel en toutes circonstances. Se présenter au nom de Transvirex, "
            "vérifier l'identité du destinataire pour les colis sensibles, et ne pas s'engager sur des "
            "informations commerciales (prix, délais futurs) : rediriger le client vers le service client. "
            "En cas de réclamation, noter la demande et signaler via l'assistant plutôt que d'improviser."
        ),
        "metadata": {"slug": "relation-client", "type": "procedure", "theme": "relation-client"},
    },
    {
        "content": (
            "Ordre de mission et tournée du jour.\n"
            "Chaque chauffeur reçoit une tournée du jour listant ses livraisons assignées dans l'ordre. "
            "L'ordre de mission (PDF) est téléchargeable depuis la page 'Mes livraisons'. "
            "Respecter l'ordre des arrêts sauf imprévu (route barrée, client injoignable), "
            "et signaler tout écart via l'assistant pour garder le dispatcher informé."
        ),
        "metadata": {"slug": "ordre-de-mission", "type": "reference", "theme": "organisation"},
    },
]
