/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 manuel-84
 * Source and license: https://github.com/manuel-84/signalrgb-epomaker-th80-v2-pro
 * EPOMAKER TH80 V2 PRO -- stock firmware, 2.4 GHz receiver 0C45:FEFE.
 * Model 35 / firmware 1.09 verified on 2026-10-16.
 * Uses temporary RGB565 music frames (0x35), not custom-profile writes.
 */

export function Name() { return "EPOMAKER TH80 V2 PRO (2.4 GHz)"; }
export function VendorId() { return 0x0C45; }
export function ProductId() { return 0xFEFE; }
export function Publisher() { return "manuel-84"; }
export function Type() { return "hid"; }
export function ImageUrl() { return "https://epomaker.com/cdn/shop/files/EPOMAKERTH80V2PRO_v2_04_2a636c34-da9e-4c4b-8d8c-30b039af4fe8.png?v=1773121903&width=1024"; }
export function DeviceType() { return "keyboard"; }
export function Size() { return [64, 24]; }
export function DefaultPosition() { return [180, 110]; }
export function DefaultScale() { return 5.0; }
export function Validate(endpoint) {
	return endpoint.interface === 3 && endpoint.usage_page === 0xFF60 && endpoint.usage === 0x61;
}

/* global LightingMode:readonly, forcedColor:readonly, frameRate:readonly */
export function ControllableParameters() {
	return [
		{property: "LightingMode", label: "Lighting Mode", type: "combobox", values: ["Canvas", "Forced"], default: "Canvas"},
		{property: "forcedColor", label: "Forced Color", type: "color", min: "0", max: "360", default: "#009bde"},
		{property: "frameRate", label: "Frame Rate", type: "number", min: "1", max: "8", default: "5"}
	];
}

// [firmware LED/matrix ID, displayed name, canvas X, canvas Y].
const keys = [
	[0, "Esc", 0, 0],
	[1, "F1", 7, 0],
	[2, "F2", 11, 0],
	[3, "F3", 15, 0],
	[4, "F4", 19, 0],
	[5, "F5", 24, 0],
	[6, "F6", 28, 0],
	[7, "F7", 32, 0],
	[8, "F8", 36, 0],
	[9, "F9", 41, 0],
	[10, "F10", 45, 0],
	[11, "F11", 49, 0],
	[12, "F12", 53, 0],
	[16, "` ~", 0, 4],
	[17, "1 !", 4, 4],
	[18, "2 @", 8, 4],
	[19, "3 #", 12, 4],
	[20, "4 $", 16, 4],
	[21, "5 %", 20, 4],
	[22, "6 ^", 24, 4],
	[23, "7 &", 28, 4],
	[24, "8 *", 32, 4],
	[25, "9 (", 36, 4],
	[26, "0 )", 40, 4],
	[27, "- _", 44, 4],
	[28, "= +", 48, 4],
	[92, "Back space", 54, 4],
	[104, "Home", 60, 4],
	[32, "Tab", 1, 8],
	[33, "Q", 6, 8],
	[34, "W", 10, 8],
	[35, "E", 14, 8],
	[36, "R", 18, 8],
	[37, "T", 22, 8],
	[38, "Y", 26, 8],
	[39, "U", 30, 8],
	[40, "I", 34, 8],
	[41, "O", 38, 8],
	[42, "P", 42, 8],
	[43, "[ {", 46, 8],
	[44, "] }", 50, 8],
	[60, "Backslash", 55, 8],
	[106, "Del", 60, 8],
	[48, "Caps", 2, 12],
	[49, "A", 7, 12],
	[50, "S", 11, 12],
	[51, "D", 15, 12],
	[52, "F", 19, 12],
	[53, "G", 23, 12],
	[54, "H", 27, 12],
	[55, "J", 31, 12],
	[56, "K", 35, 12],
	[57, "L", 39, 12],
	[58, "; :", 43, 12],
	[59, "Quote", 47, 12],
	[76, "Enter", 54, 12],
	[64, "L-Shift", 3, 16],
	[65, "Z", 9, 16],
	[66, "X", 13, 16],
	[67, "C", 17, 16],
	[68, "V", 21, 16],
	[69, "B", 25, 16],
	[70, "N", 29, 16],
	[71, "M", 33, 16],
	[72, ", <", 37, 16],
	[73, ". >", 41, 16],
	[74, "/ ?", 45, 16],
	[75, "R-Shift", 51, 16],
	[90, "\u2191", 56, 16],
	[80, "L-Ctrl", 1, 20],
	[81, "L-Win", 6, 20],
	[82, "L-Alt", 11, 20],
	[83, "Space", 26, 20],
	[84, "R-Alt", 41, 20],
	[85, "Fn", 46, 20],
	[88, "\u2190", 52, 20],
	[89, "\u2193", 56, 20],
	[91, "\u2192", 60, 20]
];
const auxiliaryIds = [97, 98, 103];
// 0x35 omits matrix IDs: colors must follow firmware's compact order.
// Slot 13 belongs to matrix ID 103 (the top-right auxiliary/knob position).
// Verified against unique-color readback for every one of the 78 mapped keys.
const wirelessOrder = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 103,
	16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 92, 104,
	32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 60, 106,
	48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 76,
	64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 90,
	80, 81, 82, 83, 84, 85, 88, 89, 91
];
export function LedNames() { return keys.map(key => key[1]); }
export function LedPositions() { return keys.map(key => [key[2], key[3]]); }

