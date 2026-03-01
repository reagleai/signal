/**
 * ⚠️ MOCK DATA — All values in this file are entirely fictional.
 * No real company data, ticket IDs, financial figures, or user
 * information is represented here.
 */

export const integrations = [
    {
        id: 1,
        name: "Data Warehouse",
        shortName: "DW",
        iconBg: "#FF9900",
        iconInitial: "A",
        status: "synced",
        lastSyncTime: "06:33:30 AM",
        lastSyncDate: "Today",
        coveragePeriod: "Feb 22 – Feb 28, 2025",
        recordsPulled: "2,100,000",
        recordsUnit: "return records",
        ragStatus: "indexed",
        ragCount: 10,
        category: "Data Warehouse"
    },
    {
        id: 2,
        name: "Tableau / BI Tools",
        shortName: "BI",
        iconBg: "#E97627",
        iconInitial: "T",
        status: "synced",
        lastSyncTime: "06:33:30 AM",
        lastSyncDate: "Today",
        coveragePeriod: "Feb 22 – Feb 28, 2025",
        recordsPulled: "847",
        recordsUnit: "reports",
        ragStatus: "indexed",
        ragCount: 1,
        category: "BI"
    },
    {
        id: 3,
        name: "Zendesk Support",
        shortName: "ZD",
        iconBg: "#03363D",
        iconInitial: "Z",
        status: "synced",
        lastSyncTime: "06:32:30 AM",
        lastSyncDate: "Today",
        coveragePeriod: "Feb 22 – Feb 28, 2025",
        recordsPulled: "12,847",
        recordsUnit: "tickets",
        ragStatus: "indexed",
        ragCount: 1,
        category: "Support"
    },
    {
        id: 4,
        name: "App Store Reviews",
        shortName: "AS",
        iconBg: "#0D96F6",
        iconInitial: "A",
        status: "synced",
        lastSyncTime: "06:32:30 AM",
        lastSyncDate: "Today",
        coveragePeriod: "Feb 22 – Feb 28, 2025",
        recordsPulled: "4,203",
        recordsUnit: "reviews",
        ragStatus: "indexed",
        ragCount: 1,
        category: "Reviews"
    },
    {
        id: 5,
        name: "Productboard",
        shortName: "PB",
        iconBg: "#8B5CF6",
        iconInitial: "P",
        status: "synced",
        lastSyncTime: "06:33:30 AM",
        lastSyncDate: "Today",
        coveragePeriod: "Feb 22 – Feb 28, 2025",
        recordsPulled: "284",
        recordsUnit: "requests",
        ragStatus: "indexed",
        ragCount: 1,
        category: "Product"
    }
]

// ── Top-level summary metrics ─────────────
export const metricsData = {
    "7d": {
        returnRate: { value: 8.4, delta: 1.3, unit: "%", direction: "up-bad" },
        returnVolume: { value: 47832, delta: 12.4, unit: "", direction: "up-bad" },
        refundAmount: { value: 3.2, delta: 8.1, unit: "M", direction: "up-bad" },
        refundApprovalRate: { value: 91.2, delta: -2.1, unit: "%", direction: "down-bad" },
        fraudFlagRate: { value: 2.7, delta: 0.4, unit: "%", direction: "up-bad" },
        avgResolutionDays: { value: 3.2, delta: -0.4, unit: "d", direction: "down-good" },
        returnableRate: { value: 68, delta: 1.1, unit: "%", direction: "up-good" },
        nonReturnableRate: { value: 32, delta: -1.1, unit: "%", direction: "down-good" }
    },
    "30d": {
        returnRate: { value: 7.9, delta: 0.7, unit: "%", direction: "up-bad" },
        returnVolume: { value: 183400, delta: 9.2, unit: "", direction: "up-bad" },
        refundAmount: { value: 12.8, delta: 6.4, unit: "M", direction: "up-bad" },
        refundApprovalRate: { value: 92.8, delta: -0.9, unit: "%", direction: "down-bad" },
        fraudFlagRate: { value: 2.4, delta: 0.2, unit: "%", direction: "up-bad" },
        avgResolutionDays: { value: 3.5, delta: -0.1, unit: "d", direction: "down-good" },
        returnableRate: { value: 71, delta: 2.0, unit: "%", direction: "up-good" },
        nonReturnableRate: { value: 29, delta: -2.0, unit: "%", direction: "down-good" }
    },
    "90d": {
        returnRate: { value: 7.2, delta: -0.3, unit: "%", direction: "down-good" },
        returnVolume: { value: 521000, delta: 3.1, unit: "", direction: "up-bad" },
        refundAmount: { value: 38.4, delta: 2.8, unit: "M", direction: "up-bad" },
        refundApprovalRate: { value: 93.1, delta: 0.5, unit: "%", direction: "up-good" },
        fraudFlagRate: { value: 2.2, delta: -0.3, unit: "%", direction: "down-good" },
        avgResolutionDays: { value: 3.8, delta: -0.6, unit: "d", direction: "down-good" },
        returnableRate: { value: 73, delta: 3.0, unit: "%", direction: "up-good" },
        nonReturnableRate: { value: 27, delta: -3.0, unit: "%", direction: "down-good" }
    }
}

