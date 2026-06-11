# Manual Integration Testing — Transvirex ERP

This document lists manual test scenarios mapped to the user needs identified in the [Needs Analysis](NEEDS_ANALYSIS.md). Each scenario walks through a complete business flow across the platform.

---

## 1. Authentication & Role-Based Access

### 1.1 Login Flow

| Step | Action                                 | Expected Result                     |
| ---- | -------------------------------------- | ----------------------------------- |
| 1    | Navigate to `https://transvirex.local` | Login page is displayed             |
| 2    | Enter invalid credentials              | Error message "Invalid credentials" |
| 3    | Enter valid dispatcher credentials     | Redirected to dispatcher dashboard  |
| 4    | Log out                                | Returned to login page              |
| 5    | Enter valid driver credentials         | Redirected to driver dashboard      |
| 6    | Enter valid admin credentials          | Redirected to admin dashboard       |

### 1.2 Role Isolation

| Step | Action                                     | Expected Result                                                          |
| ---- | ------------------------------------------ | ------------------------------------------------------------------------ |
| 1    | Log in as driver                           | Only driver pages in sidebar (Dashboard, Deliveries, Assistant, Profile) |
| 2    | Navigate to `/admin/dashboard` directly    | 403 Forbidden or redirect                                                |
| 3    | Log in as dispatcher                       | Dispatcher pages visible; admin pages hidden                             |
| 4    | Navigate to `/admin/utilisateurs` directly | 403 Forbidden or redirect                                                |

---

## 2. Driver — Delivery Person

### 2.1 View Daily Route

| Step | Action                  | Expected Result                                            |
| ---- | ----------------------- | ---------------------------------------------------------- |
| 1    | Log in as a driver      | Dashboard shows today's deliveries                         |
| 2    | Click "Voir ma tournée" | List of assigned deliveries with times, addresses, parcels |
| 3    | Check past deliveries   | Status shows "Delivered" or appropriate status             |
| 4    | Check future deliveries | Status shows "Planned" with scheduled time                 |

### 2.2 Accept / Decline a Mission

| Step | Action                        | Expected Result                                                  |
| ---- | ----------------------------- | ---------------------------------------------------------------- |
| 1    | Open a pending delivery       | Action buttons: "Accepter" / "Refuser"                           |
| 2    | Click "Accepter"              | Status changes to "Delivering", dispatcher receives notification |
| 3    | Open another pending delivery | Click "Refuser" — status changes to "Cancelled"                  |
| 4    | Verify dispatcher view        | Dispatcher sees the refusal and the delivery is unassigned       |

### 2.3 Report Delivery Completion

| Step | Action                                 | Expected Result                                              |
| ---- | -------------------------------------- | ------------------------------------------------------------ |
| 1    | Open a delivery in "Delivering" status | Button "Livré" with optional photo/comment field             |
| 2    | Click "Livré"                          | Status changes to "Delivered", timestamp recorded            |
| 3    | Check the delivery history             | DeliveryEvent created with type "info", status "information" |

### 2.4 Report an Incident

| Step | Action                                                          | Expected Result                                            |
| ---- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| 1    | Open a delivery in progress                                     | Button "Signaler un incident"                              |
| 2    | Select incident type (retard / casse / adresse erronée / autre) | Form appears with description field                        |
| 3    | Fill description and submit                                     | Incident created, status changes to "Delayed" or "Blocked" |
| 4    | Check dispatcher view                                           | Dispatcher sees alert/notification about the incident      |

### 2.5 View Mission History

| Step | Action                        | Expected Result                                               |
| ---- | ----------------------------- | ------------------------------------------------------------- |
| 1    | Navigate to "Historique" page | List of all past deliveries with status, dates, and addresses |
| 2    | Click on a past delivery      | Detailed view: entire DeliveryEvent timeline                  |
| 3    | Filter by date or status      | Results filter correctly                                      |

---

## 3. Dispatcher — Hub Manager

### 3.1 Create and Assign a Mission

