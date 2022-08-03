<!--
Copyright 2022 The Khronos Group Inc.
SPDX-License-Identifier: CC-BY-4.0
-->

# glTF Experience Format 2.0

## Contributors

- Dwight Rodgers, Adobe
- Raanan Weber, Microsoft
- Michael Bond, Adobe
- Erwan Maigret, Adobe
- Daniel Plemmons, Adobe
- Sean Lilley, Cesium
- Michael Beale, Autodesk
- Gary Hsu, Microsoft
- Rickard Sahlin, IKEA

## Status

Draft

## Dependencies

Written against the glTF 2.0 spec.

## Overview

This specification allows for the creation of files in the glTF ecosystem that compose a scene from multiple glTF 2.0 assets.

## Design Goals

_This section is non-normative._

The goal of this proposal is to create a new file type in the glTF ecosystem that can both solve the needs of composition of scenes from multiple assets, and also serve as a place for additional capabilities such as interaction, augmented reality anchoring, etc., to reside without adding unnecessary complexity to the glTF 2.0 format itself.

## glTF Experience Format (glXF) and Relationship to glTF

The glTF Experience Format (glXF) specification defines a new JSON format that contains references to glTF 2.0 assets, a node hierarchy, and optional extensions for interactivity, augmented reality anchoring, or other capabilities.

A glXF file is essentially a glTF file that does not specify any geometry, animations, textures, etc. directly, but rather incorporates them by reference to other glTF files. glXF files may incorporate other glXF files by reference, forming an acyclic graph of incorporation, but all geometry comes, in the end, from glTFs as the leaf nodes of that graph.

## glXF Basics

A glXF file SHOULD use `.glxf` extension and `model/glxf+json` Media Type (after it is registered with IANA).

JSON Encoding, URIs, Indices and Naming, and Coordinate System and Units conventions of glTF apply to glXF (sections 2.7, 2.8, 3.3 and 3.4 of the glTF 2.0 specification respectively).

A glXF file MUST contain an `asset` property, as defined in the section 3.2 of the glTF specification. glXF defines one additional optional boolean property on the asset object, called `experience`, set to `false` by default.

The `experience` property set to `true` indicates that this file is intended to be directly viewed as an experience and MUST NOT be imported into other scenes.

Since glXF is built off the glTF 2.0 specification, the initial glXF version is "2.0".

```json
{
    "asset": {
        "version": "2.0",
        "experience": true
    }
}
```

### Importing Assets

A glXF file MAY contain an `assets` (plural) property. An `assets` property is an array of objects. Each object represents a reference to another glTF or glXF file that is incorporated.

Each entry in the `assets` array MUST contain either a `uri` property which is a URI or IRI to an external file.

```json
{
    "asset": {
        "version": "2.0",
        "experience": true
    },
    "assets": [
        {
            "uri": "imported_asset.gltf"
        }
    ]
}
```

To import only a portion of the specified glTF or glXF, each entry in the `assets` array MAY contain either a `scene` property or a `nodes` property.

If a `scene` property is specified, it MUST be the _export name_ of a scene within the referenced glTF or glXF. If a `nodes` property is specified, it MUST be an array of _export names_ of nodes within the referenced glTF or glXF. Both properties MUST NOT be specified at the same time.

Here _export name_ of a scene means a string that uniquely matches the `name` property of one `scene` in the imported glTF or glXF. Likewise, the _export name_ of a node means a string that uniquely matches the `name` property of exactly one `node` in the glTF or glXF. Further extensions may add additional ways to define _export names_ for assets that are published without unique `name` properties.

If neither a `scene` nor a `nodes` property is present, then the entry refers to all `scenes` of the glTF or glXF, if present. Amongst these scenes, the one that should be selected by default is defined by the imported asset's `scene` property. If the `scene` property is not defined there, the first scene shall be the default. If no `scenes` are present in the imported asset, the entry refers to all nodes of the imported asset.

```json
{
    "asset": {
        "version": "2.0",
        "experience": true
    },
    "assets": [
        {
            "uri": "multi_scene_asset.gltf",
            "scene": "my_scene"
        },
        {
            "uri": "multi_node_asset.gltf",
            "nodes": [ "node_a", "node_b" ]
        }
    ]
}
```

