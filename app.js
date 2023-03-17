const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./models/User');
const userRoutes = require('./routes/UserRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
