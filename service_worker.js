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

function store_and_translate(src_lang, tgt_lang, tab) {
    chrome.storage.local.set({ "src_lang": src_lang, "tgt_lang": tgt_lang }, function () {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["./translate.js"],
        });
        console.log("Started translation script")
    });
    console.log("Stored language directions")
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "ToIcelandicContextMenu") {
        store_and_translate("en", "is", tab)
    }
    if (info.menuItemId == "ToEnglishContextMenu") {
        store_and_translate("is", "en", tab)
    }
});
