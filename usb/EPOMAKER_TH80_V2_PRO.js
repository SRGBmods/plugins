/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 manuel-84
 * Source and license: https://github.com/manuel-84/signalrgb-epomaker-th80-v2-pro
 * EPOMAKER TH80 V2 PRO -- USB, stock Huafenda firmware.
 * Independently implemented from the browser driver's observable protocol:
 * https://epomaker.driveall.cn/custom-keys
 * Verified on 0C45:800B, product 35, firmware 1.09 (2026-10-16).
 * RGB frames use volatile command 0x32, never custom-profile/flash command 0x24.
 * Only lighting is accessed. Keymaps, macros, TFT and firmware are untouched.
 */

export function Name() { return "EPOMAKER TH80 V2 PRO"; }
export function VendorId() { return 0x0C45; }
export function ProductId() { return 0x800B; }
export function Publisher() { return "manuel-84"; }
export function Type() { return "hid"; }
export function ImageUrl() { return "https://epomaker.com/cdn/shop/files/EPOMAKERTH80V2PRO_v2_04_2a636c34-da9e-4c4b-8d8c-30b039af4fe8.png?v=1773121903&width=1024"; }
export function DeviceType() { return "keyboard"; }
export function Size() { return [64, 24]; }
export function DefaultPosition() { return [180, 110]; }
export function DefaultScale() { return 5.0; }
export function Validate(endpoint) {
	return endpoint.interface === 2 && endpoint.usage_page === 0xFF68 && endpoint.usage === 0x61;
}

/* global LightingMode:readonly, forcedColor:readonly, frameRate:readonly */
export function ControllableParameters() {
	return [
		{property: "LightingMode", label: "Lighting Mode", type: "combobox", values: ["Canvas", "Forced"], default: "Canvas"},
		{property: "forcedColor", label: "Forced Color", type: "color", min: "0", max: "360", default: "#009bde"},
		{property: "frameRate", label: "Frame Rate", type: "number", min: "5", max: "30", default: "20"}
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
export function LedNames() { return keys.map(key => key[1]); }
export function LedPositions() { return keys.map(key => [key[2], key[3]]); }

let originalEffect = null;
let ready = false;
let rejected = false;
let lastFrame = 0;
let failures = 0;
let completedFrames = 0;
let nextProbe = 0;
let retryDelay = 1000;
let lastIdentityCheck = 0;

export function Initialize() {
	originalEffect = null;
	ready = false;
	rejected = false;
	lastFrame = 0;
	failures = 0;
	completedFrames = 0;
	nextProbe = 0;
	retryDelay = 1000;
	lastIdentityCheck = 0;
	diagnostic("Initialize USB recovery v1.2");
	connectKeyboard();
}

function verifyIdentity() {
	const info = transfer(0x10, 56);
	const vendor = info[4] | (info[5] << 8);
	const product = info[6] | (info[7] << 8);
	const model = info[14] | (info[15] << 8);

	if (vendor !== 0x0C45 || product !== 0x800B || model !== 35) {
		rejected = true;
		throw new Error("Device identity mismatch; USB lighting refused (model " + model + ").");
	}

	if (info[16] !== 0) {throw new Error("Keyboard is not in USB mode (" + info[16] + ").");}
}

function connectKeyboard(announce = true) {
	try {
		drainResponses();
		verifyIdentity();

		// Preserve the user's original effect across temporary failures.
		if (!originalEffect) {originalEffect = transfer(0x13, 16);}

		ready = true;
		failures = 0;
		retryDelay = 1000;
		lastIdentityCheck = Date.now();

		if (announce) {diagnostic("USB ready; hardware identity and USB mode verified.");}
	} catch (error) {
		ready = false;
		nextProbe = Date.now() + retryDelay;
		retryDelay = Math.min(30000, retryDelay * 2);
		diagnostic("USB waiting: " + error.message);
	}
}

export function Render() {
	if (rejected) {return;}
	const now = Date.now();

	if (!ready) {
		if (now >= nextProbe) {connectKeyboard();}

		return;
	}

	if (now - lastIdentityCheck >= 5000) {
		connectKeyboard(false);

		if (!ready) {return;}
	}
	const fps = Math.max(5, Math.min(30, Number(frameRate) || 20));

	if (now - lastFrame < 1000 / fps) {return;}

	lastFrame = now;

	sendFrame();
}

function sendFrame() {
	try {
		transfer(0x32, 512, buildFrame());

		if (failures) {diagnostic("USB frame resumed after " + failures + " failed frame(s).");}

		failures = 0;
		completedFrames++;

		if (completedFrames === 1 || completedFrames % 1200 === 0) {diagnostic("USB acknowledged frames=" + completedFrames);}
	} catch (error) {
		failures++;

		if (failures === 1) {diagnostic("USB RGB transfer failed: " + error.message);}

		drainResponses();

		if (failures >= 3) {
			ready = false;
			nextProbe = Date.now() + 1000;
			retryDelay = 1000;
			// Do not restore native lighting during a transient transport failure.
			diagnostic("USB streaming paused; recovery in 1 second.");
		}
	}
}

export function Shutdown() {
	ready = false;
	diagnostic("Shutdown requested; frames=" + completedFrames + "; failures=" + failures);

	if (!originalEffect || rejected) {return;}

	try {
		drainResponses();
		// Do not affect the other transport after a connection-mode change.
		verifyIdentity();
		transfer(0x23, 16, originalEffect);
		originalEffect = null;
		diagnostic("Original hardware lighting restored on USB shutdown.");
	} catch (error) {
		diagnostic("USB restore skipped/failed: " + error.message);
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

function transfer(command, size, data) {
	const result = [];

	for (let address = 0; address < size; address += 56) {
		const count = Math.min(56, size - address);
		// Leading 0 is the HID report ID; actual report data is 64 bytes.
		const packet = new Array(65).fill(0);
		packet[1] = 0xAA;
		packet[2] = command;
		packet[3] = count;
		packet[4] = address & 255;
		packet[5] = (address >> 8) & 255;
		packet[7] = address + count === size ? 1 : 0;

		if (data) {
			for (let index = 0; index < count; index++) {packet[9 + index] = data[address + index];}
		}

		device.write(packet, 65);

		const reply = waitForResponse(command, address, data ? 8 : 8 + count);

		for (let index = 0; index < count; index++) {result.push(reply[8 + index]);}
	}

	return result;
}

function waitForResponse(command, address, minimumSize) {
	let received = 0;
	let header = [];

	for (let attempt = 0; attempt < 4; attempt++) {
		// Reserve the report-ID byte on Windows, as on the receiver transport.
		const input = device.read([], 65, 30);
		const length = device.getLastReadSize();
		const prefix = input[0] === 0 && input[1] === 0x55 ? 1 : 0;
		const reply = prefix ? input.slice(1) : input;

		if (length > 0) {
			received = length;
			header = reply.slice(0, 8);
		}

		if (Math.min(length - prefix, reply.length) < minimumSize) {continue;}

		if (reply[0] === 0x55 && reply[1] === command && (reply[3] | (reply[4] << 8)) === address) {return reply;}
	}

	throw new Error("No matching reply for 0x" + command.toString(16) + " at " + address + "; last bytes=" + received + "; header=" + JSON.stringify(header));
}

function drainResponses() {
	for (let attempt = 0; attempt < 20; attempt++) {
		device.read([], 65, 0);

		if (device.getLastReadSize() === 0) {break;}
	}
}

function diagnostic(message) {
	const line = "TH80-DIAG-USB " + Date.now() + " " + message;

	if (typeof device.log === "function") {device.log(line, {toFile: true});} else {console.log(line);}
}
