import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

/** MongoDB connection credentials (from environment or defaults). */
const MONGODB_DB = process.env.MONGODB_DB || 'transvirex';
const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_USER = process.env.MONGODB_USER || 'mongo_user';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'mongo_password';
const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=admin`;

/** Service providing a MongoDB connection and a helper to execute shell-like commands. */
@Injectable()
export class MongoDBService implements OnModuleDestroy {
    private client: MongoClient | null = null;
    private db: Db | null = null;

    /** Close the MongoDB connection on module destroy. */
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
        }
    }

    /** Get (or create) the MongoDB database handle. */
    async getDb(): Promise<Db> {
        if (!this.client) {
            this.client = new MongoClient(MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db(MONGODB_DB);
        }
        return this.db!;
    }

    /** Parse and execute a MongoDB shell-like command string, returning tabular results. */
    async executeCommand(
        command: string,
    ): Promise<{ columns: string[]; rows: any[]; rowCount: number }> {
        const db = await this.getDb();
        const trimmed = command.trim();

        let results: any[];

        const collectionMatch = trimmed.match(/^db\.(\w+)\./);
        if (!collectionMatch) {
            const evalResult = await db.admin().command({ listCollections: 1 });
            results = evalResult.cursor?.firstBatch ?? [];
            const columns = results.length > 0 ? Object.keys(results[0]) : [];
            return { columns, rows: results, rowCount: results.length };
        }

        const collectionName = collectionMatch[1];
        const collection = db.collection(collectionName);

        if (trimmed.includes('.find(') || trimmed.includes('.findOne(')) {
            const isOne = trimmed.includes('.findOne(');
            const pipelineMatch = trimmed.match(
                /\.(find|findOne)\(([\s\S]*)\)/,
            );
            let filter = {};
            const options: any = {};

            if (pipelineMatch && pipelineMatch[2]?.trim()) {
                try {
                    const parsed = Function(
                        `"use strict"; return (${pipelineMatch[2].trim()})`,
                    )();
                    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                        filter = parsed;
                    }
                } catch {
                    // ignore parse errors
                }
            }

            const limitMatch = trimmed.match(/\.limit\(\s*(\d+)\s*\)/);
            const limit = limitMatch ? parseInt(limitMatch[1]) : 10;

            const sortMatch = trimmed.match(/\.sort\(\s*(\{[\s\S]*?\})\s*\)/);
            if (sortMatch) {
                try {
                    options.sort = Function(
                        `"use strict"; return (${sortMatch[1]})`,
                    )();
                } catch {}
            }

            const cursor = collection.find(filter, options).limit(limit);
            results = isOne
                ? (await cursor.toArray()).slice(0, 1)
                : await cursor.toArray();
        } else if (trimmed.includes('.aggregate(')) {
            const pipelineMatch = trimmed.match(
                /\.aggregate\(\s*(\[[\s\S]*?\])\s*\)/,
            );
            const pipeline = pipelineMatch
                ? Function(`"use strict"; return (${pipelineMatch[1]})`)()
                : [];
            results = await collection.aggregate(pipeline).toArray();
        } else if (trimmed.includes('.countDocuments(')) {
            const filterMatch = trimmed.match(
                /\.countDocuments\(\s*(\{[\s\S]*?\})\s*\)/,
            );
            const filterObj = filterMatch
                ? Function(`"use strict"; return (${filterMatch[1]})`)()
                : {};
            const count = await collection.countDocuments(filterObj);
            results = [{ count }];
        } else if (trimmed.includes('.distinct(')) {
            const match = trimmed.match(
                /\.distinct\(\s*['"](.+?)['"]\s*(?:,\s*(\{[\s\S]*?\})\s*)?\)/,
            );
            const field = match ? match[1] : '_id';
            const query =
                match && match[2]
                    ? Function(`"use strict"; return (${match[2]})`)()
                    : {};
            const distinct = await collection.distinct(field, query);
            results = distinct.map((v: any) => ({ [field]: v }));
        } else if (
            trimmed.includes('.insertOne(') ||
            trimmed.includes('.insertMany(')
        ) {
            const isMany = trimmed.includes('.insertMany(');
            const docMatch = trimmed.match(
                /\.insert(?:One|Many)\(\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*\)/,
            );
            const doc = docMatch
                ? Function(`"use strict"; return (${docMatch[1]})`)()
                : {};
            if (isMany) {
                const insertResult = await collection.insertMany(doc);
                results = [
                    {
                        acknowledged: insertResult.acknowledged,
                        insertedCount: insertResult.insertedCount,
                    },
                ];
            } else {
                const insertResult = await collection.insertOne(doc);
                results = [
                    {
                        acknowledged: insertResult.acknowledged,
                        insertedId: String(insertResult.insertedId),
                    },
                ];
            }
        } else {
            results = await collection.find({}).limit(10).toArray();
        }

        results = results.map((r: any) => {
            const { _id, ...rest } = r;
            return { _id: String(_id ?? ''), ...rest };
        });

        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        return { columns, rows: results, rowCount: results.length };
    }
}