// ── Return Reason Code breakdown ──────────
export const returnReasonCodes = [
    {
        code: "Defective / Quality",
        shortCode: "Defective",
        pct: 28.4, count: 13584,
        color: "#C0392B",
        subReasons: [
            { label: "Electrical fault", pct: 34, count: 4619 },
            { label: "Build quality", pct: 28, count: 3803 },
            { label: "Does not work as described", pct: 22, count: 2988 },
            { label: "Stopped working shortly after use", pct: 16, count: 2174 }
        ]
    },
    {
        code: "Wrong Item Sent",
        shortCode: "Wrong Item",
        pct: 21.2, count: 10140,
        color: "#FF9900",
        subReasons: [
            { label: "Inaccurate website description", pct: 38, count: 3853 },
            { label: "Wrong style received - size/color", pct: 29, count: 2941 },
            { label: "Wrong brand received", pct: 20, count: 2028 },
            { label: "Product entirely different", pct: 13, count: 1318 }
        ]
    },
    {
        code: "Size or Fit Issue",
        shortCode: "Size / Fit",
        pct: 18.9, count: 9040,
        color: "#6B46C1",
        subReasons: [
            { label: "Size is too small", pct: 44, count: 3978 },
            { label: "Size is too large", pct: 38, count: 3435 },
            { label: "Did not fit well but size correct", pct: 18, count: 1627 }
        ]
    },
    {
        code: "Damaged / Used Product",
        shortCode: "Damaged",
        pct: 15.7, count: 7509,
        color: "#B7791F",
        subReasons: [
            { label: "Product damaged, shipping box OK", pct: 41, count: 3079 },
            { label: "Both product and box damaged", pct: 28, count: 2102 },
            { label: "Used product received", pct: 20, count: 1502 },
            { label: "Item is dirty/stained", pct: 11, count: 826 }
        ]
    },
    {
        code: "Item No Longer Needed",
        shortCode: "No Longer Needed",
        pct: 11.2, count: 5357,
        color: "#0066C0",
        subReasons: [
            { label: "No longer needed/wanted", pct: 35, count: 1875 },
            { label: "Better price available", pct: 28, count: 1500 },
            { label: "Item arrived too late", pct: 22, count: 1178 },
            { label: "Does not look good on me", pct: 15, count: 804 }
        ]
    },
    {
        code: "Missing Parts / Accessories",
        shortCode: "Missing Parts",
        pct: 4.6, count: 2201,
        color: "#067D62",
        subReasons: [
            { label: "Parts / Accessory missing", pct: 52, count: 1144 },
            { label: "Missing quantity", pct: 31, count: 682 },
            { label: "Entire item missing", pct: 17, count: 375 }
        ]
    }
]

// ── Returnable vs Non-returnable ──────────
export const returnableVsNot = [
    { name: "Returnable", value: 68, color: "#FF9900" },
    { name: "Non-Returnable", value: 32, color: "#E8EAED" }
]

// ── Weekly trend (returns + refunds) ──────
export const weeklyTrend = [
    { day: "Mon", returns: 6200, refunds: 5800, fraudFlags: 168 },
    { day: "Tue", returns: 7100, refunds: 6500, fraudFlags: 192 },
    { day: "Wed", returns: 8900, refunds: 8200, fraudFlags: 240 },
    { day: "Thu", returns: 7400, refunds: 6900, fraudFlags: 200 },
    { day: "Fri", returns: 9100, refunds: 8700, fraudFlags: 246 },
    { day: "Sat", returns: 5200, refunds: 4800, fraudFlags: 140 },
    { day: "Sun", returns: 3900, refunds: 3600, fraudFlags: 105 }
]

