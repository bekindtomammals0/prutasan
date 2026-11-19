import mongoose, { type Connection } from 'mongoose';

const fruitCollectionName = 'phase0_fruits';
const outboxCollectionName = 'phase0_outbox';

function requiredMongoUri() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured');
  }
  return mongoUri;
}

describe('MongoDB transaction infrastructure', () => {
  let connection: Connection | undefined;

  function mongoConnection() {
    if (!connection) {
      throw new Error('MongoDB connection is not initialized');
    }
    return connection;
  }

  function database() {
    const db = mongoConnection().db;
    if (!db) {
      throw new Error('MongoDB connection is not initialized');
    }
    return db;
  }

  function fruits() {
    return database().collection<{
      testId: string;
      normalizedName: string;
    }>(fruitCollectionName);
  }

  function outboxRecords() {
    return database().collection<{
      testId: string;
      aggregateId: string;
      eventType: string;
    }>(outboxCollectionName);
  }

  async function dropCollectionIfExists(collectionName: string) {
    const db = database();
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await db.dropCollection(collectionName);
    }
  }

  beforeAll(async () => {
    connection = await mongoose.createConnection(requiredMongoUri()).asPromise();
    await dropCollectionIfExists(fruitCollectionName);
    await dropCollectionIfExists(outboxCollectionName);
  });

  afterAll(async () => {
    if (!connection) {
      return;
    }
    try {
      await dropCollectionIfExists(fruitCollectionName);
      await dropCollectionIfExists(outboxCollectionName);
    } finally {
      await connection.close();
    }
  });

  it('commits fruit and outbox records together', async () => {
    const session = await mongoConnection().startSession();
    const fruit = {
      testId: 'phase0-success-fruit',
      normalizedName: 'apple',
    };
    const outboxRecord = {
      testId: 'phase0-success-outbox',
      aggregateId: fruit.testId,
      eventType: 'FruitCreated',
    };
    try {
      await session.withTransaction(async () => {
        await fruits().insertOne(fruit, { session });
        await outboxRecords().insertOne(outboxRecord, { session });
      });
    } finally {
      await session.endSession();
    }
    await expect(fruits().findOne({ testId: fruit.testId })).resolves.toMatchObject(fruit);
    await expect(outboxRecords().findOne({ testId: outboxRecord.testId })).resolves.toMatchObject(
      outboxRecord,
    );
  });

  it('rolls back both fruit and outbox records when the transaction fails', async () => {
    const session = await mongoConnection().startSession();
    const fruit = {
      testId: 'phase0-failure-fruit',
      normalizedName: 'pear',
    };
    const outboxRecord = {
      testId: 'phase0-failure-outbox',
      aggregateId: fruit.testId,
      eventType: 'FruitCreated',
    };
    try {
      await expect(
        session.withTransaction(async () => {
          await fruits().insertOne(fruit, { session });
          await outboxRecords().insertOne(outboxRecord, { session });
          throw new Error('Force transaction rollback');
        }),
      ).rejects.toThrow('Force transaction rollback');
    } finally {
      await session.endSession();
    }
    await expect(fruits().findOne({ testId: fruit.testId })).resolves.toBeNull();
    await expect(outboxRecords().findOne({ testId: outboxRecord.testId })).resolves.toBeNull();
  });
});
