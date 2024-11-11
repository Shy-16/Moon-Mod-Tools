/**
 * Functions for managing a user's timeouts that are not from bullet hell or strikes.
 * @module modules/pitbot/pitManager
 */
import { updateRole } from './roles.mjs';
import * as Messages from './messageTemplates.mjs';

export async function pit(user, duration, mod=null, comment=null) {
  let module = this.master.modules.pitbot;
  
  // Validate input.
  if (!user)
    throw new Error(`Invalid user.`);
  
  if (isNaN(duration) || duration <= 0)
    throw new Error(`Invalid duration. Must be a number greater than 0.`);
  
  // Since it's a normal user input, make sure someone isn't trying to pit themselves repeatedly.
  if (!mod) {
    let timeout = await module.database.get('SELECT *,date+duration AS releaseTime FROM pits WHERE userId=? ORDER BY releaseTime DESC LIMIT 1', user.id);
    if (timeout?.releaseTime > Date.now())
      return false;
  }
  
  let logChannel = await this.channels.fetch(module.options.logChannelId);
  await module.database.run('INSERT INTO pits (userId, modId, duration, comment, date) VALUES (?, ?, ?, ?, ?)', user.id, mod?.id??null, duration, comment, Date.now());
  let pitData = await updateRole.call(this, user.id, 'pit');
  
  let notifSent = false;
  try {
    await user.send(await Messages.pitNotification.call(this, {guild:logChannel.guild, duration, comment}));
    notifSent = true;
  }
  catch(err) {
    this.master.logDebug(`Failed to DM user ${user.username}: (class:${err.constructor.name}) (code:${err.code}) (name:${err.name}) (status:${err.status}) (url:${err.url}) Message: ${err.message}`);
  }
  await logChannel.send(await Messages.pitConfirmation.call(this, {user, mod, duration, comment, notifSent}));
  return true;
}