const express = require('express');
const optionsRouter = require('./routes/options.router');
const generatorRouter = require('./routes/generator.router');

const app = express();

app.use(express.json());

app.use('/options', optionsRouter);
app.use('/generator', generatorRouter);

app.listen(process.env.PORT, () => {
    console.warn('I\'m really tired, I hope it works :(');
});
