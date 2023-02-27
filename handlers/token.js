module.exports = server => {
  return (request, reply) => {
    return reply.status(200).send('VERY NICE');
  };
};
