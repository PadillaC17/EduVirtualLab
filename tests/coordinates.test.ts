import {describe,it,expect} from 'vitest';
import {worldToScreen,screenToWorld,zoom,gridStep} from '../src/math/coordinates';
import {validCoordinate} from '../src/domain/model';
describe('sistema cartesiano',()=>{
 it('conserva coordenadas tras transformaciones con zoom y desplazamiento',()=>{for(const scale of [15,45,160])for(const [x,y] of [[0,0],[-3,2],[9.5,-4.25]]){const v={cx:7,cy:-2,scale};const s=worldToScreen(x,y,v);const w=screenToWorld(s.x,s.y,v);expect(w.x).toBeCloseTo(x,10);expect(w.y).toBeCloseTo(y,10);}});
 it('orienta el eje y hacia arriba',()=>{expect(worldToScreen(0,1,{cx:0,cy:0,scale:45}).y).toBeLessThan(worldToScreen(0,0,{cx:0,cy:0,scale:45}).y);});
 it('limita el zoom para evitar escalas inválidas',()=>{expect(zoom({cx:0,cy:0,scale:45},100).scale).toBe(160);expect(zoom({cx:0,cy:0,scale:45},0.001).scale).toBe(15);});
 it('elige cuadrículas legibles en todo el intervalo permitido',()=>{for(const scale of [15,30,45,90,160]){expect(gridStep(scale)*scale).toBeGreaterThanOrEqual(40);expect(gridStep(scale)*scale).toBeLessThanOrEqual(100);}});
 it('rechaza valores no finitos y fuera de rango',()=>{expect(validCoordinate(NaN)).toBe(false);expect(validCoordinate(Infinity)).toBe(false);expect(validCoordinate(10001)).toBe(false);expect(validCoordinate(-10000)).toBe(true);});
});
