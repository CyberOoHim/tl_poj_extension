if (typeof _global.TL_UI_CONFIG_LOADED === 'undefined') {
    _global.TL_UI_CONFIG_LOADED = true;

    _global.UI_STRINGS = {
        title: "TL -> POJ 隨時轉",
        tabs: {
            scan: "轉網頁",
            type: "拍字轉",
            file: "轉書類"
        },
        scan: {
            label: "",
            statusSelected: "揀部份轉",
            statusFetched: "掠規篇文章",
            placeholder: "網頁文字隨時轉...",
            btnCopy: "Kho͘",
            btnDownload: "Táng-ló͘",
            filename: "揀字轉.txt",
            enableConversion: "轉 POJ",
            markdownToggle: "看 MD"
        },
        type: {
            inputLabel: "TL / TL & POJ 帶數字調號",
            inputPlaceholder: "拍/貼 TL he̍k-chiá TL/POJ 標數字調號...",
            outputLabel: "POJ 輸出",
            outputPlaceholder: "POJ 輸出...",
            btnPaste: "貼",
            btnClear: "清",
            btnCopy: "Kho͘",
            btnInject: "pôaⁿ",
            btnDownload: "Táng-ló͘",
            filename: "拍隨轉.txt",
            injectSuccess: "貼--起去--ah! (Inject Success)",
            injectNoTarget: "無地貼 (No field)",
            injectError: "貼失敗 (Failed)",
            injectRestricted: "無法度貼 (Restricted Page)"
        },
        file: {
            dropZoneText: "Kā 書類 拖來 chia, ia̍h-sī chhi̍h Ap-ló͘ 揀書類, .txt/.md/.srt/.vtt/.csv/.tsv/.json/.pdf lóng 會使。",
            btnChooseFile: "Ap-ló͘",
            previewLabel: "轉soah結果",
            btnCopy: "Kho͘",
            btnDownload: "Táng-ló͘",
            btnDownload: "Táng-ló͘",
            filename: "轉書類.txt",
            fileTypes: {
                csv: " (CSV 表格)",
                tsv: " (TSV 表格)",
                json: " (JSON 資料)",
                pdf: " (PDF 文件)",
                text: " (Text 文件)",
                md: " (Markdown 文件)",
                srt: " (SRT 字幕)",
                vtt: " (VTT 字幕)"
            },
            messages: {
                general: "* Ài 細膩，英文 a̍h-sī 其他外語 ê 羅馬字 kám 有誤轉，詳細去看解說。",
                pdf: "* 排版若走精--去，a̍h-sī 資料落勾，tō 另外 kā 資料 choâng 好勢才用純文字轉。"
            },
            truncationSuffix: "\n\n...\n\n----------\n\n↑ 先看--一下爾，完整--ê ài táng-ló͘..."
        },
        csv: {
            uploadHeader: "Ap-ló͘ (Upload)",
            optionsHeader: "CSV/TSV 設定",
            selectColumns: "揀欲轉 ê 直逝:",
            outputMode: "Output 模式:",
            modeOnly: "kan-ta 轉好--ê",
            modeOriginalPlus: "原直逝 + 轉好--ê",
            modeInsert: "插 tī 原直逝後壁",
            btnConvert: "開始轉 CSV",
            btnCancel: "取消"
        },
        json: {
            optionsHeader: "JSON 設定",
            selectKeys: "揀欲轉 ê Key:",
            outputMode: "Output 模式:",
            modeOnly: "kan-ta 轉好--ê",
            modeOriginalPlus: "原 Key + 轉好--ê",
            modeInsert: "插 tī 原 Key 後壁",
            btnConvert: "開始轉 JSON",
            btnCancel: "取消"
        },
        subtitle: {
            optionsHeader: "字幕設定",
            selectLines: "揀欲轉佗一逝:",
            modeAll: "Lóng-chóng",
            modeLine1: "kan-ta 頭逝",
            modeLine2: "kan-ta 第 2 逝",
            modeLine3Plus: "kan-ta 第 3 逝以後",
            btnConvert: "開始轉字幕",
            btnCancel: "取消",
            detectPrompt: "這份 .txt 看--起來有字幕時標，kàm beh 用字幕模式轉？",
            detectYes: "好，用字幕模式",
            detectNo: "毋免，當做普通文字"
        },
        contextMenus: {
            fetchArticle: "掠規篇文章",
            convertPage: "就地轉 POJ",
            undo: "復原",
            clearText: "文字總清"
        },
        autoConvert: {
            toggle: "就地轉 POJ"
        },
        selectionButtons: {
            selectAll: "總揀",
            deselectAll: "總清"
        },
        tooltips: {
            resetFile: "Ap-ló͘ 新 ê 書類"
        },
        messages: {
            clipboardError: "無法度自動貼，chhi̍h Ctrl+V 貼看覓。",
            fileTypeError: "書類格式無支援。Ài ap-ló͘： ",
            selectColumnsError: "上無揀一逝直逝來轉。",
            selectKeysError: "上無揀一个 Key 來轉。",
            selectSubtitleLinesError: "上無揀一逝來轉。",
            articleExtractError: "無法度讀取文章內容 (Could not extract article content)。",
            pdfParseError: "PDF 有重耽，讀無： ",
            jsonParseError: "JSON 有重耽，讀無： ",
            // Toast messages for article fetch
            toastArticleSuccess: "文章掠好--ah ✓",
            toastArticleNoContent: "無法度掠規篇網頁文章",
            toastReadabilityNotLoaded: "程式庫掠失敗，重開 Extension",
            toastNoArticle: "無法度掠文章內容",
            toastBlockedSite: "無支援這个網站 (Restricted/SPA)。",
            toastScanCleared: "轉網頁 清--ah！",
            toastTypeCleared: "拍字轉 清--ah！",
            general: "注意：任何文字／文章轉soah，lóng ài 檢查。"
        },
        settings: {
            tabName: "Help & Settings",
            headerSettings: "設定 (Settings)",
            headerHelp: "說明 (Help)",
            headerAbout: "阮 (About)",
            nasalLabel: '尾N→鼻化音"ⁿ"',
            tone6Label: "第6調 (ǎ)",
            allCapsLabel: "大寫模式 (ALL CAPS)",
            btnRunTest: "看 TL->POJ ê 見本 a̍h-sī 測看覓",
            btnReset: "恢復初設 (Reset Default)",
            btnHelpLang: "說明語言: 台語 (Help Lang)",
            showRawMdLabel: "顯示原始 Markdown 格式",
            renderMdLabel: "看 MD",
            includeUrlsLabel: "Markdown 帶 網鍊（URL）"
        },
        markdown: {
            imagesHeader: "🖼️ 圖 (Images)",
            videosHeader: "🎬 影片 (Videos)",
            audioHeader: "🔊 音聲 (Audio)",
            embedHeader: "📺 楔入內容 (Embedded Content)",
            sourceLabel: "源頭（Source）",
            imageLabel: "Image",
            videoLabel: "Video",
            audioLabel: "Audio",
            embedLabel: "Embedded content"
        },
        footer: "© 2026 <a href=\"https://cyberoohim.github.io/\" target=\"_blank\" style=\"color: inherit; text-decoration: none;\">Cyber O͘-hîm ki-tē</a>",
        testSample: `=== TL 符號調輸入 (Diacritics) ===
Tâi-uân sī chi̍t-ê hó só͘-chāi. (台灣是一个好所在)
Tsit-chân tāi-tsì tsin-tsiànn hó. (這層代誌真正好)
POJ 帶符號調號無 koh 轉: Góa ài lim tê, i ài chia̍h pn̄g. (我愛啉茶，伊愛食飯)

=== TL/POJ 數字調輸入 (Numeric) ===
Tai5-uan5 si7 chit8-e5 ho2 so2-chai7.
Goa2 ai3 lim te5, i ai3 chiah8 png7.`
    };

} 