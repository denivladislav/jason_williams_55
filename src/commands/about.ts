import { Context } from 'telegraf';
import createDebug from 'debug';

import { author, name, version } from '../../package.json';

const debug = createDebug('bot:about_command');

const about = () => async (ctx: Context) => {
  try {
    const message = `*${name} ${version}*\n${author}`;
    debug(`Triggered "about" command with message \n${message}`);
    await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown'});
  } catch (err) {
    console.error('Error running about:', err);
    await ctx.reply('⚠️ Failed to run about. Check bot logs for details.');
  }
};

export { about };
