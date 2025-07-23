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
                return { ...c, name: `${c.flag} ${c.name}` };
            }
            return c;
        });
        return this;
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

    exportToJSON() {
        return this.contacts.map(({ name, number }) => ({ name, number }));
    }
}

module.exports = VCFUtils;
