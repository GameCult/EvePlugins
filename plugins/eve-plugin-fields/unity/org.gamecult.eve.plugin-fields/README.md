# Eve Fields Plugin Contracts

This package owns the portable C# view of `gamecult.fields.*` documents. It has
no Unity rendering, provider state, transport, or command authority. Providers
implement these read-only interfaces; Unity runtime adapters consume them.

`PowerPulse` is the portable compact-support radial falloff
`pow(saturate(1 - pow(distance01 * scale, 2)), exponent)`. Producers publish
`FalloffScale` and `FalloffExponent` alongside each SoA splat. Missing parameter
entries retain the neutral defaults `1` and `1`, so older v1 documents remain
readable.
