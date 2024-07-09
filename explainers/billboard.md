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
    "scaleWithDistance" : false,
    "viewDirection": [0, 0, 1],
    "up": [0, 1, 0],
    "rotationAxis": "None",
    "overlay": false
}
```

| Property | Default | Description |
| -------- | ------- | ----------- |
| `scaleWithDistance` | `false` |Defines if the billboard should scale on distance change or not. The initial distance between camera and node is used as reference. |
| `viewDirection` | `[0,0,1]` | Can be used to change the facing direction of a node (default defined by glTF spec: +Z)
| `up` | `[0,1,0]` | Needs to be defined if `viewDirection` is parallel to the default `up` vector. `up` and `viewDirection` do not need to be perpendicular (this can be computed by the implementation)
| `rotationAxis` | `"None"` | Can be used to limit the billboard rotation to an axis. By default it is rotated around all axes. Possible values: `"None"`, `"X"`, `"Y"`, `"Z"` 
| `overlay` | `false` | Defines if the billboard should be renderer in front of all other meshes and therefore never occluded. If two billboards with this property set to `true` overlap, their original node translation should be considered for ordering.



## Implementation notes
This section describes a sample implementation.\
All vectors should be normalized between operations if not mentioned otherwise. 

If `viewDirection` and `up` are not orthogonal one can fix it by calculating the cross product between them to get the right vector and doing another cross product with this right vector and `viewDirection` to get the corrected `up` vector.

$up = (forward \times up) \times forward$

To start with calculating the correct model rotation, extract the world translation from the target node. To compute the new model forward vector subtract the world translation from the camera translation. For implementing the `rotationAxis` set the specific axis of the calculated camera position to zero.

Now we can compute the rotation $r_1$ between the current model forward vector and the new model forward vector. Most math libraries have an inbuilt function for this. This rotation should also be applied to the `up` vector.

Now we need to calculate the correct rotation for the up vector of the model. Coincidentally, this can be deferred from the up vector of the camera:

Fist, calculate the cross product of the camera right vector and the negated new model forward vector to get the new up vector. Now, compute the rotation $r_2$ between the the previously rotated `up` vector and the new up vector.

To get the model local rotation, both rotations need to be multiplied.

$model_{rotation} = r_1 * r_2$

Therefore, the rotation consists of the $r_1$ which rotates the model to look at the camera and $r_2$ which makes sure that camera up and model up vector are aligned.

To compose the model matrix, one first adds the model scale. If `scaleWithDistance` is `true`, a scaling factor needs to be applied based on the initial distance between the camera and the model.

$scaleFactor = \frac{(worldTranslation_{model} * viewMatrix).z}{(worldTranslation_{model} * initialViewMatrix).z}$

Now we can apply the $model_{rotation}$ to the model matrix and set the translation of the model matrix to the original one, since billboards only affect rotation and scale.

If `overlay` option is given, the depth value of affected primitives needs to be set to zero. If multiple billboards with overlay are present, than they need to be depth sorted based on their position and an increasing Z value near zero should be used. This avoids Z-fighting.

[Billboard sample code](https://github.com/KhronosGroup/glTF-Sample-Viewer/blob/87dcecf011e8626f50ca780c0258f8dd919f262a/source/gltf/scene.js#L36)
