import { $fetch } from 'ofetch';

export function useApi() {
    async function get<T>(url: string, params?: Record<string, any>): Promise<T> {
        return $fetch<T>(`/api${url}`, { params, credentials: 'include' });
    }

    async function post<T>(url: string, body?: any): Promise<T> {
        return $fetch<T>(`/api${url}`, { method: 'POST', body, credentials: 'include' });
    }

    async function patch<T>(url: string, body?: any): Promise<T> {
        return $fetch<T>(`/api${url}`, { method: 'PATCH', body, credentials: 'include' });
    }

    async function del<T>(url: string): Promise<T> {
        return $fetch<T>(`/api${url}`, { method: 'DELETE', credentials: 'include' });
    }

    return { get, post, patch, del };
}

export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    limit: number;
    total: number;
}

export interface ApiDelivery {
    id: string;
    invoices_id: string;
    driver_id: string | null;
    reference: string;
    status: string;
    notes: string | null;
    position_history: unknown;
    invoice: ApiInvoice;
    driver: ApiDriver | null;
}

export interface ApiDriver {
    id: string;
    reference: string;
    rating: number;
    vehicle_id: string | null;
    user: {
        id: string;
        reference: string;
        firstname: string | null;
        lastname: string | null;
        email: string | null;
    };
    vehicle: {
        id: string;
        reference: string;
        type: string | null;
        license_plate: string | null;
    } | null;
}

export interface ApiInvoice {
    id: string;
    reference: string;
    service_type: string | null;
    priority: string;
    due_date: string;
    amount: number;
    status: string;
    customer: {
        id: string;
        reference: string;
        customer_name: string | null;
    } | null;
    hub: {
        id: string;
        reference: string;
        name: string | null;
    } | null;
    business_manager: {
        id: string;
        reference: string;
        firstname: string | null;
        lastname: string | null;
        email: string | null;
    } | null;
}

export interface ApiUser {
    id: string;
    reference: string;
    hub_id: string | null;
    firstname: string | null;
    lastname: string | null;
    phone_number: string | null;
    email: string | null;
    status: string;
    role: string;
}

export interface ApiCustomer {
    id: string;
    reference: string;
    customer_name: string | null;
    customer_type: string | null;
    contact_firstname: string | null;
    contact_lastname: string | null;
    phone_number: string | null;
    email: string | null;
    status: string;
    hub: { id: string; reference: string; name: string | null } | null;
    active_invoices: number;
}

export interface ApiParcel {
    id: string;
    invoice_id: string;
    reference: string;
    weight: number;
}

export interface ApiDriverDashboardDelivery {
    id: string;
    reference: string;
    status: string | null;
    notes: string | null;
    customer: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    due_date: string | null;
    parcels: number;
}

export interface ApiDriverDashboard {
    driver: { reference: string; rating: number | null } | null;
    deliveries: ApiDriverDashboardDelivery[];
}

export interface ApiDriverProfile {
    user: {
        firstname: string | null;
        lastname: string | null;
        email: string | null;
        phone_number: string | null;
    };
    hub: { name: string | null };
    driver: { reference: string; rating: number | null } | null;
    vehicle: { reference: string; type: string | null; license_plate: string | null } | null;
    stats: { total: number; delivered: number; success_rate: number };
}
