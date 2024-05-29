# Level of Detail

## Needs

There are many circumstances where a single model needs to have multiple levels of detail (LOD) when used in a scene. These include the reasons listed below. In an ideal situaiton devices, bandwidth, and servers would all be sufficiently powerful that no detail considerations would be required. LOD is a means to deal with real physical limitations of the user's environment.

* Bandwidth limitations prohibit the loading of large models
* Device limitations prohibit the loading of large or highly textured models
* The model is shown at a large virtual distance and device resources are not needed to correctly display the model
* The model is animated but device resources are not needed for an animated model

During the course of viewing a scene it may be necessary to change the LOD of a model. The reasons for this include:

* visual distance to certain model features
* model features may not be visible due to animation
* device capabilities may be insufficinet to display all features

## Investigation

Several organizations contributed to various pieces of potential solutions. It was agreed that there needed to be quantified (numeric) measures controlled by the content creator that determined when a particular model was used. Due to the variety of real-world limitations that the content create may need to handle, there was no agreement on a single specific measure.

The various measures 

## Results

The prototype work on this capability used the JSON schema described below to produce the desired effects. There were no extra recommendations nor caveats. All of the changes solely apply to the glTFX file schema. There are no recommended changes or additions to the glTF file schema.

It was found that no single measure is sufficient for all cases to determine the displayed model. It is necessary for the same measure to be used for all levels of detail of a single model (glTF file).

The measure for determining which model to use must not generate flashing or similar effects if the scene display is near the transition value. This either requires a "fuzz" factor that is applied uniformly to all transition values or a more complex data structure to explicitly list the transition ranges.

THe stability that is desired is illustrated in the graph below. The trapizodial region is stable as the LOD measure changes from "Near" to "Far" (or vice-versa). The displayed LOD level is not determined by solely the measure but depends on the direction of traversal.

**Illustration of LOD level vs. LOD Measure**

![Illustration of LOD level vs. LOD Measure](images/hysterisis.png)
_The arrows indicate the direction of change of the measure (horizontal axis). Green double-headed arrows indicate determination based on the Measure. Single-headed arrows indicates the LOD when the Measure changes in the indicated direction. The LOD only transitions at T1 or T2. There is no transition except those points._

_ran out of time. Need to expand this section is schema fragments and images. An illustration of the transition would be helpful using a hysteresis loop. (probably need to construct this). Reference material is in Khronos-only file at https://members.khronos.org/wg/3D_Formats/document/previewpdf/32333._