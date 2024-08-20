export async function handler(interaction) {
  await interaction.reply({content:`See ya.`, ephemeral:true});
  await this.master._onShutdown();
};

export const definition = {
  "name": "shutdown",
  "description": "Gracefully shuts down the bot.",
};
