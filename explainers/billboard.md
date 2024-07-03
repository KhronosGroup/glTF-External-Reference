# Billboard

## Needs

There are multiple reasons why one would want to have mesh always look at the current camera:
* Making text labels always readable
* Displaying foliage, trees, clouds with 2D sprites
* Animated visual effects, particles, fading
* Low level of detail sprite in the distance

## Investigation

Most CGI tools and game engines already support billboards. The first approach should integrate billboards into glTFX, but during our investigations it became clear, that a glTF extension which can be attached to a glTF node made more sense and can therefore be used in both glTFX and glTF.

The scope of the extension needed to be defined. It was decided that this extension only focuses on the transformation of nodes and does not care about the mesh data. In the future a separate extension could be defined for e.g. creating 2D sprites out of text. 

OpenUSD is also working on a billboard specification, which can also anchor sprites in screen space and therefore enables the creation of user interfaces. If similar functionality is desired in glTF, we propose to create a separate anchoring extension, since a lot more corner cases, such as different cameras, aspect ratios, screen sizes, overlapping need to be considered.

## Draft Spec
The following is the extension object which can be defined as an extension for a glTF node. All displayed values are the default ones and are optional.
```JSON
"KHR_billboard" : {
    "keepSize" : false,
    "viewDirection": [0, 0, 1],
    "up": [0, 1, 0],
    "rotationAxis": "None",
    "overlay": false
}
```

| Property | Default | Description |
| -------- | ------- | ----------- |
| `keepSize` | `false` |Defines if the billboard should scale on distance change or not. The initial distance between camera and node is used as reference. |
| `viewDirection` | `[0,0,1]` | Can be used to change the facing direction of a node (default defined by glTF spec: +Z)
| `up` | `[0,1,0]` | Needs to be defined if `viewDirection` is parallel to the default `up` vector. `up` and `viewDirection` do not need to be perpendicular (this can be computed by the implementation)
| `rotationAxis` | `"None"` | Can be used to limit the billboard rotation to an axis. By default it is rotated around all axes. Possible values: `"None"`, `"X"`, `"Y"`, `"Z"` 
| `overlay` | `false` | Defines if the billboard should be renderer in front of all other meshes and therefore never occluded. If two billboards with this property set to `true` overlap, their original node translation should be considered for ordering.
