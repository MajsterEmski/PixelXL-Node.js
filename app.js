#!/usr/bin/env node

import { table } from 'table';
import * as readline from 'node:readline/promises';

var simTiles = [];
var simDimensions = [14, 28];
var simRefresh = 500;
var simUpdated = false;

var animPattern = [];
var pointsSeg1 = [], pointsSeg2 = [], pointsSeg3 = [], pointsSeg4 = [], pointsSeg5 = [], pointsSeg6 = [], pointsSeg7 = [], pointsSeg8 = [];
var animIndex = 0;
var animActive = false;
var animOrigin = [];
var animRadius = 0;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, });

initMap(simDimensions[0], simDimensions[1], simRefresh);

do {
	// CLI - possible commands:
	// "switch on/off x,y" switch on/off individual tiles at given coordinates (e.g. "switch on 0,1" turn on tile at x=0, y=1)
	// "init" set up the table, start the refresh loop, and calculate the circular path to be animated (in case, currently the app does it automatically)
	// "anim" toggles animation (it starts, and then pauses/unpauses)
	// "clear" resets all tiles' value to 0
	// "quit" closes the CLI and app
	var command = await rl.question("");
	command = command.trim();
	let words = command.split(" ");
	if (words[0] === "switch" && words.length === 3) {
		let coords = parseCoords(words[2]);
		let val = words[1] === "on" ? 1 : words[1] === "off" ? 0 : null;
		switchTileVal(coords[0], coords[1], val);
	} 
	else if (command === "init") initMap(simDimensions[0], simDimensions[1], simRefresh); 
	else if (command === "anim") animActive = !animActive;
	else if (command === "clear") clearMap(); 
	else if (command === "quit") break;
	else console.log("Please enter a correct command! ('switch on/off x,y', 'anim', 'init', or 'quit')");
} while (true);

rl.close();
process.exit();

function initMap(x, y, ms) {
	// first, create a table of given width-length
	for (let i = 0; i < y; i++) {
		simTiles[i] = [];
		for (let j = 0; j < x; j++) {
			simTiles[i][j] = 0;
		}
	}
	// set up the animation by calculating the circular path at given origin & radius
	initAnimation(7, 14, 3);

	// this bool could probably be replaced with an events system if this were to be expanded
	simUpdated = true;
	setInterval(refreshLoop, ms);
}

function clearMap() {
	for (let i = 0; i < simDimensions[0]; i++) {
		for (let j = 0; j < simDimensions[1]; j++) {
			switchTileVal(i, j, 0);
		}
	}
}

function refreshLoop() {
	if (animActive) progressAnimation();
	if (!simUpdated) return;
	simUpdated = false;
	let line = rl.line;
	process.stdout.write('\u001Bc\u001B[3J');
	process.stdout.write(table(simTiles));
	process.stdout.write(line);
}

function parseCoords(s) {
	let arr = s.split(",");
	return arr;
}

function switchTileVal(x, y, v) {
	let allowedVals = [0, 1];
	if ((x < 0 || x >= simDimensions[0]) || (y < 0 || y >= simDimensions[1]) || !allowedVals.includes(v)) {
		console.log("Please input a correct value!")
		return;
	}
	if (simTiles[simDimensions[1] - 1 - y][x] !== v) {
		simUpdated = true;
		simTiles[simDimensions[1] - 1 - y][x] = v;
	}
}

function initAnimation(originX, originY, r) {
	animOrigin = [originX, originY];
	animRadius = r;

	// Bresenham's algo to calculate the path (so the code could be usable for any starting point & radius)
	let currX = 0;
	let currY = r;
	let d = 3 - 2 * r;
	populateCirclePath(originX, originY, currX, currY);
	while (currY >= currX) {
		if (d > 0) {
			currY--;
			d = d + 4 * (currX - currY) + 10;
		}
		else d = d + 4 * currX + 6

		currX++
		populateCirclePath(originX, originY, currX, currY);
	}
	// populates the path with sorted point segments
	animPattern = animPattern.concat(pointsSeg1, pointsSeg2.reverse(), pointsSeg3, pointsSeg4.reverse(), pointsSeg5, pointsSeg6.reverse(), pointsSeg7, pointsSeg8.reverse());
	// starts the animation at a random point along the path
	animIndex = Math.floor(Math.random() * (animPattern.length-1))
}

function populateCirclePath(originX, originY, currX, currY) {
	// divides points into eight segments (two per quadrant), without duplicates,
	// that are then ordered into one 2D array representing the sequence
	// also, binds movement to spaces physically present on the map (by calling limitToMap())
	let sumXX = limitToMap(originX + currX, 0), sumYY = limitToMap(originY + currY, 1);
	let sumXY = limitToMap(originX + currY, 0), sumYX = limitToMap(originY + currX, 1);
	let subYY = limitToMap(originY - currY, 0), subYX = limitToMap(originY - currX, 1);
	let subXX = limitToMap(originX - currX, 0), subXY = limitToMap(originX - currY, 1);
	if (!pointsSeg2.some(e => (e[0] === sumXX) && (e[1] === sumYY)))
		pointsSeg1.push([sumXX, sumYY]);
	if (!pointsSeg1.some(e => (e[0] === sumXY) && (e[1] === sumYX)) && !pointsSeg3.some(e => (e[0] === sumXY) && (e[1] === sumYX)))
		pointsSeg2.push([sumXY, sumYX]);
	if (!pointsSeg2.some(e => (e[0] === sumXY) && (e[1] === subYX)) && !pointsSeg4.some(e => (e[0] === sumXY) && (e[1] === subYX)))
		pointsSeg3.push([sumXY, subYX]);
	if (!pointsSeg3.some(e => (e[0] === sumXX) && (e[1] === subYY)) && !pointsSeg5.some(e => (e[0] === sumXX) && (e[1] === subYY)))
		pointsSeg4.push([sumXX, subYY]);
	if (!pointsSeg6.some(e => (e[0] === subXX) && (e[1] === subYY)) && !pointsSeg4.some(e => (e[0] === subXX) && (e[1] === subYY)))
		pointsSeg5.push([subXX, subYY]);
	if (!pointsSeg5.some(e => (e[0] === subXY) && (e[1] === subYX)) && !pointsSeg7.some(e => (e[0] === subXY) && (e[1] === subYX)))
		pointsSeg6.push([subXY, subYX]);
	if (!pointsSeg6.some(e => (e[0] === subXY) && (e[1] === sumYX)) && !pointsSeg8.some(e => (e[0] === subXY) && (e[1] === sumYX)))
		pointsSeg7.push([subXY, sumYX]);
	if (!pointsSeg7.some(e => (e[0] === subXX) && (e[1] === sumYY)) && !pointsSeg1.some(e => (e[0] === subXX) && (e[1] === sumYY)))
		pointsSeg8.push([subXX, sumYY]);
}

function limitToMap(n, d) {
	return Math.max(Math.min(n, simDimensions[d] - 1), 0);
}

function progressAnimation() {
	// progresses animation by one tick, to be called by the main update loop
	let indexLast = animIndex > 0 ? animIndex - 1 : animPattern.length - 1;
	let coordsPrev = animPattern[indexLast];
	let coordsTarget = animPattern[animIndex];
	switchTileVal(coordsPrev[0], coordsPrev[1], 0);
	switchTileVal(coordsTarget[0], coordsTarget[1], 1);
	animIndex = animIndex < animPattern.length - 1 ? animIndex + 1 : 0;
}