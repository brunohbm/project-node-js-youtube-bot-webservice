const express = require('express');
const cors = require('cors');

const optionsRouter = require('./routes/options.router');
const generatorRouter = require('./routes/generator.router');
const youtubeRouter = require('./routes/youtube.router');
const creatorRouter = require('./routes/creator.router');
const imageRouter = require('./routes/image.router');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/options', optionsRouter);
app.use('/generator', generatorRouter);
app.use('/youtube', youtubeRouter);
app.use('/create', creatorRouter);
app.use('/image', imageRouter);

app.listen(process.env.PORT, () => {
    console.warn('I\'m really tired, I hope it works :(');
});
