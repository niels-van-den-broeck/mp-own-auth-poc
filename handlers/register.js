module.exports.get = server => {
  return (request, reply) => {
    return reply.status(200).sendFile('register.html');
  };
};

module.exports.post = server => {
  return async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) return reply.status(400).send('not ok');

    const user = await server.db.collection('user').findOne({
      email: email.trim(),
    });

    if (user) return reply.status(409).send('not ok');

    await server.db.collection('user').insertOne({
      email: email.trim(),
      password: password.trim(),
    });

    return reply.redirect('/login');
  };
};
