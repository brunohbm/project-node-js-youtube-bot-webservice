const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openAiApi = new OpenAIApi(configuration);
const JSON_PROMPT_COMPLEMENT = 'Give me a list in JSON, from the THEME_NAME with ITENS_LIST. The keys of the JSON will be KEY_LIST';

async function fetchContentFromChatGPT(promptText) {
    try {
        const { data } = await openAiApi.createCompletion({
            model: 'text-davinci-003',
            prompt: promptText,
            temperature: 0,
            max_tokens: 4000,
        });

        return data.choices[0].text;
    } catch (error) {
        console.warn(error);
        return null;
    }
}

function createJsonFromApiResponse(apiResponse) {
    return apiResponse
        .replace(/\n/g, '')
        .replace(/ {2}/g, '')
        .trim()
        .match(/(\{).*?(\})/g)
        .map(JSON.parse);
}

async function createJSONListFromText(theme, itemsList) {
    const finalPrompt = JSON_PROMPT_COMPLEMENT
        .replace('THEME_NAME', theme)
        .replace('ITENS_LIST', Object.values(itemsList).join(', '))
        .replace('KEY_LIST', Object.keys(itemsList).join(', '));

    const textFromAI = await fetchContentFromChatGPT(finalPrompt);
    return createJsonFromApiResponse(textFromAI);
}

module.exports = {
    createJSONListFromText,
    fetchContentFromChatGPT,
};
