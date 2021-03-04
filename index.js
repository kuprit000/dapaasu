const { create, Client } = require('@open-wa/wa-automate')
const figlet = require('figlet')
const fs = require('fs-extra')
const options = require('./utils/options')
const { color, messageLog } = require('./utils')
const HandleMsg = require('./HandleMsg')


const start = (aruga = new Client()) => {
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('URBAE BOT', { font: 'Ghost', horizontalLayout: 'default' })))
    console.log(color(figlet.textSync('----------------', { horizontalLayout: 'default' })))
    console.log(color('[DEV]'), color('Ａｒｄｅｓｔｏ', 'yellow'))
    console.log(color('[~>>]'), color('BOT Started!', 'green'))

    // Mempertahankan sesi agar tetap nyala
    aruga.onStateChanged((state) => {
        console.log(color('[~>>]', 'red'), state)
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') aruga.forceRefocus()
    })

    // ketika bot diinvite ke dalam group
     aruga.onAddedToGroup((async (chat) => {
        let totalMem = chat.groupMetadata.participants.length
        let groupName = chat.contact.name
	const gucid = gcid.includes(groupId)
        const ownerNumber = '6285758779973@c.us'
        const getAllMembers = await aruga.getGroupMembersId(chat.groupMetadata.id)
        if (totalMem < 300 && !getAllMembers.includes(ownerNumber)) {
            aruga.sendText(chat.id, `Upss...\n\nUntuk bisa mengundang bot kedalam grup *${name}*. Diwajibkan untuk donasi dulu yah ^^\n\n10K = 1 Minggu\n20K = 1 Bulan\n50K = Forever\n\nJika berminat, langsung chat contact admin dengan cara ketik: */ownerbot*`).then(() => aruga.leaveGroup(chat.id)).then(() => aruga.deleteChat(chat.id))
        } else {
            aruga.sendText(chat.groupMetadata.id, `Halo *${name}* terimakasih sudah menginvite bot ini, untuk melihat menu silahkan kirim */help* dan jangan lupa bantu owner untuk bisa memperbesar server agar bot ini tidak suspend/slow respon dengan cara kirim */donasi*`)
        }
    }))

	  aruga.onGlobalParicipantsChanged(async (event) => {
        const host = await aruga.getHostNumber() + '@c.us'
		const left = JSON.parse(fs.readFileSync('./lib/database/left.json'))
		const isLeft = left.includes(event.chat)
		const welcome = JSON.parse(fs.readFileSync('./lib/database/welcome.json'))
		const isWelcome = welcome.includes(event.chat)
		let profile = await aruga.getProfilePicFromServer(event.who)
		if (profile == '' || profile == undefined) profile = 'https://i.ibb.co/DthYrSB/a256bae0f5ed.jpg'
        // kondisi ketika seseorang diinvite/join group lewat link
        if (event.action === 'add' && event.who !== host && isWelcome) {
			 const gChat = await aruga.getChatById(event.chat)
			const { contact, groupMetadata, name} = gChat
			await aruga.sendFileFromUrl(event.chat, profile, 'profile.jpg', `*ey yo,what up!* *@${event.who.replace('@c.us','')}* Welcome to *${name}*\n\nThere is nothing to say, just follow the rules of *${name}* Group.\n\n*Commands bot: /menu, /p*`)
        }
        // kondisi ketika seseorang dikick/keluar dari group
        if (event.action === 'remove' && event.who !== host && isLeft) {
	    const gChat = await aruga.getChatById(event.chat)
	    const { contact, groupMetadata, name} = gChat
            const zchat = await aruga.getProfilePicFromServer(event.who)
            await aruga.sendFileFromUrl(event.chat, zchat, 'profile.jpg', `Babayy @${event.who.replace('@c.us', '')} Finally Beban Grup *${name}* berkurang 1 xixi`)
        }
    })

    aruga.onIncomingCall(async (callData) => {
        // ketika seseorang menelpon nomor bot akan mengirim pesan
        await aruga.sendText(callData.peerJid, 'Maaf sedang tidak bisa menerima panggilan.\n\n-bot')
        .then(async () => {
            // bot akan memblock nomor itu
            await aruga.contactBlock(callData.peerJid)
        })
    })


    // ketika seseorang mengirim pesan
    aruga.onMessage(async (message) => {
        aruga.getAmountOfLoadedMessages() // menghapus pesan cache jika sudah 3000 pesan.
            .then((msg) => {
                if (msg >= 3000) {
                    console.log('[aruga]', color(`Loaded Message Reach ${msg}, cuting message cache...`, 'yellow'))
                    aruga.cutMsgCache()
                }
            })
        HandleMsg(aruga, message)    
    
    })
	
    // Message log for analytic
    aruga.onAnyMessage((anal) => { 
        messageLog(anal.fromMe, anal.type)
    })
}

//create session
create(options(true, start))
    .then((aruga) => start(aruga))
    .catch((err) => new Error(err))
