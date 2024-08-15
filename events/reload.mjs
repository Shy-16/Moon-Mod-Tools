export async function handler(interaction) {
  let type = interaction.options.getSubcommand();
  if (type === 'event') {
    let file = interaction.options.getString('file');
    if(await this.master.registerEventHandlerFile(file, 'reload'))
      await interaction.reply({content:`Reloaded.`, ephemeral:true});
    else
      await interaction.reply({content:`Could not reload.`, ephemeral:true});
  }
  else if (type === 'slash') {
    let command = interaction.options.getString('command');
    await interaction.reply({content:`Doesn't work yet.`, ephemeral:true});
  }
};

export const definition = {
  name: 'reload',
  description: 'Reload a module.',
  options: [
    {
      type: 1,
      name: 'event',
      description: 'Reload an event handler.',
      options: [
        {
          name: "file",
          description: "The file with the event handler definitions.",
          type: 3,
          required: true,
        },
      ],
    },
    {
      type: 1,
      name: 'slash',
      description: 'Reload a slash command.',
      options: [
        {
          name: "command",
          description: "Name of the slash command.",
          type: 3,
          required: true,
        },
      ],
    },
  ],
};