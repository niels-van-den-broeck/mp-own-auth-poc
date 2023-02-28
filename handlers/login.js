const shortid = require('shortid');

module.exports.get = server => {
  return (request, reply) => {
    return reply.status(200).sendFile('login.html');
  };
};

module.exports.post = server => {
  return async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) return reply.status(401).send('not ok');

    const user = await server.db.collection('user').findOne({
      email: email.trim(),
      password: password.trim(),
    });

    if (!user) reply.status(401).send('unauthorized');

    let code;
    const { state, client_id } = request.session;

    if (request.session.response_type === 'code') {
      const client = await server.db.collection('client').findOne({
        _id: client_id,
      });

      if (!client) return reply.status(401).send('Unauthorized');

      code = shortid.generate();
      await server.db.collection('code').insertOne({
        code,
        client: client_id,
        user: user._id,
      });
    }

    const { redirect_uri } = request.session || {};
    if (redirect_uri) {
      const queryParams = new URLSearchParams();

      if (code) queryParams.append('code', code);
      if (state) queryParams.append('state', state);

      delete request.session.response_type;
      delete request.session.state;
      delete request.session.redirect_uri;
      delete request.session.client_id;

      return reply.redirect(`${redirect_uri}?${queryParams.toString()}`);
    }

    return reply.status(200).send('OK');
  };
};
