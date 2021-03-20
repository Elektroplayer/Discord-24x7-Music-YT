const { TOKEN, CHANNEL_ID, STATUS, LOG_CHANNEL } = require("./config.json");

const discord  = require("discord.js");
const client   = new discord.Client();
const ytdl     = require('ytdl-core');
const fs       = require('fs');

let filename = './music.txt';
let queue;
let musicClass;

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

fs.readFile(filename, 'utf8', (err, data) => {
    if (err) throw err;

    queue = data.split("\n");
});

class musicPlayer { //  Без класса было бы сложно...
    constructor(channel, connection, queue) {
        this.channel = channel;
        this.connection = connection;
        this.queue = queue;
        this.curQueue;
    }

    makeQueue() {
        this.curQueue = this.queue;
        shuffle(this.curQueue);
    }

    play() {

        if(!this.curQueue || this.curQueue.length == 0) {
            this.makeQueue();
            this.play();
        } else {
            this.connection.play(ytdl(this.curQueue[0], { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }))
            .on('start', () => { 
                if(this.channel.members.size >= 2 && LOG_CHANNEL) {
                    let logChannel = client.channels.cache.get(LOG_CHANNEL) || client.channels.fetch(LOG_CHANNEL);
                    if(!logChannel) return;
        
                    logChannel.send(`**Сейчас играет:**\n${queue[0]}`);
                }
                this.curQueue.shift();
            })
            .on('finish', () => {
                this.play();
            });
        }
    }
}

client.on('ready', () => {
    console.log(`Стартануло! Аккаунт: ${client.user.tag}`);
    client.user.setActivity((STATUS),{ type: 'LISTENING' });
});

client.on("message", async (message) => {
    if(message.author.bot) return; //  Забиваем, если бот
    if(message.channel.type == 'dm') return; //  Забиваем, если ЛС

    let messArray  = message.content.replace(/\s+/g, ' ').split(" "); //  Массив из слов/аргументов
	let cmd        = messArray[0]; //  cmd это самый первый аргумент

    //let args       = messArray.slice(1); //  Далее аргументы без cmd

    if(cmd == "r!join") {
        let channel = message.member.voice.channel; //client.channels.cache.get(CHANNEL_ID) || await client.channels.fetch(CHANNEL_ID);
        
        if(!channel) return message.channel.send(new discord.MessageEmbed().setColor("#FF0000").setTitle('Ты должен быть в голосовом канале!')).then(msg=> {msg.delete({timeout: 5000})});
        if(channel.members.get(client.user.id)) return message.channel.send(new discord.MessageEmbed().setColor("#FF0000").setTitle('Я уже в канале!')).then(msg=> {msg.delete({timeout: 5000})});

        const connection = await channel.join();
    
        musicClass = new musicPlayer(channel, connection, queue)
        musicClass.play()
    }

    if(cmd == "r!leave") {
        if(!client.voice.connections.get(message.guild.id)) return message.channel.send(new discord.MessageEmbed().setColor("#FF0000").setTitle('Я не нахожусь в голосовом канале!')).then(msg=> {msg.delete(({timeout: 5000}))});
        if(!message.member.voice.channel) return message.channel.send(new discord.MessageEmbed().setColor("#FF0000").setTitle('Ты должен быть в голосовом канале!')).then(msg=> {msg.delete({timeout: 5000})});
        if(!musicClass) return message.channel.send(new discord.MessageEmbed().setColor("#FF0000").setTitle('Ошибка!')).then(msg=> {msg.delete({timeout: 5000})});

        //await client.voice.connections.get(message.guild.id).dispatcher.end();
        //musicClass.stop()
        message.guild.me.voice.channel.leave()
        musicClass = undefined;
    }
})

client.login(TOKEN);
