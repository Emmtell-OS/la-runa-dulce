export default class Utils {

    /**
     * Genera un folio de 10 caracteres aleatorios
     * 
     * @returns String
     */
    static generateFolio(): string {
    let indice: string = '';

    for (let i = 1; i <= 10; i++) {
        let rand = Utils.getRand(48, 122); //this.getRand(122, 48);
        while ((rand > 90 && rand < 97) || (rand > 57 && rand < 65)) {
        rand = Utils.getRand(48, 122); //this.getRand(122, 48);
        }
        indice = indice + String.fromCharCode(rand);
    }

    return indice;
    }

    static elegirInterpretacion(runaCode: string, catInterpretaciones: any): number {
        let filtrado = catInterpretaciones.find((runa: {}) => Object.keys(runa)[0] === runaCode);
        if (filtrado === undefined) {
            return null;
        } else {
            return this.getRand(0, filtrado[runaCode].length -1);
        }
    }

    static getRand(MIN:number, MAX:number): number {
        return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    }

    static getNombreRuna(runaCode: string): string {
        const runa = {
            "AL": "ALGIZ",
            "AS": "ANSUZ",
            "BE": "BERKANA",
            "DA": "DAGAZ",
            "EH": "EHWAZ",
            "EI": "EIHWAZ",
            "FE": "FEHU",
            "GE": "GEBO",
            "HA": "HAGALAZ",
            "IS": "ISA",
            "JE": "JERA",
            "KA": "KANO",
            "LA": "LAGUZ",
            "MA": "MANNAZ",
            "NA": "NAUTHIZ",
            "NG": "INGUZ",
            "OD": "ODIN",
            "OT": "OTHILA",
            "PE": "PERTH",
            "RA": "RAIDO",
            "SW": "SOWELU",
            "TE": "TEIWAZ",
            "TH": "THURIZAS",
            "UR": "URUZ",
            "WU": "WUNJO"
        };
        
        return runa[runaCode];
    }
}