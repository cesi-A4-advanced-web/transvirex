import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

interface SseClient {
    userId: string;
    role: string;
    res: Response;
}

@Injectable()
export class SseService {
    private clients = new Map<string, SseClient>();

    addClient(userId: string, role: string, res: Response): void {
        this.removeClient(userId);
        this.clients.set(userId, { userId, role, res });
    }

    removeClient(userId: string): void {
        const existing = this.clients.get(userId);
        if (existing) {
            try { existing.res.end(); } catch { /* ignore */ }
            this.clients.delete(userId);
        }
    }

    broadcast(event: string, data: unknown, filter?: (client: SseClient) => boolean): void {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const [, client] of this.clients) {
            if (filter && !filter(client)) continue;
            try {
                client.res.write(message);
            } catch {
                this.removeClient(client.userId);
            }
        }
    }

    /** Heartbeat every 30s to keep connections alive. */
    startHeartbeat(): () => void {
        const interval = setInterval(() => {
            for (const [, client] of this.clients) {
                try {
                    client.res.write(':heartbeat\n\n');
                } catch {
                    this.removeClient(client.userId);
                }
            }
        }, 30000);
        return () => clearInterval(interval);
    }
}