| Step | Action                                                    | Expected Result                                          |
| ---- | --------------------------------------------------------- | -------------------------------------------------------- |
| 1    | Log in as dispatcher                                      | Dashboard with workload overview                         |
| 2    | Click "Nouvelle livraison"                                | Creation form appears                                    |
| 3    | Fill: customer, pickup address, delivery address, parcels | Fields validated                                         |
| 4    | Select a driver from the dropdown                         | Only available drivers shown                             |
| 5    | Set scheduled time                                        | DateTime picker works                                    |
| 6    | Click "Créer et assigner"                                 | Status "Planned", driver sees the new mission on refresh |

### 3.2 Track Delivery Status in Real Time

| Step | Action                           | Expected Result                                                    |
| ---- | -------------------------------- | ------------------------------------------------------------------ |
| 1    | Open "Livraisons en cours"       | Table of active deliveries with current status                     |
| 2    | Notice driver accepts a delivery | Status changes from "Planned" to "Delivering" without page refresh |
| 3    | Notice driver marks as delivered | Status changes to "Delivered" with completion time                 |
| 4    | Notice driver reports incident   | Status changes to "Delayed" or "Blocked"                           |

### 3.3 View Global Workload

| Step | Action                     | Expected Result                                                    |
| ---- | -------------------------- | ------------------------------------------------------------------ |
| 1    | Open dashboard             | Cards showing: total deliveries today, by status, by driver        |
| 2    | View driver workload       | Each driver's assigned count per day                               |
| 3    | Identify overloaded driver | Visual indicator (color/icon) on drivers with 5+ active deliveries |

### 3.4 Receive Alerts on Delays or Anomalies

| Step | Action                                       | Expected Result                                              |
| ---- | -------------------------------------------- | ------------------------------------------------------------ |
| 1    | Driver delays a delivery past scheduled time | Notification appears in dispatcher UI (toast or alert badge) |
| 2    | Driver reports an incident                   | Alert with incident type and description                     |
| 3    | Click on notification                        | Navigates to the specific delivery detail                    |

---

## 4. Billing Department

### 4.1 Track Invoiced vs. Non-Invoiced Deliveries

| Step | Action                     | Expected Result                                        |
| ---- | -------------------------- | ------------------------------------------------------ |
| 1    | Log in as business manager | Dashboard with billing summary                         |
| 2    | Open "Facturation"         | Split view: invoices vs. deliveries awaiting invoicing |
| 3    | Filter by date range       | List updates correctly                                 |

### 4.2 Generate an Invoice

| Step | Action                                           | Expected Result                                                 |
| ---- | ------------------------------------------------ | --------------------------------------------------------------- |
| 1    | Select one or multiple deliveries for a customer | "Générer facture" button enabled                                |
| 2    | Click "Générer facture"                          | Invoice created with unique reference number                    |
| 3    | Verify invoice details                           | Correct customer, deliveries, parcel count, total HT/TTC, dates |
| 4    | Download invoice as PDF                          | PDF file downloads with proper layout and content               |
| 5    | Check delivery statuses                          | Deliveries now linked to the invoice                            |

### 4.3 Payment Tracking

| Step | Action                  | Expected Result                                 |
| ---- | ----------------------- | ----------------------------------------------- |
| 1    | Open an invoice         | Status: "Quotation" or "Invoice"                |
| 2    | Mark invoice as paid    | Status changes to "Paid", payment date recorded |
| 3    | View payment history    | List of paid invoices with amounts and dates    |
| 4    | Send a payment reminder | Reminder logged, optional email sent            |

---

## 5. Management — Logistics Director

### 5.1 Dashboard KPIs

| Step | Action                                                             | Expected Result                    |
| ---- | ------------------------------------------------------------------ | ---------------------------------- |
| 1    | Log in as admin                                                    | Executive dashboard with KPI cards |
| 2    | Verify KPIs: deliveries today, on-time %, avg delay, total revenue | Values match current data          |
| 3    | View delivery trend chart (last 7/30 days)                         | Chart renders correctly            |

### 5.2 Performance Analysis

