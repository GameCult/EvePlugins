# Eve Fields Plugin Contracts

This package owns the portable C# view of `gamecult.fields.*` documents. It has
no Unity rendering, provider state, transport, or command authority. Providers
implement these read-only interfaces; Unity runtime adapters consume them.