// ── Refund type breakdown ─────────────────
export const refundCategories = [
    { name: "Full Refund", pct: 54, count: 25829, color: "#FF9900" },
    { name: "Partial Refund", pct: 28, count: 13393, color: "#232F3E" },
    { name: "Store Credit", pct: 12, count: 5740, color: "#6B46C1" },
    { name: "Disputed", pct: 6, count: 2870, color: "#C0392B" }
]

// ── Return rate trend (past 8 weeks) ──────
export const returnRateTrend = [
    { week: "W1", rate: 6.8 },
    { week: "W2", rate: 7.0 },
    { week: "W3", rate: 7.1 },
    { week: "W4", rate: 7.4 },
    { week: "W5", rate: 7.2 },
    { week: "W6", rate: 7.8 },
    { week: "W7", rate: 8.1 },
    { week: "W8", rate: 8.4 }
]

// ── Sub-reason trend (top 3 growing) ──────
export const growingSubReasons = [
    {
        label: "Inaccurate website description",
        parent: "Wrong Item Sent",
        parentColor: "#FF9900",
        trend: [28, 31, 35, 38, 42, 45, 49, 53],
        weeks: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
        growthPct: 89.3
    },
    {
        label: "Product damaged, shipping box OK",
        parent: "Damaged / Used Product",
        parentColor: "#B7791F",
        trend: [18, 20, 22, 25, 24, 28, 30, 32],
        weeks: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
        growthPct: 77.8
    },
    {
        label: "Item arrived too late",
        parent: "Item No Longer Needed",
        parentColor: "#0066C0",
        trend: [12, 13, 14, 16, 17, 19, 21, 23],
        weeks: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
        growthPct: 91.7
    }
]

// ── Return Reason Code color map ──────────
export const reasonCodeColors = {
    "Defective / Quality Issues": "#C0392B",
    "Wrong Item Was Sent": "#FF9900",
    "Size or Fit Issue": "#6B46C1",
    "Damaged or Used Product": "#B7791F",
    "Item No Longer Needed": "#0066C0",
    "Missing Parts or Accessories": "#067D62"
}