| Step | Action                 | Expected Result                                               |
| ---- | ---------------------- | ------------------------------------------------------------- |
| 1    | Open "Rapports" page   | Report selection: by driver, hub, or region                   |
| 2    | Select "Par chauffeur" | Table: driver name, deliveries completed, avg time, incidents |
| 3    | Select "Par hub"       | Table sorted by hub with aggregated metrics                   |
| 4    | Export report as PDF   | PDF downloads with readable tables                            |

### 5.3 Identify Overload / Under-Utilization

| Step | Action                        | Expected Result                                                 |
| ---- | ----------------------------- | --------------------------------------------------------------- |
| 1    | Open hub overview dashboard   | Each hub listed with deliveries/hub and capacity indicator      |
| 2    | Hover over over-capacity hub  | Warning tooltip                                                 |
| 3    | View driver utilization chart | Color-coded: green (available), yellow (busy), red (overloaded) |

---

## 6. AI Assistant

### 6.1 Natural Language Chat

| Step | Action                                           | Expected Result                                     |
| ---- | ------------------------------------------------ | --------------------------------------------------- |
| 1    | Log in as driver                                 | "Assistant IA" link visible in sidebar              |
| 2    | Click to open chat                               | Chat interface with welcome message                 |
| 3    | Ask: "Quelles sont mes livraisons aujourd'hui ?" | AI returns list of today's deliveries with statuses |
| 4    | Ask: "Signaler un retard sur livraison LIV-042"  | AI confirms and creates incident                    |
| 5    | Ask in English: "Show my next delivery"          | AI responds in appropriate language                 |

### 6.2 Incident Detection

| Step | Action                                 | Expected Result                                    |
| ---- | -------------------------------------- | -------------------------------------------------- |
| 1    | Trigger a delivery past scheduled time | (Simulate: set delivery scheduled_at in the past)  |
| 2    | Wait for detection interval            | AI detects the overdue delivery                    |
| 3    | Check dispatcher dashboard             | Alert notification appears for the incident        |
| 4    | Open AI incident log                   | Incident recorded with delivery ID, time, and type |

### 6.3 Knowledge Base (RAG)

| Step | Action                                                 | Expected Result                                              |
| ---- | ------------------------------------------------------ | ------------------------------------------------------------ |
| 1    | Ask AI: "Comment signaler un colis endommagé ?"        | AI returns step-by-step procedure from knowledge base        |
| 2    | Ask: "Quel est le code douane pour les colis > 50kg ?" | AI retrieves relevant document chunk                         |
| 3    | Ask unrelated question                                 | AI stays on-topic or responds with "Je ne peux pas répondre" |

### 6.4 Smart Notifications

| Step | Action                                         | Expected Result                                          |
| ---- | ---------------------------------------------- | -------------------------------------------------------- |
| 1    | A delivery is reassigned to a different driver | (Simulate: dispatcher changes driver)                    |
| 2    | Check the new driver's UI                      | Toast or badge notification: "Nouvelle mission assignée" |
| 3    | Check the old driver's UI                      | Notification: "Mission LIV-042 retirée"                  |

---

## 7. Cross-Cutting Integration Tests

### 7.1 Full Delivery Lifecycle

| Step | Action                                     | Expected Result                              |
| ---- | ------------------------------------------ | -------------------------------------------- |
| 1    | Dispatcher creates delivery with 3 parcels | Delivery status: "Planned"                   |
| 2    | Dispatcher assigns to Driver               | Driver sees new mission                      |
| 3    | Driver accepts                             | Status: "Delivering", dispatcher sees update |
| 4    | Driver marks first 2 parcels delivered     | Partial delivery recorded                    |
| 5    | Driver reports 3rd parcel as damaged       | Incident created, status: "Delayed"          |
| 6    | Dispatcher sees alert                      | Notification with incident details           |
| 7    | Dispatcher cancels remaining parcel        | Delivery status: "Cancelled"                 |
| 8    | Billing team sees delivery                 | Delivery available for invoicing (partial)   |

### 7.2 Invoice Lifecycle

