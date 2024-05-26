const express = require('express');
const app = express();

const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');

// Import controllers
const requestsRouter = require('./controllers/requests');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const bookingsRouter = require('./controllers/bookings');
const equipmentsRouter = require('./controllers/equipments');
const equipmentTypesRouter = require('./controllers/equipment_types');
const requestTypesRouter = require('./controllers/request_types');
const eventsRouter = require('./controllers/events');

app.use(express.json());

// Define routes
app.use('/api/requests', requestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/equipments', equipmentsRouter);
app.use('/api/equipmentTypes', equipmentTypesRouter);
app.use('/api/requestTypes', requestTypesRouter);
app.use('/api/events', eventsRouter);

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
