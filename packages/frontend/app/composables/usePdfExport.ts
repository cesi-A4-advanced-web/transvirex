// Dynamic PDF export — jsPDF loaded client-side only on demand

// ── Brand palette ──────────────────────────────────────────────────────────
const P  = [26,  63,  122] as [number,number,number]  // #1a3f7a primary
const A  = [245, 158, 11]  as [number,number,number]  // #f59e0b accent
const W  = [255, 255, 255] as [number,number,number]  // white
const Tx = [15,  23,  42]  as [number,number,number]  // #0f172a text
const Mt = [100, 116, 139] as [number,number,number]  // #64748b muted
const Lx = [241, 245, 249] as [number,number,number]  // #f1f5f9 light
const Bx = [226, 232, 240] as [number,number,number]  // #e2e8f0 border
const Bl = [176, 201, 237] as [number,number,number]  // light blue (on dark bg)
const PD = [18,  44,  88]  as [number,number,number]  // slightly darker primary

const PW = 210 // A4 width mm
const PH = 297 // A4 height mm

// ── Shared drawing helpers ─────────────────────────────────────────────────

function header(doc: any, title: string, subtitle: string) {
    doc.setFillColor(...P)
    doc.rect(0, 0, PW, 38, 'F')

    // Logo text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...W)
    doc.text('TRANSVIREX', 14, 16)

    // Tagline
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...Bl)
    doc.text('Solutions de transport & logistique', 14, 22)

    // Contact line
    doc.setFontSize(6.5)
    doc.text('12 Rue de la Logistique — 75001 Paris  ·  contact@transvirex.fr  ·  +33 1 23 45 67 89', 14, 28)

    // Right: document type
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...W)
    doc.text(title, PW - 14, 15, { align: 'right' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...Bl)
    doc.text(subtitle, PW - 14, 22, { align: 'right' })

    // Date line right
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    doc.setFontSize(7)
    doc.text(`Émis le ${today}`, PW - 14, 29, { align: 'right' })

    // Accent stripe
    doc.setFillColor(...A)
    doc.rect(0, 38, PW, 2.5, 'F')
}

function footer(doc: any) {
    const pg = doc.getCurrentPageInfo().pageNumber
    const total = doc.getNumberOfPages()

    doc.setFillColor(...Lx)
    doc.rect(0, PH - 18, PW, 18, 'F')
    doc.setDrawColor(...Bx)
    doc.setLineWidth(0.3)
    doc.line(0, PH - 18, PW, PH - 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...Mt)
    doc.text('Transvirex SAS — SIRET 123 456 789 00001 — RCS Paris B 123 456 789 — Capital 50 000 €', 14, PH - 11)
    doc.text('TVA intracommunautaire : FR12 123456789 — Code APE 4941A — Licences transport T1/T2', 14, PH - 6.5)
    doc.text(`Page ${pg} / ${total}`, PW - 14, PH - 9, { align: 'right' })

    // Accent dot bottom-right
    doc.setFillColor(...A)
    doc.circle(PW - 6, PH - 6, 2, 'F')
}

function infoBlock(doc: any, x: number, y: number, w: number, h: number, title: string, lines: string[], dark = false) {
    if (dark) {
        doc.setFillColor(...P)
    } else {
        doc.setFillColor(...Lx)
    }
    doc.roundedRect(x, y, w, h, 3, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...(dark ? Bl : P))
    doc.text(title.toUpperCase(), x + 5, y + 7)

    doc.setDrawColor(...(dark ? [PD[0], PD[1], PD[2]] : Bx))
    doc.setLineWidth(0.3)
    doc.line(x + 5, y + 9.5, x + w - 5, y + 9.5)

    lines.forEach((line, i) => {
        const isBold = i === 0
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setFontSize(isBold ? 9.5 : 8)
        doc.setTextColor(...(dark ? (isBold ? W : Bl) : (isBold ? Tx : Mt)))
        doc.text(line, x + 5, y + 16 + i * 6.5)
    })
}

