require('rootpath')()
const ErrorHandler = require('src/errorhandler')
const fetch = require('node-fetch')
const { MessageEmbed } = require('discord.js')
const conf = require('conf')
const db = require('utils/database')

const description = `Locate a Player`
var prefix, themeColor, usage

module.exports =
{
    description,
    init: async function()
    {
        prefix = conf.mainconfig.command.prefix
        themeColor = conf.mainconfig.themeColor

        usage = `${prefix}locate @Mention/B3 ID`
        module.exports.usage = usage
    },

    callback: async function( msg, args, cmder )
    {
        const embed = new MessageEmbed().setColor(themeColor)

        if( !args.length )
            Entry = cmder.id
        else Entry = await db.getPlayerID(args[0])
            .catch( err => 
            {
                if( err == 'NO_LINK' )
                    msg.reply( { embeds: [ embed.setDescription(`${args[0]} hasn't linked their account yet`) ]})
                else if( err == 'BAD_ENTRY' )
                    msg.reply( { embeds: [ embed.setTitle(`Invalid Entry`).setDescription(`Usage: ${module.exports.usage}`) ]})
                else if( err == 'MENTIONED_BOT' )
                    msg.reply( { embeds: [ embed.setDescription(`Your mom's bedroom`) ]})
                else if( err == 'WORLD_ID' )
                    msg.reply( { embeds: [ embed.setDescription(`ID @1 is Classified`) ]})
                else if( err == 'NO_RESULT' )
                    msg.reply( { embeds: [ embed.setDescription(`No Player Found`) ]})
                else 
                {
                    msg.reply( { embeds: [ embed.setDescription('There was an Error while processing your command') ]})
                    ErrorHandler.fatal(err)
                }
            } )
        
        if( Entry == undefined )
            return

        const result = await db.pool.query(`SELECT * FROM clients WHERE id=${Entry}`)
            .catch( err => 
            {
                msg.reply( { embeds: [ embed.setDescription('There was an Error while processing your command') ]})
                ErrorHandler.fatal( err )
            })

        const ipinforeq = await fetch(`http://ip-api.com/json/${result[0].ip}`)
        const ipinfo = await ipinforeq.json()

        if( Entry == cmder.id )
            embed.setDescription(`You don't know your own location :D?`)
        else
        {
            if( args[0].startsWith('<@!'))
                embed.setDescription(`${args[0]} is from **${ipinfo.city}, ${ipinfo.regionName}, ${ipinfo.country}** :flag_${ipinfo.countryCode.toLowerCase()}:`)
            else embed.setDescription(`**${result[0].name}** is from **${ipinfo.city}, ${ipinfo.regionName}, ${ipinfo.country}** :flag_${ipinfo.countryCode.toLowerCase()}:`)
        }

        return msg.reply( { embeds: [embed]} )
    }
}