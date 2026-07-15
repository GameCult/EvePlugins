# Eve Fields Plugin Contracts

This package owns the portable C# view of `gamecult.fields.*` documents. It has
no Unity rendering, provider state, transport, or command authority. Providers
implement these read-only interfaces; Unity runtime adapters consume them.

`PowerPulse` is the portable compact-support radial falloff
`pow(saturate(1 - pow(distance01 * scale, 2)), exponent)`. Producers publish
`FalloffScale` and `FalloffExponent` alongside each SoA splat. Missing parameter
entries retain the neutral defaults `1` and `1`, so older v1 documents remain
readable.

Procedural sources are evaluated in field-world coordinates, not splat-local
UVs. `SimplexNoise` samples signed Ashima 3D simplex at
`(worldXY * frequency + phase, 0)`. `AnimatedSimplexNoise` uses
`simulationTimeSeconds * animationSpeed` for the third coordinate.
`AnimatedCellNoiseB` is the portable moving, wrappable cellular source whose
distance metric is `(length(frac(p) - .5) * 1.5 + .25) *
max(abs(x) * .866 + y * .5, -y)`. `AbsoluteValue` folds a signed source after
sampling. Constant offsets remain ordinary constant splats, so source sampling
and additive composition retain separate ownership.

`AnimatedRadialCosine` is splat-local rather than field-world anchored. It
evaluates
`cos(pow(distance01, FrequencyY) * FrequencyX + PhaseX + simulationTimeSeconds * AnimationSpeed)`.
`FrequencyX` is radial frequency and `FrequencyY` is the positive radial
exponent. The ordinary splat falloff owns the envelope, which keeps oscillation
and compact support independently composable.
