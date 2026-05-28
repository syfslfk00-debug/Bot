const { Client, ActivityType, Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    /**
     * @param {Client} client
     */
    execute(client) {
        client.user.setStatus("dnd");
        client.user.setActivity({
            name: 'Cookies', 
            type: ActivityType.Playing, 
        });
        
        console.log(`البوت متصل الآن باسم ${client.user.tag}`);
    },
};
