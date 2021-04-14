var ELEMENT_NODE = 1
var TEXT_NODE = 3
var DOCUMENT_NODE = 9

var translate_url = "https://velthyding.is/translate/"

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
    const response = await fetch(translate_url, {
        headers: {
            "accept": "application/json",
            "content-type": "application/json; utf-8",
            // No API-Key is set. We add it on the backend.
        },
        body: JSON.stringify({ "model": "fairseq-dev", "contents": texts, "sourceLanguageCode": src_lang, "targetLanguageCode": tgt_lang }),
        mode: "cors",
        method: "POST",
    })
    const data = await response.json()
    return data["translations"].map(translation => translation["translatedText"])
}

function apply_translation(translation, element) {
    var regex = /^(\s*)(.*?)(\s*)$/s; // dot should match newlines.
    match = element.nodeValue.match(regex)
    if (match != null) {
        // We try to preserve the whitespace
        element.nodeValue = `${match[1]}${translation}${match[3]}`
    } else {
        element.nodeValue = translation
    }
    // TODO: Mark as translated.
}


async function translate_elements(elms, src_lang, tgt_lang, batch_size = 6) {
    while (elms.length) {
        let batch = elms.splice(0, batch_size)
        try {
            let translated = await translate(batch.map(elm => elm.nodeValue), src_lang, tgt_lang)
            translated.forEach((translation, idx) => apply_translation(translation, batch[idx]))
        } catch (e) {
            // TODO: Add handling of 401 (missing api-key)
            console.error(e)
        }
    }
}

function translate_webpage(src_lang, tgt_lang) {
    // The max_batches is set for prototyping
    let batch_size = 6
    let text_elements = get_text_elements(document);
    translate_elements(text_elements, src_lang, tgt_lang, batch_size)
        .then(() => console.log("Done translating."))
        .catch(reason => console.error("Unable to finish translation:", reason.toString()))
}

chrome.storage.local.get(["src_lang", "tgt_lang"], function (results) {
    translate_webpage(results.src_lang, results.tgt_lang)
});