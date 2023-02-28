module.exports = server => {
  return async (request, reply) => {
    const { response_type, client_id, redirect_uri, state, scope } = request.query;

    request.session.response_type = response_type;
    request.session.state = state;
    request.session.redirect_uri = redirect_uri;
    request.session.client_id = client_id;

    if (response_type === 'code') {
      return reply.redirect(`/login`);
    }

    return reply.status(200).send('VERY NICE');
  };
};
