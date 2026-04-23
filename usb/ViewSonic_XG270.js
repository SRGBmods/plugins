/* global
shutdownColor:readonly
LightingMode:readonly
*/
export function Name() { return "ViewSonic XG270"; }
export function VendorId() { return 0x0416; }
export function ProductId() { return 0x5020; }
export function Vids() { return [0x0416, 0x0543]; }
export function Pids() { return [0x5020, 0xA004, 0xA002]; }
export function Publisher() { return "Gemini & Community"; }
export function Version() { return "1.0.1"; }
export function Size() { return [2, 1]; }
export function DefaultPosition() { return [10, 10]; }
export function DefaultScale() { return 8.0; }
export function Type() { return "Hid"; }

export function Validate(endpoint) {
    return endpoint.interface !== -1;
}

export function ControllableParameters() {
    return [
        {"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#000000"},
        {"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced Off"], "default":"Canvas"},
    ];
}

export function vLedNames() { return [ "Downward LEDs", "Rear Ring LEDs" ]; }
export function vLedPositions() { return [ [0, 0], [1, 0] ]; }

const VS_MODE_OFF = 0x00;
const VS_MODE_STATIC = 0x01; 

let downwardColor = [0, 0, 0];
let rearColor = [0, 0, 0];

export function Initialize() {
}

export function Render() {
    sendColors();
}

export function Shutdown() {
}

export function LedNames() {
    return vLedNames();
}

export function LedPositions() {
    return vLedPositions();
}

export function sendColors() {
    downwardColor = device.color(0, 0);
    rearColor = device.color(1, 0);

    let mode = LightingMode === "Forced Off" ? VS_MODE_OFF : VS_MODE_STATIC;
    
    let packet = new Array(65).fill(0x00);
    packet[0] = 0x02; // Report ID
    packet[1] = mode;
    packet[2] = downwardColor[0];
    packet[3] = downwardColor[1];
    packet[4] = downwardColor[2];
    packet[5] = 0x00;
    packet[6] = 0x0A;
    packet[7] = 0x00;
    packet[8] = mode;
    packet[9] = rearColor[0];
    packet[10] = rearColor[1];
    packet[11] = rearColor[2];
    packet[12] = 0x00;
    packet[13] = 0x0A;
    packet[14] = 0x00;
    packet[15] = 0x01;

    device.send_report(packet, 65);
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}