const { TOKEN, CHANNEL_ID, SERVER_ID, YT_LINK, OWNER_NAME } = require("./config.json");
const { STATUS1, STATUS2, STATUS3 } = require("./status.json")
const discord = require("discord.js");
const client = new discord.Client();
const ytdl = require('ytdl-core');

client.on('ready', async () => {
  console.log("Started streaming " + (YT_LINK) + ` as ${client.user.tag}`);
const status_list = [(STATUS1),(OWNER_NAME),(STATUS2),(STATUS3)];
    setInterval(() => {
        const index = Math.floor(Math.random() * (status_list.length - 1) + 1);
       client.user.setActivity(status_list[index],{ type: 'LISTENING' });
    }, 5000);
});
  let channel = client.channels.cache.get(CHANNEL_ID) || await client.channels.fetch(CHANNEL_ID)

  if(!channel) return;
  const connection = await channel.join();
  connection.play(ytdl(YT_LINK))
})

setInterval(async function() {
  if(!client.voice.connections.get(SERVER_ID)) {
    let channel = client.channels.cache.get(CHANNEL_ID) || await client.channels.fetch(CHANNEL_ID)
    if(!channel) return;

    const connection = await channel.join()
    connection.play(ytdl(YT_LINK))
  }
}, 20000)

client.login(TOKEN)
