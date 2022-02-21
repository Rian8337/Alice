import { BaseDocument } from "@alice-interfaces/database/BaseDocument";
import { OperationResult } from "@alice-interfaces/core/OperationResult";
import { DatabaseUtilityConstructor } from "@alice-types/database/DatabaseUtilityConstructor";
import { Manager } from "@alice-utils/base/Manager";
import { Collection as DiscordCollection } from "discord.js";
import {
    Collection as MongoDBCollection,
    Filter,
    FindOptions,
    OptionalUnlessRequiredId,
    UpdateFilter,
    UpdateOptions,
} from "mongodb";

/**
 * A MongoDB collection manager.
 */
export abstract class DatabaseCollectionManager<
    T extends BaseDocument,
    C extends Manager
    > extends Manager {
    /**
     * The collection that this manager is responsible for.
     */
    protected readonly collection: MongoDBCollection<T>;

    /**
     * The constructor function of the utility of this collection.
     */
    protected abstract readonly utilityInstance: DatabaseUtilityConstructor<
        T,
        C
    >;

    /**
     * The default document of this collection.
     */
    abstract get defaultDocument(): T;

    /**
     * The default instance of this collection utility.
     */
    get defaultInstance(): C {
        return new this.utilityInstance(this.defaultDocument);
    }

    /**
     * @param collection The MongoDB collection.
     */
    constructor(collection: MongoDBCollection<T>) {
        super();

        this.collection = collection;
    }

    /**
     * Updates multiple documents in the collection.
     *
     * @param filter The filter used to select the documents to update.
     * @param query The update operations to be applied to the documents.
     * @param options Options for the update operation.
     * @returns An object containing information about the operation.
     */
    update(
        filter: Filter<T>,
        query: UpdateFilter<T> | Partial<T>,
        options: UpdateOptions = {}
    ): Promise<OperationResult> {
        return new Promise((resolve, reject) => {
            this.collection.updateMany(filter, query, options, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve(this.createOperationResult(true));
            });
        });
    }

    /**
     * Gets multiple documents from the collection and then
     * index them based on the given key.
     *
     * @param key The key to index.
     * @param filter The document filter.
     * @returns The indexed documents in a discord.js collection.
     */
    async get<K extends keyof T>(
        key: K,
        filter?: Filter<T>
    ): Promise<DiscordCollection<NonNullable<T[K]>, C>>;

    /**
     * Gets multiple documents from the collection and then
     * index them based on the given key.
     *
     * @param key The key to index.
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The indexed documents in a discord.js collection.
     */
    async get<K extends keyof T>(
        key: K,
        filter: Filter<T>,
        options?: FindOptions<T>
    ): Promise<DiscordCollection<NonNullable<T[K]>, C>>;

    /**
     * Gets multiple documents from the collection and then
     * index them based on the given key.
     *
     * @param key The key to index.
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The indexed documents in a discord.js collection.
     */
    async get<K extends keyof T>(
        key: K,
        filter: Filter<T>,
        options: FindOptions<T>
    ): Promise<DiscordCollection<NonNullable<T[K]>, C>>;

    /**
     * Gets multiple documents from the collection and then
     * index them based on the given key.
     *
     * @param key The key to index.
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The indexed documents in a discord.js collection.
     */
    async get<K extends keyof T>(
        key: K,
        filter: Filter<T> = {},
        options?: FindOptions<T>
    ): Promise<DiscordCollection<NonNullable<T[K]>, C>> {
        const res: T[] = <T[]>(
            await this.collection.find(filter, options).toArray()
        );

        const collection: DiscordCollection<
            NonNullable<T[K]>,
            C
        > = new DiscordCollection();

        for (const data of res) {
            collection.set(
                <NonNullable<T[K]>>data[key],
                new this.utilityInstance(data)
            );
        }

        return collection;
    }

    /**
     * Gets a document from the collection and convert it
     * to its utility.
     *
     * @param filter The document filter.
     * @returns The converted document.
     */
    async getOne(filter?: Filter<T>): Promise<C | null>;

    /**
     * Gets a document from the collection and convert it
     * to its utility.
     *
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The converted document.
     */
    async getOne(filter: Filter<T>, options: FindOptions<T>): Promise<C | null>;

    /**
     * Gets a document from the collection and convert it
     * to its utility.
     *
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The converted document.
     */
    async getOne(
        filter: Filter<T>,
        options?: FindOptions<T>
    ): Promise<C | null>;

    /**
     * Gets a document from the collection and convert it
     * to its utility.
     *
     * @param filter The document filter.
     * @param options The options for retrieving the documents.
     * @returns The converted document.
     */
    async getOne(
        filter: Filter<T> = {},
        options?: FindOptions<T>
    ): Promise<C | null> {
        const res: T | null = await this.collection.findOne(filter, options);

        return res ? new this.utilityInstance(res) : null;
    }

    /**
     * Delete multiple documents from the collection.
     *
     * @param filter The filter used to select the documents to remove.
     * @returns An object containing information about the operation.
     */
    delete(filter: Filter<T>): Promise<OperationResult> {
        return new Promise((resolve, reject) => {
            this.collection.deleteMany(filter, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve(this.createOperationResult(true));
            });
        });
    }

    /**
     * Inserts multiple documents into the collection.
     *
     * @param docs The part of documents to insert. Each document will be assigned to the default document with `Object.assign()`.
     */
    insert(...docs: Partial<T>[]): Promise<OperationResult> {
        return new Promise((resolve, reject) => {
            this.collection.insertMany(
                docs.map(
                    (v) =>
                        <OptionalUnlessRequiredId<T>>(
                            Object.assign(this.defaultDocument, v)
                        )
                ),
                (err) => {
                    if (err) {
                        return reject(err.message);
                    }

                    resolve(this.createOperationResult(true));
                }
            );
        });
    }
}
