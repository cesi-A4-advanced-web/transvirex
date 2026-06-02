import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class GatewayService {

    constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy, @Inject('BILLING_SERVICE') private billingClient: ClientProxy) {}

    getHello(): string {
        return 'Hello World!';
    }

    async getGatewayHealth() {
    return { status: 'ok' }
    }

    async getAuthHealth() {
        return firstValueFrom(this.authClient.send('health', {}).pipe(timeout(5000)))
    }

    async getBillingHealth() {
        return firstValueFrom(this.billingClient.send('health', {}).pipe(timeout(5000)))
    }
}