function kpiBox(doc: any, x: number, y: number, w: number, value: string, label: string, accent = false) {
    doc.setFillColor(...(accent ? A : P))
    doc.roundedRect(x, y, w, 18, 2.5, 2.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...W)
    doc.text(value, x + w / 2, y + 11, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...(accent ? [255, 230, 160] as [number,number,number] : Bl))
    doc.text(label, x + w / 2, y + 16, { align: 'center' })
}

function totalBox(doc: any, y: number, ht: string, tva: string, ttc: string) {
    const x = PW / 2 + 5
    const w = PW / 2 - 19

    doc.setFillColor(...Lx)
    doc.roundedRect(x, y, w, 34, 3, 3, 'F')

    const rows = [['Sous-total HT', ht], ['TVA (20%)', tva]]
    rows.forEach(([l, v], i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...Mt)
        doc.text(l, x + 6, y + 9 + i * 8)
        doc.setTextColor(...Tx)
        doc.text(v, x + w - 6, y + 9 + i * 8, { align: 'right' })
    })

    // Divider
    doc.setDrawColor(...Bx)
    doc.setLineWidth(0.3)
    doc.line(x + 6, y + 25, x + w - 6, y + 25)

    // Total row
    doc.setFillColor(...P)
    doc.roundedRect(x, y + 26, w, 8, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...W)
    doc.text('TOTAL TTC', x + 6, y + 31.5)
    doc.text(ttc, x + w - 6, y + 31.5, { align: 'right' })
}

async function loadPdf() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    return { jsPDF, autoTable }
}

// ── TABLE STYLES ──────────────────────────────────────────────────────────
const baseTable = {
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: { top: 4, bottom: 4, left: 4, right: 4 } },
    headStyles: { fillColor: P, textColor: W, fontStyle: 'bold' as const, fontSize: 8.5, cellPadding: { top: 5, bottom: 5, left: 4, right: 4 } },
    alternateRowStyles: { fillColor: Lx },
    margin: { left: 14, right: 14 },
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface FactureData {
    ref: string
    client: string
    service: string
    amount: string
    due: string
    status: string
    priority: string
}

export interface BonCommandeData {
    ref: string
    client: string
    service: string
    amount: string
    due: string
    status: string
}

export interface MissionStop {
    stop: number
    ref: string
    address: string
    city: string
    client: string
    time: string
    parcels?: number
    note?: string
}

export interface MissionData {
    ref: string
    driverName: string
    driverId: string
    vehicle: string
    plate: string
    hub: string
    date: string
    deliveries: MissionStop[]
}

