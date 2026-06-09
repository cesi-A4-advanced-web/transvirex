import { Injectable, LoggerService } from '@nestjs/common';
import { MongoDBService } from '@app/mongodb';
import { Collection } from 'mongodb';

const COLLECTION_NAME = 'banckend_logs';

export interface LogEntry {
    level: 'log' | 'warn' | 'error' | 'debug' | 'verbose';
    message: string;
    context?: string;
    service: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

@Injectable()
export class LoggingService implements LoggerService {
    private collection: Collection | null = null;
    private serviceName: string = 'unknown';

    constructor(private readonly mongodbService: MongoDBService) {
        this.serviceName = process.env.APP_NAME || 'transvirex';
    }

    setServiceName(name: string) {
        this.serviceName = name;
    }

    private async getCollection(): Promise<Collection> {
        if (!this.collection) {
            const db = await this.mongodbService.getDb();
            this.collection = db.collection(COLLECTION_NAME);
        }
        return this.collection;
    }

    private async write(entry: LogEntry) {
        try {
            const col = await this.getCollection();
            await col.insertOne(entry);
        } catch {
            // Fail silently — logging should never crash the app
        }
    }

    log(message: any, context?: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level: 'log',
            message: typeof message === 'string' ? message : JSON.stringify(message),
            context,
            service: this.serviceName,
            timestamp: new Date(),
            metadata,
        };
        this.write(entry);
    }

    warn(message: any, context?: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level: 'warn',
            message: typeof message === 'string' ? message : JSON.stringify(message),
            context,
            service: this.serviceName,
            timestamp: new Date(),
            metadata,
        };
        this.write(entry);
    }

    error(message: any, trace?: string, context?: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level: 'error',
            message: typeof message === 'string' ? message : JSON.stringify(message),
            context,
            service: this.serviceName,
            timestamp: new Date(),
            metadata: { ...metadata, trace },
        };
        this.write(entry);
    }

    debug(message: any, context?: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level: 'debug',
            message: typeof message === 'string' ? message : JSON.stringify(message),
            context,
            service: this.serviceName,
            timestamp: new Date(),
            metadata,
        };
        this.write(entry);
    }

    verbose(message: any, context?: string, metadata?: Record<string, unknown>) {
        const entry: LogEntry = {
            level: 'verbose',
            message: typeof message === 'string' ? message : JSON.stringify(message),
            context,
            service: this.serviceName,
            timestamp: new Date(),
            metadata,
        };
        this.write(entry);
    }
}
