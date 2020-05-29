const config = require('../config');
const utils = require('../utils');
const threadUtils = require('../threadUtils');

module.exports = bot => {
  const addInboxServerCommand = (...args) => threadUtils.addInboxServerCommand(bot, ...args);

  function generateHelp(command) {
	if (! command.desc && ! command.description) {
		return Promise.resolve();
	}

	const msgArray = [];
	const prefix = '?';
	const name = `${command.name}`;

	if (command.aliases && command.aliases.length > 1) {
		msgArray.push(`**Aliases:** ${prefix}${command.aliases.slice(1).join(`, ${prefix}`)}`);
	}

	const description = `**Description:** ${command.desc || command.description}`;

	msgArray.push(description);

	if (command.cooldown) {
		msgArray.push(`**Cooldown:** ${command.cooldown / 1000} seconds`);
	}

	if (command.commands) {
		msgArray.push('**Sub Commands:**');
		for (const cmd of command.commands) {
			if (cmd.default) {
				continue;
			}
			msgArray.push(`\t${prefix}${command.name} ${cmd.name} - ${cmd.desc}`);
		}
	}

	if (command.usage) {
		if (typeof command.usage === 'string') {
			const usage = `${command.usage}`;
			msgArray.push(`**Usage:** ${prefix}${usage}`);
		} else {
			msgArray.push('**Usage:** ');
			for (const use of command.usage) {
				msgArray.push(`\t${prefix}${use}`);
			}
		}
	} else if (command.commands) {
		msgArray.push('**Usage:** ');
		for (const use of command.commands.map(c => c.usage)) {
			msgArray.push(`\t${prefix}${use}`);
		}
	}

	if (command.example) {
		if (typeof command.example === 'string') {
			const example = `${command.example}`;
			msgArray.push(`**Example:** ${prefix}${example}`);
		} else {
			msgArray.push('**Example:**');
			for (const ex of command.example) {
				msgArray.push(`\t${prefix}${ex}`);
			}
		}
	}

	const embed = {
		color: 1146534,
		title: `**Command:** ${prefix}${name}`,
		description: msgArray.join('\n'),
	};

	return embed;
  }

  // Mods can reply to modmail threads using !r or !reply
	// These messages get relayed back to the DM thread between the bot and the user
	if (config.dataFactory) {
		const commands = require('../data/commands');
		addInboxServerCommand('command', async (msg, args, thread) => {
			if (! thread) return;

			const cmd = args.join(' ').trim();
			if (! cmd) return;
			let isAnonymous = false;

			if (config.replyAnonDefault === true) {
				isAnonymous = true;
			}

			const resolvedCommand = await commands.getCommand(cmd);
			if (! resolvedCommand) return;

			let embed;

			try {
				embed = generateHelp(resolvedCommand);
			} catch (err) {
				console.error(err);
			}

			if (! embed) return;

			await thread.sendCommandToUser(msg.member, { embed }, resolvedCommand, isAnonymous);
			msg.delete();
		});
	
		bot.registerCommandAlias('c', 'command');
	}
};
