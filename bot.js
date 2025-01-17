const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});


client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!play') || message.author.bot) return;

    const args = message.content.split(' ');
    const url = args[1];

    if (!ytdl.validateURL(url)) {
        message.channel.send('Please provide a valid YouTube URL.');
        return;
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        message.channel.send('You need to be in a voice channel to play music!');
        return;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(ytdl(url, { filter: 'audioonly' }));

    connection.subscribe(player);
    player.play(resource);

    player.on('idle', () => connection.destroy());
});

client.login(process.env.BOT_TOKEN);