If a `nodes` property is specified, a `transform` property may also be specified, which may be one of `none`, `local`, or `global`. This property defines what initial transform the nodes use in their instantiation in the glXF. When undefined, the value `global` MUST be used.

- The value `none` indicates that all nodes' transforms (including own) from the imported asset are ignored.
- The value `local` indicates that only the nodes' own transforms (defined by TRS or `matrix` properties) are used in their instantiation in the glXF.
- The value `global` indicates that the nodes use their global transforms from the imported asset as their local transforms in the glXF.

```json
{
    "asset": {
        "version": "2.0",
        "experience": true
    },
    "assets": [
        {
            "name": "imported_node_without_any_transforms",
            "uri": "asset.gltf",
            "nodes": [ "my_node" ],
            "transform": "none"
        }
    ]
}
```

To be presented in a glXF scene, the imported assets MUST be instantiated via glXF nodes as described below.

### Scenes and Nodes

A glXF file MAY contain `nodes`, `scenes`, and `scene` properties as defined in the section 3.5 of the glTF 2.0 specifications, with the following exceptions: node objects MUST NOT contain `mesh`, `skin`, or `weights` properties.

Each glXF node MAY contain an `asset` property, or a `children` property, but not both. An `asset` property in the context of a glXF `node` is an index into the glXF `assets` array and represents the instantiation of one instance of the given asset below the given node of the scene graph. For example:

```json
{
    "asset": {
        "version": "2.0",
        "experience": true
    },
    "assets": [
        {
            "uri": "a.gltf",
        },
        {
            "uri": "b.gltf",
            "nodes": [ "exported-node-1", "exported-node-2" ]
        }
    ],
    "nodes": [
        {
            "name": "experience_root",
            "children": [ 1, 2 ]
        },
        {
            "asset": 0
        },
        {
            "asset": 1
        }
    ]
}
```

In this example, a scene is constructed with a root node `0`. Root node has two children: nodes `1` and `2`. Node `1` instantiates `a.gltf` under it, and therefore follows the transformation matrix as though all of its imported nodes had glXF node `0` as their direct parent. Node `2` has an instantiation of two nodes from `b.gltf` under it, specifically the two nodes exported as `"exported-node-1"` and `"exported-node-2"` from `b.gltf`. These two nodes are transformed as though their parent was the glXF node `2`.

## Extensions to glXF files

A glXF file may contain extensions as defined in 3.12 of the glTF 2.0 specification.

Extensions are understood to apply only to glTF files unless explicitly specified in documentation as applying only to glXF or to both glTF and glXF.

## Limitations of a glXF file

A glXF file MUST NOT contain `buffers`, `bufferViews`, `accessors`, `meshes`, `skins`, `textures`, `images`, `samplers`, `materials`, nor `animations`.

Cycles are not allowed in the asset incorporations.

## Example

_This section is non-normative._

By way of illustration, imagine an experience that comprises a soccer player, a soccer ball, and an interactive behavior that moves the ball to a specified location when the ball is tapped. The `assets` list for this experience will comprise three assets, with indices 0 and 1, which reference the soccer player model (including its animations) and the ball model respectively.

The `nodes` list will contain a node hierarchy in which the soccer player is instantiated under node 1 and the ball under node 2. Nodes 0, 3 and 4 in the example below are nulls with no geometry that can be used, for example, by the behavior and/or interactivity extension.

```json
{
    "asset": {
        "version": 2.0,
        "experience": true
    },
    "assets": [
        {
            "name": "Soccer Player",
            "uri": "soccer_player.gltf",
            "scene": "player"
        },
        {
            "name": "Ball",
            "uri": "ball.gltf",
            "nodes": [ "ball" ],
            "transform": "none"
        }
    ],
    "nodes": [
        {
            "name": "Root Node",
            "children": [ 1, 2 ]
        },
        {
            "name": "Soccer Player Node",
            "asset": 0,
            "translation": [ 0, 0, 0 ]
        },
        {
            "name": "Soccer Ball Node",
            "asset": 1,
            "translation": [ -10, 0, 35 ]
        },
        {
            "name": "Ball Destination Node",
            "translation": [ 51, 0, 80 ]
        },
        {
            "name": "Ball Origin Node",
            "translation": [ -10, 0, 35 ]
        }
    ]
}
```
