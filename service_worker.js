// import { translate_webpage } from './translate.js';
chrome.runtime.onInstalled.addListener(function () {
    let mainContextMenu = "TranslateContextMenu"
    chrome.contextMenus.create({
        "id": mainContextMenu,
        "title": "Translate",
        "contexts": ["page"]
    });
    chrome.contextMenus.create({
        "id": "ToIcelandicContextMenu",
        "parentId": mainContextMenu,
        "title": "Enska -> Íslenska",
        "contexts": ["page"]
    });
    chrome.contextMenus.create({
        "id": "ToEnglishContextMenu",
        "parentId": mainContextMenu,
        "title": "Icelandic -> English",
        "contexts": ["page"]
    });
});

async function store_values(src_lang, tgt_lang) {
    return chrome.storage.local.set({ "src_lang": src_lang, "tgt_lang": tgt_lang })
}

function translate(tab) {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["./translate.js"],
    });
}
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "ToIcelandicContextMenu") {
        store_values("en", "is").then(
            translate(tab)
        )
    }
    if (info.menuItemId == "ToEnglishContextMenu") {
        store_values("is", "en").then(
            translate(tab)
        )
    }
});
