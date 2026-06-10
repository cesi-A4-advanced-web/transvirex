import * as bcrypt from 'bcryptjs';

/** Auto-incrementing counters for generating sequential entity references. */
let hubCounter = 0;
let userCounter = 0;
let vehicleCounter = 0;
let driverCounter = 0;
let customerCounter = 0;
let invoiceCounter = 0;
let deliveryCounter = 0;
let parcelCounter = 0;

/** Reset all reference counters to zero. */
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

/** Pad a number with leading zeros to a given length. */
function pad(n: number, len = 3) {
    return String(n).padStart(len, '0');
}

/** Generate the next hub reference (HUB-XXX). */
export function nextHubRef() {
    hubCounter++;
    return `HUB-${pad(hubCounter)}`;
}
/** Generate the next user reference (USR-XXX). */
export function nextUserRef() {
    userCounter++;
    return `USR-${pad(userCounter)}`;
}
/** Generate the next vehicle reference (VEH-XXX). */
export function nextVehicleRef() {
    vehicleCounter++;
    return `VEH-${pad(vehicleCounter)}`;
}
/** Generate the next driver reference (DRV-XXX). */
export function nextDriverRef() {
    driverCounter++;
    return `DRV-${pad(driverCounter)}`;
}
/** Generate the next customer reference (CUS-XXX). */
export function nextCustomerRef() {
    customerCounter++;
    return `CUS-${pad(customerCounter)}`;
}
/** Generate the next invoice reference (INV-XXX). */
export function nextInvoiceRef() {
    invoiceCounter++;
    return `INV-${pad(invoiceCounter)}`;
}
/** Generate the next delivery reference (DEL-XXX). */
export function nextDeliveryRef() {
    deliveryCounter++;
    return `DEL-${pad(deliveryCounter)}`;
}
/** Generate the next parcel reference (PAR-XXX). */
export function nextParcelRef() {
    parcelCounter++;
    return `PAR-${pad(parcelCounter)}`;
}

/** Hash a plaintext password using bcrypt with a salt round of 10. */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
