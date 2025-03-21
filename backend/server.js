const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/positions', async (req, res) => {
  const { date } = req.query;
  try {
    // Sample call to Horizons batch interface
    const horizonsURL = 'https://ssd.jpl.nasa.gov/api/horizons.api';
    const response = await axios.get(horizonsURL, {
      params: {
        format: 'json',
        COMMAND: "'399,499'",  // 399=Earth, 499=Mars
        EPHEM_TYPE: 'VECTORS',
        CENTER: "'500@0'",
        START_TIME: date,
        STOP_TIME: date,
        STEP_SIZE: '1 d'
      }
    });

    const data = response.data;
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js Horizons API Server running on http://localhost:${PORT}`);
});
