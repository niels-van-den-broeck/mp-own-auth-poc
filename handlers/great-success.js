module.exports = server => {
  return (request, reply) => {
    return reply.status(200).sendFile('great-success.html');
  };
};
