const path = require('path');
const fastify = require('fastify');
const { MongoClient } = require('mongodb');

const createAuthorizeHandler = require('./handlers/authorize');
const createTokenHandler = require('./handlers/token');
const createLoginHandler = require('./handlers/login');

const server = fastify();

server.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
});

async function setupDB() {
  const client = new MongoClient('mongodb://localhost/mijn-pelckmans-auth');
  await client.connect();

  server.decorate('db', client.db());
}

async function start() {
  await setupDB();

  server.get('/authorize', {
    handler: createAuthorizeHandler(server),
    // schema: {
    //   querystring: {
    //     response_type: {
    //       type: 'string',
    //       nullable: true,
    //     },
    //     client_id: {
    //       type: 'string',
    //       nullable: true,
    //     },
    //     redirect_uri: {
    //       type: 'string',
    //       nullable: true,
    //     },
    //     state: {
    //       type: 'string',
    //       nullable: true,
    //     },
    //     scope: {
    //       type: 'string',
    //       nullable: true,
    //     },
    //   },
    // },
  });

  server.post('/token', {
    handler: createTokenHandler(server),
  });

  server.get('/login', {
    handler: createLoginHandler(server),
  });

  await server.listen({
    logger: {
      level: 'INFO',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'dd-mm-yyyy HH:MM:ss Z',
          ignore: 'pid, hostname',
        },
      },
    },
    port: 8090,
  });

  server.log.warn('Listening');
}

start();
