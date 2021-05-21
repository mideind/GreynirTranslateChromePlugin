# Chrome Translation Plugin
A Chrome plugin for translating web pages.

This is a work in progress.

Implemented:
- Rough parsing of the DOM to gather all text elements.
- Batching of sentences to be translated.
- Requests are chained.
- Chrome plugin packaging.
- Configuration on translation direction.

Not implemented:
- Parsing of DOM sensitive to inline and block elements. This needs to be done in order to reduce splitting of sentences on inline elements.
- A banner displayed on top of site which displays translation progress and lets the user know that the site is translated.

## How to run
See directions at https://developer.chrome.com/docs/extensions/mv3/getstarted/

## Bundling and loading to Chrome Store
Bundle the package with `bundle.sh` and upload the zip file to the Chrome Web Store via the Developer Dashboard.

You must have a chrome web store developer account. haukurpj@mideind.is is a registered account.