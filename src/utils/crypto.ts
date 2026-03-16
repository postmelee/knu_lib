const SPONGE_START = "AiZdoAGnNMyVmibRH";
const SPONGE_STOP = "HvEDbxxKwrtyHTJLbxzu";
const SPONGE_PAD =
    "HvEDbxxKwrtyHTJLbxzuAiZdoAGnNMyVmibRH" +
    "KwrtyHTJLbxzuAiZdoAGnAGnNMyVmibRHKwrtyH" +
    "iZdoAGnNMyVmibRHKwrtyHTJLbxzuAiZdoAGnAGnNMy" +
    "GnNMyVmibRHKwrtyHTJLbxzuAiZdoAGnAGn";

/**
 * Sponge Encryption Utility
 * Custom encryption algorithm required for Kangnam University Library API auth bypass.
 */
export const spongeEncrypt = (text: string): string => {
    if (!text) return SPONGE_START + SPONGE_STOP;

    const reversedText = text.split('').reverse().join('');
    let result = "";

    for (let i = 0; i < reversedText.length; i++) {
        const ch = reversedText[i];
        result += ch;
        
        // Random position between 0 and 51 inclusive
        const randPos = Math.floor(Math.random() * 52);
        
        if (i % 2 !== 0) {
            // Odd index: 2 chars padding
            result += SPONGE_PAD.substring(randPos, randPos + 2);
        } else {
            // Even index: 3 chars padding
            result += SPONGE_PAD.substring(randPos, randPos + 3);
        }
    }

    return SPONGE_START + result + SPONGE_STOP;
};

/**
 * Helper to format the User-Agent timestamp as required by the spec.
 * Format: {Base_UA} spongeapp{App_Version} spongeandroid {SpongeEncrypt(Timestamp_yyyyMMddHHmmss)}
 */
export const getSpongeTimestampString = (): string => {
    const now = new Date();
    // Format: yyyyMMddHHmmss
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return spongeEncrypt(timestamp);
};
