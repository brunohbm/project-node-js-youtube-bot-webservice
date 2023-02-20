require('./config');

// content: {
//     videoTheme: "",
//     list: [
//         {
//             nome: "",
//             descricao: "",
//             avaliacao: "",
//             ano_lancamento: "",
//         }
//     ]
// }

const robots = {
    input: require('./robots/input'),
    text: require('./robots/text'),
}

async function start() {
    const content = {};
    content.videoTheme = robots.input.askVideoTheme();
    content.list = await robots.text.createListFromText(content.videoTheme);

    console.log(content);
}

start();