| Step | Action                                         | Expected Result                                     |
| ---- | ---------------------------------------------- | --------------------------------------------------- |
| 1    | Dispatcher creates 5 deliveries for Customer A | All 5 linked to Customer A                          |
| 2    | Drivers complete all 5 deliveries              | All status: "Delivered"                             |
| 3    | Billing generates invoice for Customer A       | Invoice includes all 5 deliveries, correct totals   |
| 4    | Download PDF                                   | PDF has correct header, line items, totals, QR code |
| 5    | Mark as paid                                   | Status updated                                      |

### 7.3 Multi-Hub Scenario

| Step | Action                                       | Expected Result                              |
| ---- | -------------------------------------------- | -------------------------------------------- |
| 1    | Admin creates Hub A (Paris) and Hub B (Lyon) | Both hubs visible                            |
| 2    | Add 2 drivers to each hub                    | Driver count per hub correct                 |
| 3    | Create deliveries for each hub               | Deliveries scoped to their hub               |
| 4    | Verify hub isolation                         | Dispatcher Hub A cannot see Hub B deliveries |

### 7.4 RabbitMQ Event Propagation

| Step | Action                                       | Expected Result                                               |
| ---- | -------------------------------------------- | ------------------------------------------------------------- |
| 1    | Driver accepts a delivery                    | RabbitMQ management UI shows message in `delivery.*` exchange |
| 2    | Driver reports incident                      | Queue `incident.alerts` receives message                      |
| 3    | Billing marks invoice as paid                | RabbitMQ message in `billing.*` exchange                      |
| 4    | Open RabbitMQ UI at `http://localhost:15672` | Queues, exchanges, and messages visible                       |

### 7.5 Debug & Monitoring

| Step | Action               | Expected Result                              |
| ---- | -------------------- | -------------------------------------------- |
| 1    | Navigate to `/debug` | Debug menu with health, logs, DB connections |
| 2    | Open Health          | All services show green status               |
| 3    | Open PostgreSQL      | Table list, row counts, query option         |
| 4    | Open Redis           | Key browser, cache stats                     |
| 5    | Open MongoDB         | Collections, document viewer                 |
| 6    | Open RabbitMQ        | Queue lengths, message rates                 |
| 7    | Open Logs            | Real-time log streaming from all services    |

---

## 8. Edge Cases & Error Handling

| Scenario                     | Steps                                                    | Expected Result                                         |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Duplicate delivery creation  | Submit form twice rapidly                                | Second submission rejected (idempotency)                |
| Assign to offline driver     | Select driver who is unavailable                         | Warning shown, assignment blocked                       |
| Empty invoice generation     | Try generating invoice with 0 deliveries                 | Validation error                                        |
| Very large payload           | Create delivery with 50 parcels                          | Success, no timeout                                     |
| Invalid JWT token            | Modify token in localStorage                             | Redirect to login                                       |
| Token expiry                 | Wait for ACCESS_TOKEN_TTL to pass                        | 401 response → silent refresh or redirect               |
| Concurrent driver assignment | Two dispatchers try to assign same driver simultaneously | Only one succeeds                                       |
| AI service down              | Stop AI container, send chat message                     | Graceful error: "Assistant temporairement indisponible" |
| Database connection lost     | Stop PostgreSQL, refresh page                            | Error message with retry option                         |
| Network timeout              | Simulate slow network                                    | Loading state, timeout error, retry button              |

---

## Prerequisites for Testing

Before running tests, ensure:

```bash
# 1. All services running
docker compose ps
# Expected: postgres, rabbitmq, redis, mongodb, frontend, gateway,
#            authentication, delivery, billing, stock, users, ai

# 2. Database seeded with test data
pnpm --filter @transvirex/backend prisma:seed

# 3. AI service health check
curl http://localhost:8000/health

# 4. Test credentials available
# - admin@transvirex.local / password (role: admin)
# - dispatcher@transvirex.local / password (role: dispatcher)
# - driver@transvirex.local / password (role: driver)
# - billing@transvirex.local / password (role: business_manager)
```

## Reporting Issues

When a test fails, note:

1. **Role** used (admin / dispatcher / driver / business_manager)
2. **Step** where the behaviour diverged
3. **Expected** vs **Actual** result
4. **Browser console** errors (F12 → Console)
5. **Service logs** from `docker compose logs <service>`

