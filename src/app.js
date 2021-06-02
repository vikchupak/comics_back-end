const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// set process.env variables available anywhere
dotenv.config({ path: './config/.env' });
//
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc'); // npm i swagger-jsdoc@6.1.0 for common js imports to work
//
const cookieSession = require('cookie-session');
require('../config/passport');
const passport = require('passport');
const Message = require('./models/Message');
const { localAuthenticationMiddleware } = require('./middleware/authentication');
const { isAuthenticatedMiddleware } = require('./middleware/authentication');
//
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/chatUsers'); // for chat
const serializeMessage = require('./utils/serializeMessage'); // for chat
//
const authRoutes = require('./routes/authRoutes');
const comicsRoutes = require('./routes/comicsRouts');
const characterRoutes = require('./routes/characterRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const publisherRoutes = require('./routes/publisherRoutes');

const app = express();

// important! to set origin with credentials
app.use(cors({ origin: process.env.FRONT_END_DOMAIN, credentials: true }));
app.use(express.json({ extended: true }));
app.use(cookieParser());
// to allow brosers to request data from this folder
app.use('/public', express.static(path.join(__dirname, '../public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const cookieSessionMiddleware = cookieSession({
  maxAge: 60 * 60 * 1000, // 1h in miliseconds
  keys: [process.env.COOKIE_KEY],
  sameSite: 'strict',
  // domain: process.env.BACK_END_DOMAIN,
  secure: true,
  httpOnly: true,
});

// authentification
app.use(cookieSessionMiddleware);
// google authentification
app.use(passport.initialize());
app.use(passport.session());
// local authentification
app.use(localAuthenticationMiddleware);

// swagger configuration // start
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Comics API',
      version: '1.0.0',
      description: 'A simple Express Comics API',
    },
    servers: [
      {
        url: process.env.BACK_END_DOMAIN,
      },
    ],
  },
  // path must be from the root of an application
  apis: ['src/routes/*.js'],
};

const specs = swaggerJsDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// swagger configuration // end

app.use('/auth', authRoutes);
app.use('/comics', isAuthenticatedMiddleware, comicsRoutes);
app.use('/character', isAuthenticatedMiddleware, characterRoutes);
app.use('/publisher', isAuthenticatedMiddleware, publisherRoutes);

app.use('/chathistory', isAuthenticatedMiddleware, async (req, res, next) => {
  const { room } = req.query;
  if (req.user) {
    const chathistory = await Message.find({
      chatRoom: room,
    }).sort({ time: 1 });
    res.json(chathistory);
  }
  if (req.appContext) {
    const chathistory = await Message.find({
      chatRoom: room,
    }).sort({
      time: 1,
    });
    res.json(chathistory);
  }
});
// app.use('/review', reviewRoutes);
// app.use('/user', userRoutes);

const PORT = process.env.PORT || 5000;

// set socket.io
const server = http.createServer(app); // server.listen instead of app.listen
const io = socketio(server, {
  cors: {
    origin: process.env.FRONT_END_DOMAIN,
    credentials: true,
  },
});

// to integrete express middlewares in socket connection
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(cookieParser())); // const token = req.cookies.jwt;
io.use(wrap(cookieSessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));
io.use(wrap(localAuthenticationMiddleware));

io.use((socket, next) => {
  if (socket.request.user || socket.request.appContext) {
    next();
  } else {
    next(new Error('Socket.io: 401 (Unauthorized)'));
  }
});

const botName = 'Deadpool';

// set socket.io connection
io.on('connection', (socket) => {
  console.log('connect done');

  socket.on('joinRoom', ({ author, type, data, chatRoom }) => {
    const user = userJoin(author.email, author.displayName, chatRoom);

    socket.join(user.room);

    const broadcastOthers = () => {
      const serializedMessage = serializeMessage(
        { email: 'admin@gmail.com', displayName: botName },
        'text',
        { text: `${user.username} has joined the chat.` },
        user.room
      );

      return serializedMessage;
    };

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', broadcastOthers());

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', ({ author, type, data, chatRoom }) => {
    const user = getCurrentUser(author.email);

    const sendChatMessage = () => {
      const serializedMessage = serializeMessage(
        { email: author.email, displayName: author.displayName },
        type,
        data,
        user.room
      );
      // save to db
      new Message(serializedMessage).save();
      return serializedMessage;
    };

    io.to(user.room).emit('message', sendChatMessage());
  });

  socket.on('leaveRoom', ({ author }) => {
    const user = userLeave(author.email);

    const broadcastOthers = () => {
      const serializedMessage = serializeMessage(
        { email: 'admin@gmail.com', displayName: botName },
        'text',
        { text: `${user.username} has left the chat.` },
        user.room
      );

      return serializedMessage;
    };

    if (user) {
      socket.leave(user.room);

      io.to(user.room).emit('message', broadcastOthers());

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });

  // disconnect logic on logout!!!
  socket.on('disconnect', () => {
    console.log('disconnect done');
  });
});

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// blobal error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ message: error.message });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    server.listen(PORT);
    console.log('PORT: ', PORT);
  } catch (e) {
    console.log('Server Error: ', e.message);
    process.exit(1);
  }
}

start();
