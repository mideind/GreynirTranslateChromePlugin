"use strict";

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const DOCUMENT_NODE = 9

function isExcluded(elm) {
    if (elm.tagName == "STYLE") {
        return true;
    }
    if (elm.tagName == "SCRIPT") {
        return true;
    }
    if (elm.tagName == "NOSCRIPT") {
        return true;
    }
    if (elm.tagName == "IFRAME") {
        return true;
    }
    if (elm.tagName == "OBJECT") {
        return true;
    }
    if (elm.tagName == "HEAD") {
        return true;
    }
    return false
}

function get_text_elements(elm) {
    let text_elements = []
    if (elm.nodeType == ELEMENT_NODE || elm.nodeType == DOCUMENT_NODE) {

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return text_elements
        }

        for (let i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            text_elements.push(...get_text_elements(elm.childNodes[i]));
        }

    }

    if (elm.nodeType == TEXT_NODE) {

        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return text_elements
        }

        // The elm.nodeValue is visible
        // TODO: Check if it has been translated.
        text_elements.push(elm)
    }
    return text_elements
}

async function translate(texts, src_lang = "is", tgt_lang = "en") {
    const response = await fetch("https://velthyding.mideind.is/translate/", {
        headers: {
            "accept": "*/*",
            "content-type": "application/json; utf-8",
        },
        body: JSON.stringify({ "model": "fairseq-dev", "contents": texts, "sourceLanguageCode": src_lang, "targetLanguageCode": tgt_lang }),
        mode: "no-cors",
        method: "POST",
    })
    const data = await response.json()
    return data["translations"].map(translation => translation["translatedText"])
}

function apply_translation(translation, element) {
    element.nodeValue = translation
    // TODO: Mark as translated.
}


async function translate_elements(elms, batch_size = 6, max_batches = 2) {
    let counter = 0
    while (elms.length && counter < max_batches) {
        let batch = elms.splice(0, batch_size)
        try {
            let translated = await translate(batch.map(elm => elm.nodeValue))
            translated.forEach((translation, idx) => apply_translation(translation, batch[idx]))
        } catch (e) {
            console.error(e)
        }
        counter += 1
    }
}

// The max_batches is set for prototyping
let max_batches = 2
let batch_size = 6
let text_elements = get_text_elements(document);
translate_elements(text_elements, batch_size, max_batches)
    .then(() => console.log("Done translating."))
    .catch(reason => console.error("Unable to finish translation:", reason.toString()))