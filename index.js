require('dotenv').config();
const { Client, GatewayIntentBits, IntentsBitField, Partials } = require('discord.js');
const axios = require('axios');
const URL = process.env.API_URL;
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});
client.login(process.env.DISCORD_TOKEN);
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});
client.on('messageCreate', async (message) => {
    console.log(message.content);
    console.log(message.author.username);
    console.log(" This is the type of the message channel: ", message.channel.type);
    console.log(" This is the type of the message channel name", message.channel.name);
    console.log(" This is the type of the message : ", message.type);
    if (!message?.author.bot) {
        const result = await getResponse(message.content, message.author.username);
        const final_res = result["response"].substring(0, 2000);
        message.reply(final_res);
    }
});
async function getResponse(message, username) {
    try {
        const payload = {
            username,
            message
        };
        console.log(payload);
        const response = await axios.post(`${URL}/getResponse/`, payload);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}