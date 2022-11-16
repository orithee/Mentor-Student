import express, { json, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import {
  checkMentorCookie,
  checkSignIn,
  checkUuid,
  deleteSession,
  getAllCodeBlocks,
  getCurrentCodeBlock,
  getAllStudents,
  newSession,
} from '../db/mongoose';
import { ClientToServerEvents, ServerToClientEvents } from './types';
const PORT = process.env.PORT;

// Initialize the express server with all requests:
function expressServer() {
  const app = express();
  app.use(json());
  // Post requests:
  app.post('/signIn', async (req: Request, res: Response) => {
    const data = await checkSignIn(req.body.name, req.body.password);
    if (data.success) {
      if (data.student && (await checkUuid(req.body.uuid, req.body.name))) {
        res.send({ success: data.success, student: data.student });
      } else if (!data.student) res.send({ success: true, student: false });
      else res.send({ success: false, student: true });
    } else res.send({ success: false, student: false });
  });
  app.post('/new-session', async (req: Request, res: Response) => {
    const uuid = await newSession(req.body.name, req.body.sessionId);
    res.cookie('session', uuid, { maxAge: 900000, httpOnly: true });
    let nodeEnv = 'https://';
    if (process.env.NODE_ENV !== 'production') nodeEnv = 'http://';
    res.send({ uuid: uuid, nodeEnv: nodeEnv });
  });
  // Put request:
  app.put('/delete-session', async (req: Request, res: Response) => {
    const success = await deleteSession();
    res.send({ success: success });
  });
  // Get requests:
  app.get('/student_login/:uuid', (req: Request, res: Response) => {
    res.sendFile('/index.html', { root: './dist' });
  });
  app.get('/code-block/:uuid', async (req: Request, res: Response) => {
    try {
      const obj = await getCurrentCodeBlock(req.params.uuid);
      res.send(obj);
    } catch (error) {
      console.log('/code-block/:uuid', error);
      res.send({});
    }
  });
  app.get('/access/mentor', cookieParser(), async (req, res) => {
    res.sendFile('/index.html', { root: './dist' });
  });
  app.get('/mentor-access', cookieParser(), async (req, res) => {
    try {
      const access = await checkMentorCookie(req.cookies['session']);
      res.send({ access: access, uuid: req.cookies['session'] });
    } catch (error) {
      console.log('/mentor-access', error);
      res.send({ access: false, uuid: '' });
    }
  });
  app;
  app.get('/code-cards', async (req: Request, res: Response) => {
    const data = await getAllCodeBlocks();
    res.send({ cards: data });
  });
  app.get('/students', async (req: Request, res: Response) => {
    const data = await getAllStudents();
    res.send({ students: data });
  });
  // Default:
  app.use((req: Request, res: Response) => {
    try {
      res.sendFile(req.path || '/index.html', { root: './dist' });
    } catch (error) {
      console.log('no such file');
      console.log(req.path);
    }
  });
  const server = app.listen(PORT, () => console.log(`http://localhost:4000`));
  return server;
}

export default function socketServer() {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(
    expressServer()
  );
  io.on('connection', (socket) => {
    socket.on('code_change_from_client', (msg) => {
      io.emit('code_change_to_client', msg);
    });
    socket.on('disconnect', () => console.log('Client disconnected'));
  });
  return io;
}
