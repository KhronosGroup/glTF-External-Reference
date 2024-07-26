/**
Copyright 2024 The Khronos Group Inc.
SPDX-License-Identifier: CC-BY-4.0
*/

/**
 * This script creates a VFX effect via texture atlas animation with node.js
 * The input should be a glTF file with sprite mesh and a texture atlas attached to it. It is assumed that the sprite only has one primitive.
 * One needs to the define nodeIDX of the sprite mesh and xSections and ySections based on the texture atlas.
 * animationTime defines the time it takes to go through the whole texture atlas.
 * outputFileName is the name of the output glTF and buffer file. The original image for the atlas stays the same
 */


const fs = require('fs');

const gltfFileName = 'VFXTest.gltf';
const outputFileName = 'VFXTestOut';

const json = JSON.parse(fs.readFileSync(gltfFileName, 'utf8'));
const buffer = fs.readFileSync(json.buffers[0].uri);

const nodeIdx = 0;
const meshIdx = json.nodes[nodeIdx].mesh;

const xSections = 8;
const ySections = 8;

const animationTime = 4.0;

const xFraction = 1/xSections;
const yFraction = 1/ySections;

let currentOffset = buffer.byteLength;

function createBufferView(array, byteOffset) {
    return {
        buffer: 0,
        byteOffset: byteOffset,
        byteLength: array.byteLength
    };
}

function createAccessor(bufferView, array, type = 'VEC2') {
    const divider = type === 'VEC2' ? 2 : 1;
    return {
        bufferView: bufferView,
        componentType: 5126, //FLOAT
        count: array.length / divider,
        type: type,
    };
}

const bufferList = [buffer];

// Primitive Texcoords

const texcoords = new Float32Array([[0.0, 0.0], [0.0, yFraction], [xFraction, 0.0], [xFraction, yFraction]].flat());
bufferList.push(new Uint8Array(texcoords.buffer));

json.bufferViews.push(createBufferView(texcoords, currentOffset));

currentOffset += texcoords.byteLength;

json.accessors.push(createAccessor(json.bufferViews.length - 1, texcoords));

json.meshes[meshIdx].primitives[0].attributes.TEXCOORD_0 = json.accessors.length - 1;

// Primitive targets
// x
const xTargets = new Float32Array([[xFraction, 0.0], [xFraction, 0.0], [xFraction, 0.0], [xFraction, 0.0]].flat());
bufferList.push(new Uint8Array(xTargets.buffer));

json.bufferViews.push(createBufferView(xTargets, currentOffset));

currentOffset += xTargets.byteLength;

json.accessors.push(createAccessor(json.bufferViews.length - 1, xTargets));

if (!json.meshes[meshIdx].primitives[0].targets) {
    json.meshes[meshIdx].primitives[0].targets = [];
} else {
    throw ("No support for already existing targets");
}

if (!json.meshes[meshIdx].weights) {
    json.meshes[meshIdx].weights = [];
}

json.meshes[meshIdx].primitives[0].targets.push({TEXCOORD_0: json.accessors.length - 1});

json.meshes[meshIdx].weights.push(0.0);

//y
const yTargets = new Float32Array([[0.0, yFraction], [0.0, yFraction], [0.0, yFraction], [0.0, yFraction]].flat());
bufferList.push(new Uint8Array(yTargets.buffer));

json.bufferViews.push(createBufferView(yTargets, currentOffset));

currentOffset += yTargets.byteLength;

json.accessors.push(createAccessor(json.bufferViews.length - 1, yTargets));

json.meshes[meshIdx].primitives[0].targets.push({TEXCOORD_0: json.accessors.length - 1});

json.meshes[meshIdx].weights.push(0.0);



// Animation
const animation = {
    channels: [
        {
            sampler: 0,
            target: {
                node: nodeIdx,
                path: 'weights'
            }
        }
    ],
    samplers: [
        {
            input: json.accessors.length,
            interpolation: 'STEP',
            output: json.accessors.length + 1
        }
    ]
};
if (!json.animations) {
    json.animations = [];
}

json.animations.push(animation);

const timeArray = [];

for (let i = 0; i < xSections * ySections; i++)
{
    timeArray.push(i * (animationTime / (xSections * ySections - 1)));
}

const timeBuffer = new Float32Array(timeArray);
bufferList.push(new Uint8Array(timeBuffer.buffer));

json.bufferViews.push(createBufferView(timeBuffer, currentOffset));

currentOffset += timeBuffer.byteLength;

json.accessors.push(createAccessor(json.bufferViews.length - 1, timeBuffer, "SCALAR"));

json.accessors[json.accessors.length -1].min = [0];
json.accessors[json.accessors.length -1].max = [timeArray[timeArray.length - 1]];

const outputArray = [];

for (let y = 0; y < ySections; y++)
{
    for (let x = 0; x < xSections; x++)
    {
        outputArray.push(x);
        outputArray.push(y);
    }
}

const outputBuffer = new Float32Array(outputArray);
bufferList.push(new Uint8Array(outputBuffer.buffer));

json.bufferViews.push(createBufferView(outputBuffer, currentOffset));

currentOffset += outputBuffer.byteLength;

json.accessors.push(createAccessor(json.bufferViews.length - 1, outputBuffer, "SCALAR"));

json.buffers[0].uri = `${outputFileName}.bin`;
json.buffers[0].byteLength = currentOffset;

const newBuffer = Buffer.concat(bufferList);

// Add billboard extension
json.nodes[nodeIdx]["extensions"] = {
    "KHR_billboard": {
        viewDirection: [0, 1, 0],
        up: [0, 0, -1],
    }
};

if (!json.extensionsUsed) {
    json.extensionsUsed = [];
}
json.extensionsUsed.push("KHR_billboard");

fs.writeFileSync(`${outputFileName}.bin`, newBuffer);
fs.writeFileSync(`${outputFileName}.gltf`, JSON.stringify(json));
