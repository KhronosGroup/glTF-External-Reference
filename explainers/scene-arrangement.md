# Scene arrangement demo
## Needs
This demo should show an application of glTF External Reference, which leverages the new functionality of combining different assets in one file. This demo allows the user to arrange different assets in a scene by placing them on top of each other. This can be used e.g. to arrange furniture in a room.
## Results
The demo consists of two technical parts: \
In order to allow an asset to be moved, it first needs to be selected. For this we assigned a unique color for each asset in a separate picking draw call. Now the user can double click on an asset and the asset and all its children will be highlighted.\
By pressing `CTRL` and clicking on another asset, the selected asset will be moved to the surface under the cursor. This will also automatically re-parent the selected asset to the asset it was moved onto. The asset will align it up vector with the surface normal, therefore, one can place objects correctly onto walls or curved surfaces. Keep in mind that this is not a physics based approach. There is no calculated gravity and clipping is not prevented.

In future work one could add the possibility to dynamically add more assets to a scene, replace assets in a scene or export the new glTFX file.


https://github.com/KhronosGroup/glTF-External-Reference/assets/50208655/93191e4f-5f3f-40d5-97b3-da442e623fe1

![Alternative link](https://raw.githubusercontent.com/KhronosGroup/glTF-External-Reference/main/explainers/videos/scene_arrangement.mp4)

## Implementation Notes
To create this demo, we need create a new offscreen framebuffer, which will write an color ID per asset, the position and the normal for each fragment into a texture output. We can then select the picked pixel to extract the information. One wants to exclude already selected assets from this draw call to allow smooth translation on the surfaces below.\
If one wants to improve performance, these textures can just be 1x1 pixels of the cursor position by manipulating the camera space.\
With the color ID the selection and re-parenting can be implemented and with position and normal we can set the new position and rotation.

Setting the translation is trivial. To set the rotation, one can calculate the angle and rotation axis between the surface normal and the global up vector. We assume that the anchor point of an asset is the origin and the up vector is its orientation on a surface. One could add custom anchor points in the future as well.\
If the normal is 180 degree rotated, calculating the rotation with the up vector is not possible. One can use the right vector instead.\
After setting the translation and rotation, one can additionally add the initial rotation of the asset to keep the same rotation around the up vector.

Shader sample code: [Fragment Shader](https://github.com/KhronosGroup/glTF-Sample-Viewer/blob/feature/gltfx/source/Renderer/shaders/picking.frag) [Vertex Shader](https://github.com/KhronosGroup/glTF-Sample-Viewer/blob/feature/gltfx/source/Renderer/shaders/picking.vert)\
[Reposition sample code](https://github.com/KhronosGroup/glTF-Sample-Viewer/blob/87dcecf011e8626f50ca780c0258f8dd919f262a/app_web/src/main.js#L300)
