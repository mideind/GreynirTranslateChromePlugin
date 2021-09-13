var ELEMENT_NODE = 1
var TEXT_NODE = 3
var DOCUMENT_NODE = 9

var translate_url = "https://velthyding.is/translate/"

var total_elements = 0;
var translated_elements = 0;

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
        // No model specified. We use the default model.
        body: JSON.stringify({"contents": texts, "sourceLanguageCode": src_lang, "targetLanguageCode": tgt_lang }),
        mode: "cors",
        method: "POST",
    })
    const data = await response.json()
    return data["translations"].map(translation => translation["translatedText"])
}

function apply_translation(translation, element) {
    // We want to match the whitespace present in the original element to maintain the formatting.
    // The first group matches the whitespace in the beginning.
    // The second group matches the text to be translated, including newlines (s-flag)
    // The third group is like the first group.
    // This regex covers multiple lines (newlines) so only one match is possible.
    var regex = /^(\s*)(.*?)(\s*)$/s;
    match = element.nodeValue.match(regex)
    if (match != null) {
        // We try to preserve the whitespace
        element.nodeValue = `${match[1]}${translation}${match[3]}`
    } else {
        element.nodeValue = translation
    }
    // TODO: Mark as translated.
}

function update_translation_progress() {
    var banner = document.getElementById("translation-counter");
    if (banner != null) {
        banner.innerText = `Translated: ${translated_elements}/${total_elements}`
    }
}

async function translate_elements(elms, src_lang, tgt_lang, batch_size = 6) {
    update = setInterval(update_translation_progress, 1000);
    total_elements = elms.length
    while (elms.length) {
        let batch = elms.splice(0, batch_size)
        try {
            let translated = await translate(batch.map(elm => elm.nodeValue), src_lang, tgt_lang)
            translated.forEach((translation, idx) => apply_translation(translation, batch[idx]))
        } catch (e) {
            // TODO: Add handling of 401 (missing api-key)
            console.error(e)
        }
        translated_elements += batch.length;
    }
    update_translation_progress();
    clearInterval(update);
}

function create_translation_banner() {
    var container = document.createElement("div");
    container.id = "translation-banner"
    container.style.zIndex = "5001";
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.width = "20rem";
    container.style.lineHeight = "1.0rem";
    container.style.padding = "1.0rem";
    container.style.backgroundColor = "white";
    container.style.color = "black";
    container.style.borderTopLeftRadius = "0.3rem";
    container.style.borderColor = "black";
    container.style.borderLeft = "0.3rem";
    container.style.borderTop = "0.3rem";
    container.style.borderBottom = "0rem";
    container.style.borderRight = "0rem";
    container.style.borderStyle = "solid";
    container.onclick = function () {
        if (container.style.display === "none") {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }

    };

    var image = document.createElement("img")
    image.setAttribute("src", "https://velthyding.mideind.is/static/media/velthyding_hor.44aeae4e.png")
    image.style.width = "20%"
    image.style.height = "auto"
    image.style.float = "left"
    container.appendChild(image)

    var translation_text = document.createElement("div")
    image.style.float = "right"
    translation_text.id = "translation-counter"
    container.appendChild(translation_text)

    document.body.appendChild(container);
}

function translate_webpage(src_lang, tgt_lang) {
    // The max_batches is set for prototyping

    let batch_size = 6
    let text_elements = get_text_elements(document);
    create_translation_banner();
    translate_elements(text_elements, src_lang, tgt_lang, batch_size)
        .then(() => console.log("Done translating."))
        .catch(reason => console.error("Unable to finish translation:", reason.toString()))
}

chrome.storage.local.get(["src_lang", "tgt_lang"], function (results) {
    translate_webpage(results.src_lang, results.tgt_lang)
});