// ─── Facture ───────────────────────────────────────────────────────────────
export async function exportFacturePdf(f: FactureData) {
    const { jsPDF, autoTable } = await loadPdf()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    header(doc, 'FACTURE', f.ref)

    const amountClean = parseFloat(f.amount.replace(/[€\s]/g, '').replace(',', '.')) || 0
    const ht = amountClean > 0 ? (amountClean / 1.2).toFixed(2).replace('.', ',') : '0,00'
    const tva = amountClean > 0 ? ((amountClean - amountClean / 1.2)).toFixed(2).replace('.', ',') : '0,00'
    const ttc = amountClean > 0 ? amountClean.toFixed(2).replace('.', ',') : '0,00'

    const y = 47

    // Bill-to block
    infoBlock(doc, 14, y, 86, 44, 'Facturer à', [
        f.client,
        '45 Rue du Commerce',
        '75015 Paris, France',
        'N° TVA : FR12 987654321',
    ])

    // Invoice info block (dark)
    infoBlock(doc, 108, y, 88, 44, 'Détails du document', [
        f.ref,
        `Statut : ${f.status}`,
        `Priorité : ${f.priority}`,
        `Échéance : ${f.due}`,
        `Service : ${f.service}`,
    ], true)

    // Items table
    autoTable(doc, {
        ...baseTable,
        startY: y + 51,
        head: [['Description', 'Qté', 'Prix unitaire HT', 'TVA', 'Total TTC']],
        body: [
            [`${f.service}\nPrestation Transvirex — réf. ${f.ref}`, '1', `€ ${ht}`, '20 %', f.amount],
            ['Frais de traitement & manutention', '1', '€ 0,00', '—', '€ 0,00'],
        ],
        columnStyles: {
            0: { cellWidth: 77 },
            1: { halign: 'center' as const, cellWidth: 18 },
            2: { halign: 'right' as const, cellWidth: 36 },
            3: { halign: 'center' as const, cellWidth: 18 },
            4: { halign: 'right' as const, cellWidth: 32, fontStyle: 'bold' as const },
        },
    })

    const tableEnd = (doc as any).lastAutoTable.finalY + 8

    totalBox(doc, tableEnd, `€ ${ht}`, `€ ${tva}`, `€ ${ttc}`)

    // Payment info
    doc.setFillColor(...Lx)
    doc.roundedRect(14, tableEnd, PW / 2 - 19, 34, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...P)
    doc.text('MODALITÉS DE PAIEMENT', 19, tableEnd + 8)
    const payLines = [
        'Virement bancaire — 30 jours date de facture',
        'IBAN : FR76 3000 4028 3700 0100 0712 345',
        'BIC : BNPAFRPPXXX — Banque BNP Paribas',
    ]
    payLines.forEach((l, i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...Tx)
        doc.text(l, 19, tableEnd + 16 + i * 6)
    })

    // Note
    const noteY = tableEnd + 46
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(14, noteY, PW - 28, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...A)
    doc.text('Note :', 19, noteY + 6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...Tx)
    doc.text(`Tout retard de paiement entraîne des pénalités de 3× le taux légal (art. L.441-10 C.com.). Indemnité forfaitaire : 40 €.`, 32, noteY + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...Mt)
    doc.text('Règlement litige : Tribunal de Commerce de Paris — www.transvirex.fr/cgu', 19, noteY + 11)

    footer(doc)
    doc.save(`${f.ref}.pdf`)
}

