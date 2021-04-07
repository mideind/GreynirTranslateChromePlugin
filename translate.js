"use strict";

let translation_marker = "translated"

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

function get_text_elements(elm, attribute_black_list = translation_marker) {
    let text_elements = []
    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return text_elements
        }

        for (let i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            text_elements.push(...get_text_elements(elm.childNodes[i]));
        }

    }

    if (elm.nodeType == Node.TEXT_NODE) {

        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return text_elements
        }

        // The elm.nodeValue is visible, but might already be translated.
        if (elm.hasAttribute(attribute_black_list) && elm.getAttribute(attribute_black_list) === "true") {
            return text_elements
        } else {
            text_elements.push(elm)
        }
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

function apply_translation(translation, element, class_mark_translated = translation_marker) {
    element.nodeValue = translation
    element.setAttribute("translated", "true")
}


async function translate_elements(elms, batch_size = 6, max_batches = 2) {
    let counter = 0
    while (elms.length && counter < max_batches) {
        let batch = elms.splice(0, batch_size)
        try {
            let translated = await translate(batch.map(elm => elm.nodeValue))
            translated.forEach((translation, idx) => apply_translation(translation = translation, batch[idx]))
        } catch (e) {
            console.error(e)
        }
        counter += 1
    }
}

let max_batches = 2
let batch_size = 6
let text_elements = get_text_elements(document);
translate_elements(text_elements, batch_size, max_batches)
    .then(() => console.log("Done translating."))
    .catch(reason => console.error("Unable to finish translation:", reason.toString()))