let originalEffect = null;
let ready = false;
let rejected = false;
let lastFrame = 0;
let failures = 0;
let nextProbe = 0;
let retryDelay = 3000;
let lastIdentityCheck = 0;
let completedFrames = 0;
let announceMode = -1;

export function Initialize() {
	diagnostic("Initialize wireless recovery v1.2; retry interval 3 seconds");
	originalEffect = null;
	ready = false;
	rejected = false;
	lastFrame = 0;
	failures = 0;
	nextProbe = 0;
	retryDelay = 3000;
	lastIdentityCheck = 0;
	completedFrames = 0;
	connectKeyboard();
}

function verifyIdentity() {
	const info = transfer(0x10, 56);
	const vendor = info[4] | (info[5] << 8);
	const product = info[6] | (info[7] << 8);
	const model = info[14] | (info[15] << 8);

	if (vendor !== 0x0C45 || product !== 0x800B || model !== 35) {
		rejected = true;
		throw new Error("Receiver identity mismatch; expected TH80 V2 PRO model 35 in 2.4 GHz mode.");
	}

	if (announceMode !== info[16]) { diagnostic("Receiver workMode=" + info[16]); announceMode = info[16]; }

	if (info[16] !== 2) {throw new Error("Keyboard is not in 2.4 GHz mode.");}
}

function connectKeyboard(announce = true) {
	try {
		drainResponses();
		verifyIdentity();

		// Keep the pre-stream effect across sleep/recovery; do not save music mode.
		if (!originalEffect) {originalEffect = transfer(0x13, 16);}

		ready = true;
		failures = 0;
		retryDelay = 3000;
		lastIdentityCheck = Date.now();

		if (announce) {diagnostic("TH80 V2 PRO 2.4 GHz: ready; 78 keys, RGB565, default 5 FPS.");}
	} catch (error) {
		ready = false;
		nextProbe = Date.now() + retryDelay;
		// A connected receiver can outlive USB/Bluetooth mode for hours.
		// Cap probes at 3 seconds so switching to it does not wait 30 seconds.
		retryDelay = Math.min(3000, retryDelay * 2);
		diagnostic("TH80 V2 PRO 2.4 GHz: waiting for keyboard: " + error.message);
	}
}

export function Render() {
	if (rejected) {return;}
	const now = Date.now();

	if (!ready) {
		if (now >= nextProbe) {connectKeyboard();}

		return;
	}

	// Receiver ACKs alone do not prove that the keyboard is still online.
	if (now - lastIdentityCheck >= 5000) {
		ready = false;
		connectKeyboard(false);

		if (!ready) {return;}
	}

	const fps = Math.max(1, Math.min(8, Number(frameRate) || 5));

	if (now - lastFrame < 1000 / fps) {return;}

	lastFrame = now;

	try {
		sendMusicFrame(buildFrame());
		failures = 0;
		completedFrames++;

		if (completedFrames % 1200 === 0) {diagnostic("RGB progress; acknowledged frames=" + completedFrames);}

		if (completedFrames === 1) {diagnostic("TH80 V2 PRO 2.4 GHz: first RGB565 frame acknowledged.");}
	} catch (error) {
		failures++;
		drainResponses();

		if (failures >= 3) {
			ready = false;
			nextProbe = Date.now() + 3000;
			retryDelay = 3000;
			diagnostic("TH80 V2 PRO 2.4 GHz: streaming paused; checking for wake/reconnection in 3 seconds.");
		}
	}
}

