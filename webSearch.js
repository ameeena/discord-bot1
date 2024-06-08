
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('web-search')
        .setDescription('does a search on the web!'),
    async execute(interaction) {
        const result = await searchTheWeb();
        await interaction.reply(result);
    },
};
