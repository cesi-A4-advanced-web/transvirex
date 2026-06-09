import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MongoDBService } from '@app/mongodb';
import { Collection } from 'mongodb';

const COLLECTION_NAME = 'banckend_logs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private collection: Collection | null = null;

    constructor(private readonly mongodbService: MongoDBService) {}

    private async getCollection(): Promise<Collection> {
        if (!this.collection) {
            const db = await this.mongodbService.getDb();
            this.collection = db.collection(COLLECTION_NAME);
        }
        return this.collection;
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const startTime = Date.now();

        return next.handle().pipe(
            tap({
                next: async () => {
                    const duration = Date.now() - startTime;
                    try {
                        const col = await this.getCollection();
                        await col.insertOne({
                            level: 'log',
                            message: `${method} ${url} ${duration}ms`,
                            context: context.getClass()?.name || 'HTTP',
                            service: process.env.APP_NAME || 'transvirex',
                            timestamp: new Date(),
                            metadata: {
                                method,
                                url,
                                duration,
                                statusCode: 200,
                            },
                        });
                    } catch {
                        // Fail silently
                    }
                },
                error: async (err: any) => {
                    const duration = Date.now() - startTime;
                    try {
                        const col = await this.getCollection();
                        await col.insertOne({
                            level: 'error',
                            message: `${method} ${url} - ${err?.message || 'Unknown error'}`,
                            context: context.getClass()?.name || 'HTTP',
                            service: process.env.APP_NAME || 'transvirex',
                            timestamp: new Date(),
                            metadata: {
                                method,
                                url,
                                duration,
                                statusCode: err?.status || 500,
                                trace: err?.stack,
                            },
                        });
                    } catch {
                        // Fail silently
                    }
                },
            }),
        );
    }
}
