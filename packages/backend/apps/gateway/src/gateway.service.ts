import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class GatewayService {

    constructor(
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
        @Inject('BILLING_SERVICE') private billingClient: ClientProxy,
        @Inject('STOCK_SERVICE') private stockClient: ClientProxy,
        @Inject('TOURS_SERVICE') private toursClient: ClientProxy,
        @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    ) {}

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

    async getStockHealth() {
        return firstValueFrom(this.stockClient.send('health', {}).pipe(timeout(5000)))
    }

    async getToursHealth() {
        return firstValueFrom(this.toursClient.send('health', {}).pipe(timeout(5000)))
    }

    async getUsersHealth() {
        return firstValueFrom(this.usersClient.send('health', {}).pipe(timeout(5000)))
    }
}