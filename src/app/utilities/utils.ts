export default class Utils {

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

        console.log(runa[runaCode]);
        

        return runa[runaCode];
    }
}