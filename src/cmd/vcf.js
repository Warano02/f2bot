module.exports = [
    {
        command: ["vcf"],
        desc: "Remove duplicated contact",
        operate: async ({ Tayc, reply, m, quoted }) => {

            try {
                const me = await Tayc.sendMessage(m.chat, { text: "hi" })
                Tayc.sendMessage(m.chat, { text: "", edit: me })
            } catch (e) {

            }
        }
    },
  


] 