// ── Master Problems ───────────────────────
export const masterProblems = [
    {
        id: 1, rank: 1,
        title: "App Crashes on Checkout",
        summary: "Critical failure in the mobile payment confirmation flow causing abandonment spikes, repeat support tickets, and downstream returns. Crash is concentrated on iOS 14.2 and correlates directly with app version 6.2.1 rollout.",
        confidence: 92, groundedness: 94, urgency: "critical",
        isNew: true, isRecurring: false,
        sources: ["Zendesk", "App Store Reviews", "DW"],
        frequency: 123, frequencyDelta: 34,
        estimatedImpact: "$2.4M",
        citationIds: [1, 2, 3, 5],
        reasonCodes: ["Defective / Quality Issues", "Item No Longer Needed"],
        subReasonDrivers: [
            { code: "Defective / Quality Issues", subReason: "Does not work as described", contributionPct: 22, note: "Crash misclassified as defect by customers" }
        ],
        nodeProblems: {
            "Zendesk": [
                { title: "Payment screen crash on iOS 14.2", count: 89, citationIds: [1] },
                { title: "Checkout timeout on slow connections", count: 34, citationIds: [2] }
            ],
            "App Store Reviews": [
                { title: "App freezes at address confirmation", count: 67, citationIds: [3] },
                { title: "Order not placed but payment pending", count: 22, citationIds: [4] }
            ],
            "DW": [
                { title: "iOS 14.2 crash rate 8.4% vs 1.2% baseline", count: null, citationIds: [2] },
                { title: "Checkout abandonment up 34% Wed–Fri", count: null, citationIds: [5] }
            ]
        }
    },
    {
        id: 2, rank: 2,
        title: "Defective Items — Supplier Batch #A4421",
        summary: "Elevated defect rate traced to a single supplier batch shipped in the last 10 days, driving a spike in 'Defective / Quality Issues' and 'Damaged or Used Product' return reason codes. Batch A4421 defect rate is 7x above the 2% threshold.",
        confidence: 87, groundedness: 89, urgency: "high",
        isNew: false, isRecurring: true,
        sources: ["DW", "Zendesk", "Productboard"],
        frequency: 98, frequencyDelta: 21,
        estimatedImpact: "$1.8M",
        citationIds: [6, 7],
        reasonCodes: ["Defective / Quality Issues", "Damaged or Used Product"],
        subReasonDrivers: [
            { code: "Defective / Quality Issues", subReason: "Stopped working shortly after use", contributionPct: 34, note: "Batch A4421 accounts for 68% of this sub-reason this week" },
            { code: "Damaged or Used Product", subReason: "Product damaged, but shipping box OK", contributionPct: 41, note: "Internal packaging failure in this batch" }
        ],
        nodeProblems: {
            "DW": [
                { title: "Defective rate for batch A4421 is 14.2%", count: null, citationIds: [6] },
                { title: "Return spike matches batch delivery dates", count: null, citationIds: [7] }
            ],
            "Zendesk": [
                { title: "Customers reporting same defect pattern", count: 61, citationIds: [6] },
                { title: "Escalations to supplier quality team", count: 12, citationIds: [] }
            ],
            "Productboard": [
                { title: "Request: Improve supplier defect SLA", count: 28, citationIds: [7] },
                { title: "Track defect rate per batch in dashboard", count: 15, citationIds: [] }
            ]
        }
    },
    {
        id: 3, rank: 3,
        title: "Slow Page Load on Product Detail Pages",
        summary: "Product detail page load times exceeding 4s on mobile, increasing bounce rates and correlating with 'Wrong Item Was Sent — Inaccurate website description' returns. Customers cannot load all images before purchasing.",
        confidence: 78, groundedness: 81, urgency: "high",
        isNew: false, isRecurring: false,
        sources: ["DW", "Zendesk"],
        frequency: 75, frequencyDelta: 8,
        estimatedImpact: "$940K",
        citationIds: [8, 9],
        reasonCodes: ["Wrong Item Was Sent", "Item No Longer Needed"],
        subReasonDrivers: [],
        nodeProblems: {
            "DW": [
                { title: "Mobile PDP load time avg 4.3s this week", count: null, citationIds: [8] },
                { title: "Bounce rate up 22% on mobile PDPs", count: null, citationIds: [9] }
            ],
            "Zendesk": [
                { title: "Images didn't load before purchase", count: 48, citationIds: [8] },
                { title: "Page crashed on product image scroll", count: 27, citationIds: [] }
            ]
        }
    },
    {
        id: 4, rank: 4,
        title: "Wrong Item Delivered — Fulfillment Errors",
        summary: "Fulfillment center packing errors sending wrong SKUs, concentrated in the Mumbai FC based on ticket origin data. Wrong SKU rate at Mumbai FC is 3.1% vs 0.9% baseline.",
        confidence: 71, groundedness: 76, urgency: "medium",
        isNew: false, isRecurring: true,
        sources: ["DW", "Zendesk", "App Store Reviews"],
        frequency: 61, frequencyDelta: 5,
        estimatedImpact: "$720K",
        citationIds: [10],
        reasonCodes: ["Wrong Item Was Sent"],
        subReasonDrivers: [],
        nodeProblems: {
            "DW": [
                { title: "Wrong SKU rate at Mumbai FC: 3.1%", count: null, citationIds: [10] },
                { title: "Return reason 'Wrong Item' up 18%", count: null, citationIds: [] }
            ],
            "Zendesk": [
                { title: "Tickets from Mumbai delivery zone up 34%", count: 42, citationIds: [10] },
                { title: "Repeat customers filing wrong-item claims", count: 19, citationIds: [] }
            ]
        }
    },
    {
        id: 5, rank: 5,
        title: "Refund Delays Causing Escalation Tickets",
        summary: "Refunds taking 8–12 days instead of the 5-day SLA, leading to repeat ticket filing and negative reviews. Customers selecting 'No longer needed/wanted' on re-orders after a bad refund experience.",
        confidence: 65, groundedness: 68, urgency: "medium",
        isNew: true, isRecurring: false,
        sources: ["Zendesk", "App Store Reviews"],
        frequency: 44, frequencyDelta: 12,
        estimatedImpact: "$340K",
        citationIds: [11],
        reasonCodes: ["Item No Longer Needed"],
        subReasonDrivers: [],
        nodeProblems: {
            "Zendesk": [
                { title: "Avg refund resolution now 9.4 days", count: 31, citationIds: [11] },
                { title: "27% of refund tickets are repeat submits", count: null, citationIds: [] }
            ],
            "App Store Reviews": [
                { title: "Reviews mentioning refund wait time", count: 13, citationIds: [11] },
                { title: "1-star reviews citing no refund response", count: 8, citationIds: [] }
            ]
        }
    }
]