export function Shutdown() {
	diagnostic("Shutdown requested; frames=" + completedFrames + "; failures=" + failures);
	ready = false;

	if (!originalEffect || rejected) {return;}

	try {
		drainResponses();
		// A generic receiver may have been paired with another keyboard meanwhile.
		verifyIdentity();
		transfer(0x23, 16, originalEffect);
		originalEffect = null;
		diagnostic("TH80 V2 PRO 2.4 GHz: original hardware lighting restored.");
	} catch (error) {
		diagnostic("TH80 V2 PRO 2.4 GHz: could not restore lighting: " + error.message);
	}
}

function buildFrame() {
	const data = new Array(512).fill(0);

	for (let id = 0; id < 128; id++) {data[id * 4] = id;}
	const forced = LightingMode === "Forced" ? hexToRgb(forcedColor) : null;
	const total = [0, 0, 0];

	for (const key of keys) {
		const color = forced || device.color(key[2], key[3]);

		for (let channel = 0; channel < 3; channel++) {
			const value = Math.max(0, Math.min(255, Math.round(Number(color[channel]) || 0)));
			data[key[0] * 4 + 1 + channel] = value;
			total[channel] += value;
		}
	}

	// These three LEDs respond, but their physical positions are unverified.
	// Give them the average keyboard color instead of inventing key positions.
	for (const id of auxiliaryIds) {
		for (let channel = 0; channel < 3; channel++) {
			data[id * 4 + 1 + channel] = Math.round(total[channel] / keys.length);
		}
	}

	return data;
}

function hexToRgb(hex) {
	const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex));

	return match ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)] : [0, 0, 0];
}

function sendMusicFrame(frame) {
	const colors = new Array(wirelessOrder.length * 2).fill(0);

	for (let slot = 0; slot < wirelessOrder.length; slot++) {
		const offset = wirelessOrder[slot] * 4;
		const rgb565 = ((frame[offset + 1] & 248) << 8) | ((frame[offset + 2] & 252) << 3) | ((frame[offset + 3] & 248) >> 3);
		colors[slot * 2] = rgb565 >> 8;
		colors[slot * 2 + 1] = rgb565 & 255;
	}

	// Six 32-byte reports: four-byte header and 28 RGB565 bytes, last zero-padded.
	for (let index = 0; index < Math.ceil(colors.length / 28); index++) {
		const packet = new Array(33).fill(0);
		packet[1] = 0xAA;
		packet[2] = 0x35;
		packet[3] = index;

		for (let byte = 0; byte < 28; byte++) {packet[5 + byte] = colors[index * 28 + byte] || 0;}

		device.write(packet, 33);
		waitForResponse(0x35, index, 4);
	}
}

function transfer(command, size, data) {
	const result = [];

	for (let address = 0; address < size; address += 24) {
		const count = Math.min(24, size - address);
		const packet = new Array(33).fill(0);
		packet[1] = 0xAA;
		packet[2] = command;
		packet[3] = count;
		packet[4] = address & 255;
		packet[5] = (address >> 8) & 255;
		packet[7] = address + count === size ? 1 : 0;

		if (data) {
			for (let byte = 0; byte < count; byte++) {packet[9 + byte] = data[address + byte];}
		}

		device.write(packet, 33);

		const reply = waitForResponse(command, address, 8 + count);

		for (let byte = 0; byte < count; byte++) {result.push(reply[8 + byte]);}
	}

	return result;
}

function waitForResponse(command, address, minimumSize) {
	for (let attempt = 0; attempt < 4; attempt++) {
		// Windows includes the zero report ID: reserve 33 bytes for 32 data bytes.
		const input = device.read([], 33, 30);
		const length = device.getLastReadSize();
		const prefix = input[0] === 0 && input[1] === 0x55 ? 1 : 0;

		const reply = prefix ? input.slice(1) : input;

		if (Math.min(length - prefix, reply.length) < minimumSize) {continue;}

		const matchingAddress = command === 0x35 ? reply[2] === address : (reply[3] | (reply[4] << 8)) === address;

		if (reply[0] === 0x55 && reply[1] === command && matchingAddress) {return reply;}
	}

	throw new Error("No matching receiver reply for 0x" + command.toString(16) + " at " + address);
}

function drainResponses() {
	for (let attempt = 0; attempt < 20; attempt++) {
		device.read([], 33, 0);

		if (device.getLastReadSize() === 0) {break;}
	}
}

function diagnostic(message) {
	const line = "TH80-DIAG-2G " + Date.now() + " " + message;

	if (typeof device.log === "function") {device.log(line, {toFile: true});} else {console.log(line);}
}
