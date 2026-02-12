# @snk/action

Contains the github action code.

## Implementation

### Docker

Because the gif generation requires some native libs, we cannot use a node.js action.

Use a docker action instead, the image is created from the [Dockerfile](../../Dockerfile).

It's published to [GitHub Container Registry](https://ghcr.io/sandeepyadav1478/snk-wakatime) which makes for faster build (compared to building the image when the action runs)
