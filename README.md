# Chrome Translation Plugin
A Chrome plugin for translating web pages.

This is a work in progress.

Implemented:
- Rough parsing of the DOM to gather all text elements.
- Batching of sentences to be translated.
- Requests are chained.

Not implemented:
- Parsing of DOM sensitive to inline and block elements. This needs to be done in order to reduce splitting of sentences on inline elements.
- Chrome plugin packaging.
- Configuration on translation direction.