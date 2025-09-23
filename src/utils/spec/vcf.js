class VCFUtils {
    constructor(parsedContacts) {
        this.contacts = parsedContacts; // array d'objets { name, number, country, countryCode, flag }
    }

    // 🔄 Supprimer les doublons par numéro
    removeDuplicateContacts() {
        const seen = new Set();
        this.contacts = this.contacts.filter(c => {
            if (seen.has(c.number)) return false;
            seen.add(c.number);
            return true;
        });
        return this;
    }

    addCountryFlagToNames() {
        this.contacts = this.contacts.map(c => {
            if (!c.name.startsWith(c.flag)) {
                return { ...c, name: `${c.name} ${c.flag}` };
            }
            return c;
        });
        return this;
    }
    addSufixToNames(sufix) {
        this.contacts = this.contacts.map(c => { if (!c.name.endsWith(sufix)) { return { ...c, name: `${c.name} ${sufix}` } } return c }); return this
    }
    filterByCountryCode(code = '+237') {
        this.contacts = this.contacts.filter(c => c.countryCode === code);
        return this;
    }

    toVCF() {
        let vcf = '';
        for (const contact of this.contacts) {
            vcf += `BEGIN:VCARD\nVERSION:3.0\n`;
            vcf += `FN:${contact.name}\n`;
            vcf += `TEL:${contact.number}\n`;
            vcf += `END:VCARD\n`;
        }
        const buffer = Buffer.from(vcf, "utf-8");
        return buffer;
    }

    /**
     * Exporte les contacts sous forme de tableau JSON.
     * @returns {Array<{name: string, number: string,jid: string}>}
     */
    exportToJSON() {
        return this.contacts.map(({ name, number }) => ({ name, number, jid: number + "@s.whatsapp.net" }));
    }
}

module.exports = VCFUtils;
