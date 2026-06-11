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
    scheduled_at: string | null;
    position_history: unknown;
    invoice: ApiInvoice;
    driver: ApiDriver | null;
    delivery_events?: Array<{
        id: string;
        delivery_id: string;
        description: string | null;
        latitude: number | null;
        longitude: number | null;
        type: string;
        status: string;
        resolution_description: string | null;
        created_at: string | null;
        resolution_date: string | null;
    }>;
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
        status: string | null;
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
    business_manager_id: string;
    customer_id: string;
    hub_id: string;
    pickup_address_id: string;
    delivery_address_id: string;
    payment_date: string | null;
    customer: {
        id: string;
        reference: string;
        customer_name: string | null;
        customer_type: string | null;
        contact_firstname: string | null;
        contact_lastname: string | null;
        phone_number: string | null;
        email: string | null;
        status: string | null;
    } | null;
    hub: {
        id: string;
        reference: string;
        name: string | null;
        manager_id: string | null;
        address_id: string | null;
        phone_number: string | null;
        capacity_parcels_day: number | null;
        status: string | null;
    } | null;
    business_manager: {
        id: string;
        reference: string;
        firstname: string | null;
        lastname: string | null;
        email: string | null;
    } | null;
    delivery_address?: {
        id?: string;
        address?: string | null;
        city?: string | null;
        postal_code?: string | null;
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
    hub: {
        id: string;
        reference: string;
        name: string | null;
    } | null;
    driver: {
        id: string;
        reference: string;
        rating: number | null;
        vehicle_id: string | null;
        vehicle: {
            id: string;
            reference: string;
            type: string | null;
            license_plate: string | null;
            status: string | null;
        } | null;
    } | null;
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

export interface ApiHub {
    id: string;
    reference: string;
    manager_id: string | null;
    address_id: string | null;
    name: string | null;
    phone_number: string | null;
    capacity_parcels_day: number | null;
    status: string;
    address: {
        id: string;
        address: string | null;
        street: string | null;
        city: string | null;
        postal_code: string | null;
    } | null;
    _count: {
        users: number;
        vehicles: number;
        customers: number;
        invoices: number;
    };
}

export interface ApiVehicle {
    id: string;
    hub_id: string | null;
    reference: string;
    type: string | null;
    license_plate: string | null;
    status: string | null;
    hub: {
        id: string;
        reference: string;
        name: string | null;
        phone_number: string | null;
        status: string | null;
    } | null;
    drivers: Array<{
        id: string;
        reference: string;
        user: {
            id: string;
            firstname: string | null;
            lastname: string | null;
            email: string | null;
        };
    }>;
}

export interface ApiParcel {
    id: string;
    invoice_id: string;
    reference: string;
    weight: number;
    invoice?: {
        id: string;
        reference: string;
        status: string | null;
        customer: { customer_name: string | null } | null;
        deliveries: Array<{
            id: string;
            reference: string;
            status: string | null;
        }>;
    };
}

export interface ApiInvoiceDetail extends ApiInvoice {
    parcels: ApiParcel[];
    deliveries: ApiDelivery[];
}