// ─── Bon de commande ──────────────────────────────────────────────────────
export async function exportBonCommandePdf(b: BonCommandeData) {
    const { jsPDF, autoTable } = await loadPdf()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    header(doc, 'BON DE COMMANDE', b.ref)

    const today = new Date().toLocaleDateString('fr-FR')
    const y = 47

    // Emetteur
    infoBlock(doc, 14, y, 86, 44, 'Émis par', [
        'Transvirex SAS',
        '12 Rue de la Logistique',
        '75001 Paris — France',
        `Date : ${today}`,
        `Réf. : ${b.ref}`,
    ])

    // Destinataire
    infoBlock(doc, 108, y, 88, 44, 'Destinataire', [
        b.client,
        '45 Avenue des Affaires',
        '75008 Paris, France',
        `Livraison prévue : ${b.due}`,
        `Service demandé : ${b.service}`,
    ], true)

    // KPIs
    const kW = (PW - 28 - 8) / 3
    kpiBox(doc, 14, y + 50, kW, '1', 'Prestation', false)
    kpiBox(doc, 14 + kW + 4, y + 50, kW, b.amount, 'Montant total', true)
    kpiBox(doc, 14 + (kW + 4) * 2, y + 50, kW, b.due, 'Livraison prévue', false)

    // Items table
    autoTable(doc, {
        ...baseTable,
        startY: y + 76,
        head: [['Désignation', 'Prestation / Description', 'Qté', 'Prix unitaire', 'Montant']],
        body: [
            [b.service, `Transport — ${b.ref}\nTransvirex SAS`, '1', b.amount, b.amount],
            ['Frais administratifs', 'Gestion de dossier transport', '1', '€ 0,00', '€ 0,00'],
        ],
        columnStyles: {
            0: { cellWidth: 38 },
            1: { cellWidth: 68 },
            2: { halign: 'center' as const, cellWidth: 14 },
            3: { halign: 'right' as const, cellWidth: 32 },
            4: { halign: 'right' as const, cellWidth: 30, fontStyle: 'bold' as const },
        },
    })

    const tableEnd = (doc as any).lastAutoTable.finalY + 8

    // Total
    doc.setFillColor(...P)
    doc.roundedRect(PW / 2 + 5, tableEnd, PW / 2 - 19, 10, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...W)
    doc.text('TOTAL', PW / 2 + 11, tableEnd + 7)
    doc.text(b.amount, PW - 20, tableEnd + 7, { align: 'right' })

    // Conditions
    doc.setFillColor(...Lx)
    doc.roundedRect(14, tableEnd, PW / 2 - 19, 10, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...P)
    doc.text('CONDITIONS GÉNÉRALES', 19, tableEnd + 7)

    const condY = tableEnd + 16
    doc.setFillColor(...Lx)
    doc.roundedRect(14, condY, PW - 28, 22, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...P)
    doc.text('CONDITIONS DE LA COMMANDE', 19, condY + 7)
    const conds = [
        '• Délai de livraison : 48h ouvrées après validation du bon de commande',
        '• Prise en charge : au dépôt Transvirex, Hub Paris Centre — 06h00 à 22h00',
        '• Tout litige doit être signalé dans les 48h — Tribunal de Commerce de Paris compétent',
    ]
    conds.forEach((c, i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...Tx)
        doc.text(c, 19, condY + 13 + i * 5)
    })

    // Signature blocks
    const sigY = condY + 30
    const sigW = (PW - 28) / 2 - 4

    doc.setFillColor(...Lx)
    doc.roundedRect(14, sigY, sigW, 36, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...P)
    doc.text('BON POUR ACCORD — CLIENT', 19, sigY + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...Mt)
    doc.text(`Société : ${b.client}`, 19, sigY + 15)
    doc.text(`Date de commande : ${today}`, 19, sigY + 21)
    doc.setDrawColor(...Bx)
    doc.setLineWidth(0.4)
    doc.line(19, sigY + 32, 14 + sigW - 5, sigY + 32)
    doc.setFontSize(7)
    doc.text('Signature & cachet', 19, sigY + 36)

    doc.setFillColor(...P)
    doc.roundedRect(14 + sigW + 8, sigY, sigW, 36, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...W)
    doc.text('VALIDATION TRANSVIREX', 14 + sigW + 13, sigY + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...Bl)
    doc.text('Responsable logistique', 14 + sigW + 13, sigY + 15)
    doc.text(`Émis le : ${today}`, 14 + sigW + 13, sigY + 21)
    doc.setDrawColor(...[80, 110, 160] as any)
    doc.line(14 + sigW + 13, sigY + 32, 14 + sigW * 2 + 3, sigY + 32)
    doc.setFontSize(7)
    doc.setTextColor(...Bl)
    doc.text('Signature', 14 + sigW + 13, sigY + 36)

    footer(doc)
    doc.save(`${b.ref}_bon-de-commande.pdf`)
}

