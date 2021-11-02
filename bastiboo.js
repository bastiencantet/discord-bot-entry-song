const discord = require('discord.js')
const prefix = "|"
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const {MessageEmbed} = require("discord.js");
const player = createAudioPlayer();
let request
let duration
let url_to_play
let bot_state
let channel_id
const client  = new discord.Client({
  intents: [
      discord.Intents.FLAGS.GUILDS,
  discord.Intents.FLAGS.GUILD_MESSAGES,
      discord.Intents.FLAGS.GUILD_VOICE_STATES
  ]
})


const activate_embed = new MessageEmbed()
    .setColor("GREEN")
    .setTitle("Boo is Activated")


const desactivate_embed = new MessageEmbed()
    .setColor("GREEN")
    .setTitle("Boo is Deactivated")

client.on("ready", () => {
    console.log("ready")
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channelId
    let oldUserChannel = oldMember.channelId
    if (newMember.member.user.bot) return
    if (oldMember.member.user.bot) return
    console.log(url_to_play)
    if(oldUserChannel !== channel_id && newUserChannel === channel_id) {
        // User Joins a voice channel
        if (bot_state ===1) {
            let connection = joinVoiceChannel({
                channelId: newMember.channelId,
                guildId: newMember.guild.id,
                adapterCreator: newMember.guild.voiceAdapterCreator
            })
            play_ytb(url_to_play, connection, duration)
            player.on(AudioPlayerStatus.Idle, () => {
                connection.disconnect()
            })
        }

    } else if(newUserChannel === null){

    }
})



client.on("messageCreate", message => {
     request = message.content.split(" ")
    if (request[0] === prefix + "boo") {
        if (request.length === 1) {
            message.reply("no flag entered")
        } else {
            if (request[1] === '--stop') {
                message.channel.send({embeds: [desactivate_embed]})
                bot_state = 0
                url_to_play = ""
                duration = 0
            }
            if (request[1] === '--youtube') {
                if (request.length > 3) {
                    if (request[3] === '--duration') {
                        duration = request[4]
                    } else {
                        return message.channel.send("Bad syntax")
                    }
                } else {
                    duration = 0
                }
                url_to_play = request[2]
                bot_state = 1
                message.channel.send({embeds: [activate_embed]})
                channel_id = message.member.voice.channel.id
            }
        }
    }
})





async function play_ytb(url, connection) {
    const resource = createAudioResource(await ytdl(url, { filter: format => format.container === 'mp4' }));
    let vidid = ytdl.getURLVideoID(url)
    let info = await ytdl.getInfo(vidid);
    let format = ytdl.chooseFormat(info.formats, { quality: '140' });
    console.log(ytdl.videoFormat)
    const sub = connection.subscribe(player);
    player.play(resource)
    if (duration > 0) {
        setTimeout(() => {
            //sub.unsubscribe()
            player.stop()
        }, duration * 1000)
    }
}

client.login(token);
