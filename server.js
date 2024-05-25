const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, IntentsBitField, Partials } = require('discord.js');
require('dotenv').config();
const axios = require('axios');

const URL = process.env.API_URL;
const commands = []
const command = require("./clearConversation.js");

commands.push(command.data.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        const clientId = process.env.DISCORD_CLIENT_ID;
        const guildId = process.env.DISCORD_GUILD_ID;
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    // if (!interaction.isCommand()) return;
    const { commandName } = interaction;
    if (commandName === 'clear-conversation') {
        console.log("USer name is :: ", interaction.user.username)
        const result = await clearConversation(interaction.user.username);
        await interaction.reply("This coversation is cleared!");
    }
});


client.on('messageCreate', async (message) => {
    console.log(message.content);
    console.log(message.author.username);
    console.log(" This is the type of the message channel: ", message.channel.type);
    console.log(" This is the type of the message channel name", message.channel.name);
    console.log(" This is the type of the message : ", message.type);
    if (!message.mentions.has(client.user) && message.channel.type != 1) return;
    if (!message?.author.bot) {
        const result = await getResponse(message.content, message.author.username);
        const final_res = result["response"].substring(0, 2000);
        message.reply(final_res);
    }
});

client.login(process.env.DISCORD_TOKEN);

async function clearConversation(username) {
    try {
        const payload = {
            username: username
        }
        console.log(payload);
        const response = await axios.post(`${URL}/clearConversation/`, payload);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}

async function getResponse(message, username) {
    try {
        const payload = {
            username,
            message
        };
        console.log(payload);
        const response = await axios.post(`${URL}/getResponse/`, payload);
        console.log(response.data);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}

