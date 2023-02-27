module.exports = server => {
  return (request, reply) => {
    const { response_type, client_id, redirect_uri, state, scope } = request.query;

    if (response_type === 'code') {
      const search = new URLSearchParams(request.query);
      return reply.redirect(`/login?${search.toString()}`);
    }

    return reply.status(200).send('VERY NICE');
  };
};
