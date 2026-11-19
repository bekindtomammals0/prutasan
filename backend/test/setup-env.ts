process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
const mongoReplicaSetHost = process.env.MONGODB_REPLICA_SET_HOST ?? 'localhost';
process.env.MONGODB_REPLICA_SET_HOST ??= mongoReplicaSetHost;
process.env.MONGODB_URI ??= `mongodb://${mongoReplicaSetHost}:27017/fruit_storage?replicaSet=rs0`;
process.env.OUTBOX_POLL_INTERVAL_MS ??= '1000';
process.env.OUTBOX_BATCH_SIZE ??= '50';
