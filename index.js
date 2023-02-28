const path = require('path');
const fastify = require('fastify');
const { MongoClient } = require('mongodb');
const fastifySession = require('@fastify/session');
const fastifyCookie = require('@fastify/cookie');

const createAuthorizeHandler = require('./handlers/authorize');
const createTokenHandler = require('./handlers/token');
const createLoginHandler = require('./handlers/login');
const createRegisterHandler = require('./handlers/register');
const createGreatSuccessHandler = require('./handlers/great-success');

const server = fastify();

server.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
});

async function setupDB() {
  console.log('Connecting to mongodb');
  const client = new MongoClient(
    'mongodb://127.0.0.1:27017/mp-db-poc?readPreference=primary&directConnection=true&ssl=false',
  );
  await client.connect();
  console.log('Connected to mongodb');

  server.decorate('db', client.db());
}

async function start() {
  await setupDB();
  server.register(fastifyCookie);
  server.register(require('@fastify/formbody'));
  server.register(fastifySession, {
    cookieName: 'sessionId',
    secret: 'a secret with minimum length of 32 characters',
    cookie: { secure: false },
    expires: 1800000,
    store: {
      get: (sessionId, callback) => {
        server.db
          .collection('session')
          .findOne({
            _id: sessionId,
          })
          .then(session => callback(undefined, session?.session))
          .catch(callback);
      },
      set: (sessionId, session, callback) => {
        server.db
          .collection('session')
          .findOneAndUpdate({ _id: sessionId }, { $set: { session } }, { upsert: true })
          .then(() => {
            callback();
          })
          .catch(callback);
      },
      delete: (sessionId, callback) => {
        server.db
          .collection('session')
          .deleteOne({ _id: sessionId })
          .then(() => {
            callback();
          })
          .catch(callback);
      },
    },
  });

  server.setErrorHandler(function (error, request, reply) {
    // Log error
    console.error(error);
    // Send error response
    reply.status(500).send({ ok: false });
  });

  server.get('/authorize', {
    handler: createAuthorizeHandler(server),
  });

  server.post('/token', {
    handler: createTokenHandler(server),
  });

  server.get('/login', {
    handler: createLoginHandler.get(server),
  });
  server.post('/login', {
    handler: createLoginHandler.post(server),
  });

  server.get('/register', {
    handler: createRegisterHandler.get(server),
  });
  server.post('/register', {
    handler: createRegisterHandler.post(server),
  });

  server.get('/great-success', {
    handler: createGreatSuccessHandler(server),
  });

  await server.listen({
    logger: true,
    port: 8090,
  });

  server.log.info('Listening');
}

start();
