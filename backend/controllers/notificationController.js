
let clients = [];

export const streamNotifications = (req, res) => {
 
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  const userId = req.user._id.toString();

  const newClient = {
    id: userId,
    res
  };
  clients.push(newClient);

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  console.log("SSE CONECTED")

  req.on('close', () => {
    clients = clients.filter(c => c.res !== res);
  });
};

export const sendNotificationToUser = (userId, messageData) => {
  const targetClients = clients.filter(c => c.id === userId);

  targetClients.forEach(client => {
    console.log("sented to frontent")
    client.res.write(`data: ${JSON.stringify(messageData)}\n\n`);
  });
};