// ─── Ordre de mission ─────────────────────────────────────────────────────
export async function exportOrdreMissionPdf(m: MissionData) {
    const { jsPDF, autoTable } = await loadPdf()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    header(doc, 'ORDRE DE MISSION', m.ref)

    const y = 47

    // Driver info
    infoBlock(doc, 14, y, 86, 46, 'Chauffeur', [
        m.driverName,
        `Identifiant : ${m.driverId}`,
        `Hub de départ : ${m.hub}`,
        `Date de mission : ${m.date}`,
    ])

    // Vehicle info
    infoBlock(doc, 108, y, 88, 46, 'Véhicule assigné', [
        m.vehicle,
        `Immatriculation : ${m.plate}`,
        `N° Mission : ${m.ref}`,
        `Nombre de stops : ${m.deliveries.length}`,
    ], true)

    // KPIs
    const kW = (PW - 28 - 8) / 3
    kpiBox(doc, 14, y + 52, kW, String(m.deliveries.length), 'Livraisons assignées', false)
    kpiBox(doc, 14 + kW + 4, y + 52, kW, m.deliveries[0]?.time ?? '—', 'Heure de départ', true)
    kpiBox(doc, 14 + (kW + 4) * 2, y + 52, kW, m.deliveries.at(-1)?.time ?? '—', 'Heure fin prévue', false)

    // Deliveries table
    autoTable(doc, {
        ...baseTable,
        startY: y + 78,
        head: [['#', 'Référence', 'Adresse & Ville', 'Destinataire', 'Heure', 'Colis', 'Observations', 'Signature']],
        body: m.deliveries.map(d => [
            String(d.stop),
            d.ref,
            `${d.address}\n${d.city}`,
            d.client,
            d.time,
            d.parcels != null ? String(d.parcels) : '—',
            d.note ?? '',
            '',
        ]),
        columnStyles: {
            0: { halign: 'center' as const, cellWidth: 10, fontStyle: 'bold' as const },
            1: { cellWidth: 24, fontSize: 7.5 },
            2: { cellWidth: 46 },
            3: { cellWidth: 34 },
            4: { halign: 'center' as const, cellWidth: 14 },
            5: { halign: 'center' as const, cellWidth: 13 },
            6: { cellWidth: 28, fontSize: 7.5, textColor: [150, 80, 0] as any },
            7: { cellWidth: 17 },
        },
        didDrawCell: (data: any) => {
            // Dashed border for signature column
            if (data.column.index === 7 && data.section === 'body') {
                const { x, y: cy, width, height } = data.cell
                data.doc.setDrawColor(...Bx)
                data.doc.setLineWidth(0.3)
                data.doc.rect(x + 2, cy + height - 6, width - 4, 4)
            }
        },
    })

    const tableEnd = (doc as any).lastAutoTable.finalY + 8

    // Instructions block
    doc.setFillColor(255, 251, 235)
    doc.roundedRect(14, tableEnd, PW - 28, 26, 3, 3, 'F')
    doc.setDrawColor(...A)
    doc.setLineWidth(0.8)
    doc.line(14, tableEnd, 14, tableEnd + 26)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(180, 100, 0)
    doc.text('CONSIGNES OBLIGATOIRES', 19, tableEnd + 7)
    const instructions = [
        '• Scanner chaque colis avant chargement et à chaque livraison — signaler toute anomalie immédiatement',
        '• En cas d\'absence : déposer un avis de passage + photo + appeler le dispatcher au 01 23 45 67 89',
        '• Accidents / pannes : composer le 17 ou 15 selon la situation, puis prévenir le dispatcher',
        '• Retour hub obligatoire après la dernière livraison — déposer le présent document signé',
    ]
    instructions.forEach((line, i) => {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...Tx)
        doc.text(line, 19, tableEnd + 13 + i * 4.5)
    })

    // Signature area
    const sigY = tableEnd + 38
    const sW = (PW - 28 - 8) / 2

    doc.setFillColor(...Lx)
    doc.roundedRect(14, sigY, sW, 30, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...P)
    doc.text('SIGNATURE CHAUFFEUR', 19, sigY + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...Mt)
    doc.text(`Nom : ${m.driverName}`, 19, sigY + 14)
    doc.text('Prise en charge le :  ____/____/______  à  ____h____', 19, sigY + 20)
    doc.setDrawColor(...Bx)
    doc.setLineWidth(0.4)
    doc.line(19, sigY + 28, 14 + sW - 5, sigY + 28)

    doc.setFillColor(...P)
    doc.roundedRect(14 + sW + 8, sigY, sW, 30, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...W)
    doc.text('VALIDATION DISPATCHER', 14 + sW + 13, sigY + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...Bl)
    doc.text('Responsable dispatch :', 14 + sW + 13, sigY + 14)
    doc.text('Heure de départ autorisée : ____h____', 14 + sW + 13, sigY + 20)
    doc.setDrawColor([80, 110, 160] as any)
    doc.line(14 + sW + 13, sigY + 28, 14 + sW * 2 + 3, sigY + 28)

    footer(doc)
    doc.save(`${m.ref}_ordre-de-mission.pdf`)
}

export function usePdfExport() {
    return { exportFacturePdf, exportBonCommandePdf, exportOrdreMissionPdf }
}
