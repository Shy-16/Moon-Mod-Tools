/**
 * All of the templates for messages sent by the bot.
 * @module modules/modmail/messageTemplates
 */

/**
 * Message sent to the ticket when a user creates or updates a ticket.
 * @this discord.js/Client
 * @param {discord.js/Object} input
 * @param {?discord.js/CommandInteraction} input.interaction - The interaction that was used to update the ticket, or undefined if no interaction was used.
 * @param {?discord.js/Message} input.message - The message that was sent to the bot to update the ticket, or undefined if no message was sent.
 * @returns {discord.js/BaseMessageOptions} The options for creating and sending the message.
 */
export async function messageReceived({interaction,message}={}) {
  let response = {
    embeds: [{
      title: `Message received`,
    }],
  };
  
  if (interaction) {
    response.embeds[0].url = interaction.targetMessage.url;
    response.embeds[0].description = interaction.targetMessage.content;
    response.embeds[0].footer = {
      text: `${interaction.targetMessage.author.username}`,
      icon_url: `${interaction.targetMessage.author.avatarURL()}`,
    };
    response.files = interaction.targetMessage.attachments.map(v=>v);
  }
  else if (message) {
    response.embeds[0].description = message.content;
    response.embeds[0].footer = {
      text: `${message.author.username}`,
      icon_url: `${message.author.avatarURL()}`,
    };
    response.files = message.attachments.map(v=>v);
  }
  
  return response;
}

/**
 * Message sent to the user when they create or update a ticket.
 * @this discord.js/Client
 * @param {discord.js/Object} input
 * @param {?discord.js/CommandInteraction} input.interaction - The interaction that was used to update the ticket, or undefined if no interaction was used.
 * @param {?discord.js/Message} input.message - The message that was sent to the bot to update the ticket, or undefined if no message was sent.
 * @param {boolean} [input.created=false] - Whether this report has created a new ticket.
 * @returns {discord.js/BaseMessageOptions} The options for creating and sending the message.
 */
export async function ticketConfirmation({interaction,message,created=false}={}) {
  let response = {
    embeds: [{}],
    ephemeral: true,
  };
  
  if (created)
    response.embeds[0].title = `Ticket Created`;
  else
    response.embeds[0].title = `Ticket Updated`;
  
  if (interaction) {
    response.embeds[0].description = `The message ${interaction.targetMessage.url} has been reported to the moderators.`;
  }
  else if (message) {
    response.embeds[0].description = `Your message has been sent to the moderators.`;
  }
  
  return response;
}

/**
 * Message sent to the user when a moderator responds to the ticket.
 * @this discord.js/Client
 * @param {discord.js/Message} message - The message that was sent to the bot to update the ticket.
 * @returns {discord.js/BaseMessageOptions} The options for creating and sending the message.
 */
export async function newResponse(message) {
  let response = {
    embeds: [{
      title: `New Response`,
      description: message.content,
    }],
    files: message.attachments.map(v=>v),
  };
  
  return response;
}

/**
 * The first message that will appear at the start of a newly created ticket thread.
 * @this discord.js/Client
 * @param {discord.js/GuildMember} member - The guild member who created the ticket.
 * @returns {discord.js/BaseMessageOptions} The options for creating and sending the message.
 */
export async function newTicket(member) {
  let response = {
    embeds: [{
      title: `New Ticket`,
      description: `Type a message in this channel to reply. Messages starting with the server prefix \`=\` are ignored, and can be used for staff discussion. Use the command \`=close <reason:optional>\` to close the ticket.`,
      fields: [
        {
          name: `User`,
          value: `${member.user}`,
          inline: true,
        },
        { // Note: Do not change the name or value; the module uses this field to determine which user opened the thread.
          name: `Id`,
          value: member.user.id,
          inline: true,
        },
        {
          name: `Roles`,
          value: member.roles.cache.filter(role => role.name !== '@everyone').map((role,id) => `<@&${id}>`).join(' '),
        },
      ],
      footer: {
        text: `${member.user.username}`,
        icon_url: `${member.user.avatarURL()}`,
      },
    }],
  };
  
  return response;
}
