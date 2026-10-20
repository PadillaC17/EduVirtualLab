// Capabilities are explicit: the UI must never advertise a missing operation.
export type EngineCapabilities={points:boolean;dynamicConstructions:boolean;functions2D:boolean;implicit2D:boolean;surfaces3D:boolean;exportSVG:boolean;exportPNG:boolean};
export interface GeometryEngine {readonly id:string;readonly capabilities:EngineCapabilities;dispose():void;}
export const foundationCapabilities:EngineCapabilities={points:true,dynamicConstructions:false,functions2D:false,implicit2D:false,surfaces3D:false,exportSVG:false,exportPNG:false};