// ── Citation Library ──────────────────────
export const citationLibrary = [
    { id: 1, source: "Zendesk", sourceColor: "#03363D", type: "ticket", ref: "Ticket #8992", preview: "User selected return reason: 'Defective or Quality Issues' and wrote: The app crashed on iOS 14.2 at the payment confirmation step. The item was never received but the return was filed as defective because there was no other matching option." },
    { id: 2, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Crash Rate by OS Version", tableData: { headers: ["OS Version", "Crash Rate"], rows: [["iOS 14.2", "8.4%"], ["iOS 14.1", "1.2%"], ["iOS 14.0", "1.0%"], ["Android 13", "0.9%"]] } },
    { id: 3, source: "App Store Reviews", sourceColor: "#0D96F6", type: "review", ref: "Review #29481 — 1★", preview: "1★ review. Customer selected return reason: 'Wrong Item Was Sent > Inaccurate website description'. Comment: Product page showed all features working but the app crashed during checkout — couldn't verify the item matched. Returned it." },
    { id: 4, source: "App Store Reviews", sourceColor: "#0D96F6", type: "review", ref: "Review #30012 — 1★", preview: "Got charged but no order was placed. Took 3 support tickets and 6 days to get my refund. Filed return as 'Item No Longer Needed — No longer needed/wanted' after the experience." },
    { id: 5, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Checkout Abandonment by Day", tableData: { headers: ["Day", "Abandonment Rate", "vs Avg"], rows: [["Wednesday", "34.2%", "+34%"], ["Thursday", "31.8%", "+25%"], ["Tuesday", "24.1%", "baseline"]] } },
    { id: 6, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Defect Rate — Batch A4421", tableData: { headers: ["Batch", "Defect Rate", "Threshold"], rows: [["A4421", "14.2%", "2.0% max"], ["A4420", "1.8%", "2.0% max"], ["A4419", "1.6%", "2.0% max"]] } },
    { id: 7, source: "Productboard", sourceColor: "#8B5CF6", type: "feature", ref: "Request #PR-881", preview: "PM Request: Add per-batch defect rate tracking in supplier dashboard. Batch A4421 defect rate was 14.2% — we only found out after returns spiked under 'Defective / Quality Issues' and 'Damaged or Used Product' codes." },
    { id: 8, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Mobile PDP Load Time — Feb 22–28", tableData: { headers: ["Platform", "Avg Load Time", "SLA"], rows: [["Mobile Web", "4.3s", "2.0s"], ["Desktop", "1.8s", "2.0s"], ["App", "2.2s", "2.0s"]] } },
    { id: 9, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Mobile Bounce Rate — Feb 22–28", tableData: { headers: ["Page Type", "Bounce Rate", "WoW"], rows: [["Product Detail", "54.2%", "+22%"], ["Cart", "31.1%", "+4%"], ["Homepage", "18.3%", "-1%"]] } },
    { id: 10, source: "Data Warehouse", sourceColor: "#FF9900", type: "query", ref: "Wrong SKU Rate by Fulfillment Center", tableData: { headers: ["FC", "Wrong SKU Rate", "vs Avg"], rows: [["Mumbai FC", "3.1%", "+2.3pp"], ["Delhi FC", "0.9%", "baseline"], ["Bangalore FC", "0.7%", "-0.1pp"]] } },
    { id: 11, source: "Zendesk", sourceColor: "#03363D", type: "ticket", ref: "Ticket Cluster — Refund Delays", preview: "Cluster of 31 tickets this week. Return reason filed: 'Item No Longer Needed — No longer needed/wanted'. Customer comments cite waiting 8–12 days for refund on previous order as reason for not re-ordering. 27% of these are repeat submissions with no response." }
]
