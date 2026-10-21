# Extraction provenance

Source: [TowelBooks](https://github.com/Alsogravity/towelbooks), commit `af1bfbede8c65dbd5069b9ffd041b411f58afca2`.

The original frontend source and its UI, design-token, schema, and SDK packages were copied directly, excluding source tests and agent instructions. Pages, styles, layouts, component composition, translations, and interactions are preserved rather than reimplemented.

[Source manifest](docs/source-manifest.json) records 1,108 original files with SHA-256 hashes. `pnpm source:check` verifies 1,102 unchanged files and permits modifications only to the six files in [demo-adaptations.json](docs/demo-adaptations.json). The original public assets are listed separately in [asset-manifest.json](docs/asset-manifest.json).

New demo fixtures and transport, repository tooling, static-host configuration, documentation, and showcase tests are independent additions. The frontend has no runtime or build dependency on the original checkout. No original repository history, backend, infrastructure, environment files, production data, or credentials are included.
