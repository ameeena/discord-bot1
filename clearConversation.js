
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-conversation')
        .setDescription('clears your conversation with the bot'),
    async execute(interaction) {
        const result = await clearConversation();
        await interaction.reply("This coversation is cleared!");
    },
};

async function clearConversation() {
    try {
        const response = await axios.get(`${URL}/clearConversation/`);
        return response.data;
    } catch (error) {
        return { response: "I am sorry, I am having trouble right now. Please try again later." };
    }
}