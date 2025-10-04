import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:start_poll_command');

const DEFAULT_OPTIONS = (process.env.DEFAULT_OPTIONS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const POLL_ANONYMOUS = (process.env.POLL_ANONYMOUS ?? 'false').toLowerCase() === 'true';
const POLL_ALLOW_MULTIPLE = (process.env.POLL_ALLOW_MULTIPLE ?? 'true').toLowerCase() === 'true';

const TELEGRAM_MAX_OPTIONS = 10;

function parseStartPollInput(rawText: string) {
  const stripped = rawText.replace(/^\/start_poll(@\w+)?\s*/i, '').trim();
  const NO_DEFAULTS_TOKEN = '--no-defaults';

  let useDefaults = true;
  let text = stripped;
  if (stripped.includes(NO_DEFAULTS_TOKEN)) {
    useDefaults = false;
    text = stripped.replace(NO_DEFAULTS_TOKEN, '').trim();
  }

  if (!text) {
    return { errors: ['No question/options provided. Usage: /start_poll Question | opt1 | opt2'], question: null, options: [], usedDefaults: useDefaults };
  }

  const parts = text.split('|').map(p => p.trim()).filter(Boolean);
  const question = parts.shift();
  const optionsFromUser = parts;

  const options = [...optionsFromUser];

  if (useDefaults && DEFAULT_OPTIONS.length > 0) {
    DEFAULT_OPTIONS.forEach(opt => {
      if (opt && !options.includes(opt)) options.push(opt);
    });
  }

  const uniqueOptions = Array.from(new Set(options.map(o => o.trim()).filter(Boolean)));

  const errors = [];
  if (!question) errors.push('Poll question is empty.');
  if (uniqueOptions.length < 2) {
    errors.push('A poll requires at least 2 options. Use: `/start_poll Question | opt1 | opt2`.');
  }
  if (uniqueOptions.length > TELEGRAM_MAX_OPTIONS) {
    errors.push(`Too many options: Telegram allows up to ${TELEGRAM_MAX_OPTIONS}. You provided ${uniqueOptions.length}.`);
  }

  return {
    question,
    options: uniqueOptions,
    usedDefaults: useDefaults && DEFAULT_OPTIONS.length > 0,
    errors
  };
}

const start_poll = () => async (ctx: Context) => {
  try {
    const ctxmsg = ctx.message;
    if (!ctxmsg || !('text' in ctxmsg)) {
        await ctx.reply(`❗ Couldn't create poll: message is not a text`);
        return;
    }

    const raw = ctxmsg.text ?? '';
    const { question, errors, options, usedDefaults } = parseStartPollInput(raw);

    if (errors.length) {
      await ctx.reply(`❗ Couldn't create poll:\n- ${errors.join('\n- ')}`);
      return;
    }

    debug(`Triggered "about" command with:\nquestion:${question}\n`)
    await ctx.replyWithPoll(question || 'Опрос:', options, {
      is_anonymous: POLL_ANONYMOUS,
      allows_multiple_answers: POLL_ALLOW_MULTIPLE,
    });

  } catch (err) {
    console.error('Error creating poll:', err);
    await ctx.reply('⚠️ Failed to create poll. Check bot logs for details.');
  }
};

export { start_poll };
