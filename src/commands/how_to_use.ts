import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:help_command');

const DEFAULT_OPTIONS = (process.env.DEFAULT_OPTIONS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const POLL_ANONYMOUS = (process.env.POLL_ANONYMOUS ?? 'false').toLowerCase() === 'true';
const POLL_ALLOW_MULTIPLE = (process.env.POLL_ALLOW_MULTIPLE ?? 'true').toLowerCase() === 'true';
const TELEGRAM_MAX_OPTIONS = 10;

const how_to_use = () => async (ctx: Context) => {
  try {
    debug('Triggered /help command');

    const defaultOptsDisplay = DEFAULT_OPTIONS.length
      ? DEFAULT_OPTIONS.join(', ')
      : '';

    const helpMessage = `
🤖 *Помощь по боту*

Помощь по боту

Вы можете создавать опросы с помощью команды /start_poll.

Использование:
/start_poll Вопрос | Вариант 1 | Вариант 2 | ...

Создать опрос с вариантами по умолчанию:
/start_poll Го в баскет? | В пн | Во вт | В среду
Итог: В пн, Во вт, В среду, ${defaultOptsDisplay}

Создать опрос без вариантов по умолчанию:
/start_poll Го в баскет? | В пн | Во вт --no-defaults
Итог: только В пн, Во вт

Текущие настройки:
- Используйте символ | для разделения вариантов.
- Telegram позволяет до ${TELEGRAM_MAX_OPTIONS} вариантов.
- Варианты по умолчанию: ${defaultOptsDisplay}
- Анонимный опрос: ${POLL_ANONYMOUS ? 'Да' : 'Нет'}
- Разрешено несколько ответов: ${POLL_ALLOW_MULTIPLE ? 'Да' : 'Нет'}

Если возникают ошибки, проверьте формат команды.
`;
    await ctx.replyWithMarkdownV2(helpMessage, { parse_mode: 'Markdown' });

  } catch (err) {
    console.error('Error running help:', err);
    await ctx.reply('⚠️ Failed to run help. Check bot logs for details.');
  }
};

export { how_to_use };
