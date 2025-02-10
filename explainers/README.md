<!--
Copyright 2022 The Khronos Group Inc.
SPDX-License-Identifier: CC-BY-4.0
-->

<p align="center">
<img src="../specification/figures/glTF.svg" width="340" height="170" />
</p>

[![Join the forums](https://img.shields.io/badge/discuss-in%20forums-blue.svg)](https://community.khronos.org/c/gltf-general)

glTF External Reference Format is the specification for a new file structure in the glTF ecosystem for efficient composition of multiple glTF assets.

The explainers in this section discuss many aspects of the capability. The work was done as prototypes to identify and investigate potential solutions to some of the known problems with complex scenes. It was developed prior to a written specification and may not reflect the solution choosen by the specification developers. 

For the purpose of the prototype examples the file extension _.gltfx_ was used. This is not a requirement on any future specification nor commitment to use this designation or format.

Note: These documents are not the specification.

## Explainers

* [Lighting](lighting.md) - Describes several use cases of multiple light sources and how they may impact additional objects in the scene.

* [Level of Detail](level-of-detail.md) - Describes situations where a model must change because more or less detail is needed. Several different measures for determining transition points are discussed

* [Billboard](billboard.md) - Describes a draft glTF extension which instructs a node to align itself with the current camera.

* [Scene arrangement demo](scene-arrangement.md) - Describes a demo which enables the user to pick assets of a glTFX and move them onto other assets via snapping and re-parenting
