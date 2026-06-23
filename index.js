// para ir buscar o token ao .env
require('dotenv').config();

// 1. Chamamos a biblioteca do Discord
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

// 2. Criamos o bot e dizemos que ele tem autorização para ver Mensagens e o Conteúdo delas

const bot = new Client ({
intents: [   // aqui dentro esta o que o bot consegue ver
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
]
})

// 3. Um aviso no terminal para sabermos que ele ligou

bot.once("ready", ()=> {
    console.log("AQUI E PAVUNA!");
});


bot.on("messageCreate", (mensagem) => {

    if(mensagem.author.bot) return;

    if(mensagem.content==="!ping")
        {
        mensagem.reply("🏓 Pong!")
    }


    if(mensagem.content === "!membros"){

        const embedinfo = new EmbedBuilder()
        .setColor('#FF1E00')
        .setTitle("🥷 | Membros No Servidor")
        .setDescription(`📊 | Aqui podes ver o estado atual da nossa comunidade! Atualmente somos ${mensagem.guild.memberCount} membros a partilhar código e a jogar juntos.`)
        .addFields(
            {name : "👑 | Dono", value :`<@${mensagem.guild.ownerId}>`, inline : true },
            {name :"🎯 Próxima Meta ", value : `${mensagem.guild.memberCount} / 500`, inline : false},
            {name : "🆔 ID do Servidor", value : `${mensagem.guild.Id}`, inline : true},
            {name : "🔊 Total de Canais", value : `${mensagem.guild.channels.cache.size} canais + categorias`, inline : true}
        )

    
        
        const totalMembros = mensagem.guild.memberCount;  // vamos "contar quantos membros tem e guardar nesta variavel"

        mensagem.reply({embeds: [embedinfo]});  
};
    if(mensagem.content === "!informacao"){

        const embedInfo =new EmbedBuilder()  //criamos o nosso embed
            .setColor('#3498db') // Define a cor da barra lateral (Azul)   // .setcolor é barra lateral
            .setTitle(`ℹ️ Informações do Servidor: ${mensagem.guild.name}`) // titulo 
            .setDescription("Aqui tens os detalhes principais sobre este servidor do Discord.") // descricao
            .addFields(
                {"name" : "Total de membros", "value":`${mensagem.guild.memberCount}`, inline: true},
                {"name" : "ID do Servidor", "value" : `${mensagem.guild.id}`, inline : true}
            )


            .setTimestamp()  // mete a data/hora atual da mensagem

            .setFooter({text : "Bot Criado Por sixteen"});// texto rodape

            mensagem.reply({embeds: [embedInfo]}); // enviar
}});

bot.login(process.env.token);