const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAiApi = new OpenAIApi(configuration);  
const PROMPT_COMPLEMENT = "Me de uma lista em JSON, dos 5 PROMPT_TEXT com nome, descrição, ano de lançamento e avaliação. As chaves do JSON devem ser nome, descricao, ano_lancamento e avaliacao"

async function fetchContentFromChatGPT(promptText) {
    const finalPrompt =  PROMPT_COMPLEMENT.replace('PROMPT_TEXT', promptText);
    console.warn(`GERANDO: ${finalPrompt}`);

    const { data } = await openAiApi.createCompletion({
        model: 'text-davinci-003',
        prompt: finalPrompt,
        temperature: 0,
        max_tokens: 4000,
    })

    return data.choices[0].text;
}

function createJsonFromApiResponse(apiResponse) {
    return apiResponse
        .replace(/\n/g,'')
        .replace(/  /g,'')
        .trim()
        .match(/(\{).*?(\})/g)
        .map(JSON.parse);
}

async function createListFromText(text) {
    const textFromAI = await fetchContentFromChatGPT(text);
    const list = createJsonFromApiResponse(textFromAI);
    return list;
}

module.exports = {
    createListFromText,
};  
