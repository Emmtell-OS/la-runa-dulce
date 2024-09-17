export default class Utils {

    static elegirInterpretacion(runaCode: string, catInterpretaciones: any): number {
        let filtrado = catInterpretaciones.find((runa: {}) => Object.keys(runa)[0] === runaCode);
        if (filtrado === undefined) {
            return null;
        } else {
            return this.getRand(filtrado[runaCode].length, 0);
        }
    }

    static getRand(MIN:number, MAX:number): number {
        return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    }
}