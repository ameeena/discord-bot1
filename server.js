const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, IntentsBitField, Partials } = require('discord.js');
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const URL = process.env.API_URL;
const commands = []
const command = require("./clearConversation.js");

commands.push(command.data.toJSON());

const command2 = require("./webSearch.js");
commands.push(command2.data.toJSON());

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
        GatewayIntentBits.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageTyping,
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
        console.log("User name is :: ", interaction.user.username)
        const result = await clearConversation(interaction.user.username);
        await interaction.reply("This coversation is cleared!");
    }

    if (commandName === 'web-search') {
        console.log("Web search requested:", interaction)
        // const result = await searchTheWeb(interaction.MessageContent);
        interaction.reply("I should do a web search now!");
    }

});

client.on('messageCreate', async (message) => {
    if (message?.author.id === client.user.id) return;
    console.log("GOT MESSAGE:", message.content)
    console.log("MESSAGE TYPE:", message.channel.type)
    if (message.channel.type === 1) {
        console.log("This is a DM.")
        const result = await getResponse(message.content, message.author.username, message.channelId);
        _f = result["response"];
        for (let i = 0; i < _f.length; i += 2000) {
            const final_res = result["response"].slice(i, i + 2000);
            message.reply(final_res);
        }
    } else if (message.channel.type === 0) {
        console.log("This is a server message.")
        if (message.channel.isThread()) {
            // console.log("This is a thread.")           
            // const result = await getResponseInThread(message.content, message.threadId);
            // _f = result["response"];
            // for (let i = 0; i < _f.length; i += 2000) {
            //     const final_res = result["response"].slice(i, i + 2000);
            //     message.reply(final_res);
            // }
        } else if (message.mentions.has(client.user.id)) {
            console.log("Bot mentioned in the message.")
            const thread = await message.startThread({
                name: "BotThread:" + crypto.randomBytes(4).toString('hex'),
            })
            // console.log(thread.channel.id)
            console.log(thread.id)
            const result = await getResponseInThread(message.content, thread.id);
            _f = result["response"];
            for (let i = 0; i < _f.length; i += 2000) {
                const final_res = result["response"].slice(i, i + 2000);
                thread.send(final_res);
            }
            //Start a thread at this point.
        } else {
            console.log("Bot not mentioned in this message.")
        }
    } else if (message.channel.isThread()) {
        console.log("Here!")
        // console.log(message.)
        const isConversation = await isThreadAConversation(message.channel.id);
        console.log("Is conversation:", isConversation)
        //Get the thread id
        const threadId = message.channel.id;
        const result = await getResponseInThread(message.content, threadId);
        _f = result["response"];
        for (let i = 0; i < _f.length; i += 2000) {
            const final_res = result["response"].slice(i, i + 2000);
            message.reply(final_res);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

async function clearConversation(username, channelId) {
    try {
        const payload = {
            username: username,
            channelId: channelId
        }
        console.log(payload);
        const response = await axios.post(`${URL}/clearConversation/`, payload);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}

async function getResponse(message, username, channelId) {
    try {
        console.log(channelId)
        const payload = {
            username,
            message,
            channelId
        };
        console.log(payload);
        const response = await axios.post(`${URL}/getResponse/`, payload);
        console.log(response.data);
        return response.data;
    } catch (error) {
        return { response: "GETRESPONSE I am sorry, I am having trouble right now. Please try again later." };
    }
}

async function getResponseInThread(message, threadId) {
    console.log(message)
    console.log(threadId)
    try {
        const payload = {
            message,
            threadId
        };
        console.log(payload);
        const response = await axios.post(`${URL}/getResponseInThread/`, payload);
        console.log(response.data);
        return response.data;
    } catch (error) {
        return { response: "GETRESPONSEINTHREAD I am sorry, I am having trouble right now. Please try again later." };
    }
}

async function isThreadAConversation(threadId) {
    console.log(threadId)
    //convert threadId to a string
    threadId = threadId.toString();
    try {
        const payload = {
            threadId
        };
        const response = await axios.post(`${URL}/isThreadAConversation/`, payload);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}

async function searchTheWeb(message, username, channelId) {
    try {
        const payload = {
            username: username,
            message: message
        };
        const response = await axios.post(`${URL}/searchTheWeb/`);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}
