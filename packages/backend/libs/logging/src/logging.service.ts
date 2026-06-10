import { Injectable, LoggerService } from '@nestjs/common';
import { MongoDBService } from '@app/mongodb';
import { Collection } from 'mongodb';

/** Name of the MongoDB collection used for backend logs. */
const COLLECTION_NAME = 'banckend_logs';

/** Shape of a log entry persisted to MongoDB. */
export interface LogEntry {
    level: 'log' | 'warn' | 'error' | 'debug' | 'verbose';
    message: string;
    context?: string;
    service: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

/** Service implementing NestJS LoggerService to write logs to MongoDB. */
@Injectable()
export class LoggingService implements LoggerService {
    private collection: Collection | null = null;
    private serviceName: string = 'unknown';

    constructor(private readonly mongodbService: MongoDBService) {
        this.serviceName = process.env.APP_NAME || 'transvirex';
    }

    /** Override the service name used in log entries. */
    setServiceName(name: string) {
        this.serviceName = name;
    }

    /** Lazily resolve the MongoDB collection handle. */
    private async getCollection(): Promise<Collection> {
        if (!this.collection) {
            const db = await this.mongodbService.getDb();
            this.collection = db.collection(COLLECTION_NAME);
        }
        return this.collection;
    }

    /** Persist a log entry to MongoDB. Failures are silently ignored. */
    private async write(entry: LogEntry) {
        try {
            const col = await this.getCollection();
            await col.insertOne(entry);
        } catch {
            // Fail silently — logging should never crash the app
        }
    }

    /** Write a standard log entry. */
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

    /** Write a warning log entry. */
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

    /** Write an error log entry. */
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

    /** Write a debug log entry. */
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

    /** Write a verbose log entry. */
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
