const { ObjectId } = require('mongodb');

module.exports = server => {
  return async (request, reply) => {
    /**
     * Does application have rights to request a token for given user?
     * If so, send the token.
     */
    const { grant_type, client_id, client_secret, redirect_uri, code } = request.body;

    if (grant_type === 'authorization_code') {
      const accessCode = await server.db.collection('code').findOne({ code, client: client_id });
      // burn on use.
      await server.db.collection('code').deleteOne({ code, client: client_id });
      if (!accessCode) return reply.status(401).send('Unauthorized');

      const client = await server.db.collection('client').findOne({
        _id: client_id,
        secret: client_secret,
      });

      if (!client) return reply.status(401).send('Unauthorized');

      const token = await server.db.collection('token').insertOne({
        _id: new ObjectId(),
        expires: Date.now() + 3600000,
        user: accessCode.user,
      });

      request.session.token = token.insertedId;

      return reply.status(200).send({
        access_token: token.insertedId,
        token_type: 'Bearer',
        expires_in: 3600,
      });
    }

    return reply.status(200).send('VERY NICE');
  };
};
