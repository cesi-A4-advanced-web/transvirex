import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, ChannelModel } from 'amqplib';

/** RabbitMQ connection credentials (from environment or defaults). */
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'rabbitmq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_USER = process.env.RABBITMQ_USER || 'rabbitmq_user';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'rabbitmq_password';

/** Information about a RabbitMQ queue. */
export interface QueueInfo {
    name: string;
    messages: number;
    consumers: number;
    state: string;
}

/** Information about a RabbitMQ message. */
export interface MessageInfo {
    routingKey: string;
    exchange: string;
    properties: Record<string, any>;
    content: string;
}

/** Service for interacting with RabbitMQ — listing queues, fetching messages, and inspecting queues. */
@Injectable()
export class RabbitMQService implements OnModuleDestroy {
    private client: ChannelModel | null = null;

    /** Build the AMQP connection URL from environment variables. */
    private get url() {
        return `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}`;
    }

    /** Get (or create) the amqplib connection. */
    private async getClient(): Promise<ChannelModel> {
        if (!this.client) {
            this.client = await connect(this.url);
        }
        return this.client;
    }

    /** Close the connection on module destroy. */
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
        }
    }

    /** List all queues by querying the RabbitMQ management via a temporary response queue. */
    async listQueues(): Promise<QueueInfo[]> {
        const client = await this.getClient();
        const channel = await client.createChannel();

        const result: QueueInfo[] = [];

        try {
            const queues = await channel.assertQueue('', { exclusive: true, durable: false });
            const tempQueue = queues.queue;

            await channel.consume(
                tempQueue,
                (msg) => {
                    if (!msg) return;
                    const parsed = JSON.parse(msg.content.toString());
                    result.push({
                        name: parsed.name ?? parsed.queue?.name ?? 'unknown',
                        messages: parsed.messages ?? parsed.queue?.messages ?? 0,
                        consumers: parsed.consumers ?? parsed.queue?.consumers ?? 0,
                        state: parsed.queue?.state ?? 'running',
                    });
                },
                { noAck: true },
            );

            channel.publish('', 'amq.rabbitmq.response', Buffer.from(''), {
                replyTo: tempQueue,
                contentType: 'application/json',
            });

            await new Promise((resolve) => setTimeout(resolve, 1000));
        } finally {
            await channel.close();
        }

        return result;
    }

    /** Fetch up to `count` messages from a queue without acknowledging. */
    async getMessages(queue: string, count: number = 10): Promise<MessageInfo[]> {
        const client = await this.getClient();
        const channel = await client.createChannel();

        const messages: MessageInfo[] = [];

        try {
            await channel.assertQueue(queue, { durable: true });

            for (let i = 0; i < count; i++) {
                const msg = await channel.get(queue, { noAck: true });
                if (!msg) break;

                messages.push({
                    routingKey: msg.fields.routingKey,
                    exchange: msg.fields.exchange,
                    properties: msg.properties as any,
                    content: msg.content.toString('utf-8'),
                });
            }
        } finally {
            await channel.close();
        }

        return messages;
    }

    /** Get info for a specific queue by name. */
    async getQueueInfo(queue: string): Promise<QueueInfo | null> {
        const queues = await this.listQueues();
        return queues.find((q) => q.name === queue) ?? null;
    }
}
