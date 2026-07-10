# EvePlugins

First-party reusable semantic plugins for Eve. Each plugin owns its domain
semantics and runs through the runtime-independent Eve plugin ABI. Eve owns the
contract; this repository owns plugin behavior.

The first owner plugin is `tex.math`, implemented under
`plugins/eve-plugin-tex`. It uses KaTeX for parsing and typesetting, emits
render-result projections, and never mutates provider state.

```powershell
npm install
npm test
```

