import * as bcrypt from 'bcryptjs';

let hubCounter = 0;
let userCounter = 0;
let vehicleCounter = 0;
let driverCounter = 0;
let customerCounter = 0;
let invoiceCounter = 0;
let deliveryCounter = 0;
let parcelCounter = 0;

export function resetCounters() {
    hubCounter = 0;
    userCounter = 0;
    vehicleCounter = 0;
    driverCounter = 0;
    customerCounter = 0;
    invoiceCounter = 0;
    deliveryCounter = 0;
    parcelCounter = 0;
}

function pad(n: number, len = 3) {
    return String(n).padStart(len, '0');
}

export function nextHubRef() { hubCounter++; return `HUB-${pad(hubCounter)}`; }
export function nextUserRef() { userCounter++; return `USR-${pad(userCounter)}`; }
export function nextVehicleRef() { vehicleCounter++; return `VEH-${pad(vehicleCounter)}`; }
export function nextDriverRef() { driverCounter++; return `DRV-${pad(driverCounter)}`; }
export function nextCustomerRef() { customerCounter++; return `CUS-${pad(customerCounter)}`; }
export function nextInvoiceRef() { invoiceCounter++; return `INV-${pad(invoiceCounter)}`; }
export function nextDeliveryRef() { deliveryCounter++; return `DEL-${pad(deliveryCounter)}`; }
export function nextParcelRef() { parcelCounter++; return `PAR-${pad(parcelCounter)}`; }

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
