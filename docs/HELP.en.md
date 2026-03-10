# Help & Settings / 說明 & 設定

* **Note**: You can type TL Pinyin with numeric tones or symbolic tones, or POJ with numeric tones; all will be converted to POJ with symbolic tones.
* **Note**: If other foreign languages happen to match TL patterns, they might be mistranslated. This is a limitation. Use escape syntax to avoid this; click **the first button on the top** to see examples. However, this cannot be avoided when directly scanning web pages.

## 1. 轉網頁 (Scan Mode)

Directly reads and converts TL Pinyin from web pages into POJ.

* **揀欲愛--ê 來轉 (Select text to convert)**: Select text on the webpage, and it will automatically convert to POJ and display in the extension.
* **就地轉 POJ 開關 (Live Convert Switch)**: Turn ON to convert all TL Pinyin on the entire webpage directly into POJ in-place.
* **轉 POJ 開關 (Web Conversion Switch)**: Turn ON so that "Scan Page" converts found TL Pinyin to POJ; if OFF, it displays the original TL Pinyin.
* **看 MD 開關 (View MD Switch)**: Turn ON "View MD" to display the result in Markdown format, which can include images, videos, etc. (See Markdown URL setting). The downloaded format is the same as what you see.
* **URL Preservation**: All URLs (links) remain unconverted in POJ.
* **Note**: Webpage structures vary greatly. We cannot guarantee the format of captured full articles is always correct; please check the content manually.
* **Note**: Some websites may block content extraction; no guarantees are made.

### 正chhi̍h單á (Context Menu)

* **掠規篇文章 (Scan Article)**: Directly capture webpage content into the Extension.
  * **Note**: Complex webpages may not be captured completely, or formatting may not be perfect.
  * **Note**: For guaranteed content and formatting, selecting specific text to convert is more reliable.
* **就地轉 POJ (Live Convert)**: Convert text on the webpage to POJ in-place (Synced with the Live Convert switch).
* **復原 (Undo)**: Revert back to the original TL Pinyin.
* **文字總清 (Clear Text)**: Clear all input and output boxes in "Scan Mode" and "Type Mode". Does not affect "File Mode".

## 2. 拍字轉 (Type Mode)

Simple TL Pinyin to POJ converter tool, supports both diacritic TL Pinyin and numeric tone POJ.

* **輸入 (Input)**: Type text in the top box (e.g., Tye5-uan5 / Tâi-uân).
* **輸出 (Output)**: The bottom box will instantly display the converted POJ.

## 3. 書類處理 (File Mode)

Convert data files.

* **Ap-ló͘ (Upload)**: Drag files in, or click the paperclip icon to select files.
* **格式 (Formats)**: Supports .txt, .md, .srt/.vtt (Subtitles), .csv/.tsv (Spreadsheets), .json, .pdf.
* **Táng-ló͘ (Download)**: Converted files can be downloaded and saved.

### 轉書類設定 (File Conversion Settings)

* **CSV/TSV**: Select the column to convert, and choose output mode (Only converted / Original + Converted / Insert after original column).
* **JSON**: Select key to convert, and choose output mode (Only converted / Original + Converted / Insert after original key).
* **SRT/VTT**: If subtitles use multiple lines, choose which line to convert (All / 1st line / 2nd line / 3rd+ line).
  * **Note**: iPad cannot capture .srt; rename to .vtt or .txt.
  * **Note**: PDF layout complexities may result in imperfect text extraction.
  * **Note**: To paste into Google Keep, type a space first to clear the input placeholder.

## 4. 設定 (Settings)

Three Toggles:

* **尾N→ⁿ**: ON=N becomes ⁿ (saN→saⁿ), OFF=N remains N (saN→saN). 'nn' is always converted.
* **第6調 ǎ (Tone 6)**: ON=Use caron (ǎ), OFF=Use acute (á) like Tone 2.
* **大寫模式 (All Caps)**: ON=Convert uppercase too (TSUI→CHUI), OFF=Keep uppercase unchanged.

* **顯示原本 Markdown 格式 開關 (Show Raw Markdown)**: ON=Show raw Markdown syntax (no render), OFF=Show rendered view (Default).
* **Markdown 帶 網鍊（URL）開關 (Markdown with URL)**: In Settings, turn ON "Markdown with URL" to include source URLs (images/videos etc). Otherwise, Markdown will strip non-source URLs. Accuracy is not guaranteed.

### 測驗 kap 其他機能 (Testing & Other)

* **A+/A-**: Adjust Text Size.
* **☀️/🌙 (Day/Night Mode)**: Toggle Light/Dark background.

* **看 TL 拼音->POJ ê 見本 a̍h-sī 測看覓 (View Samples / Test)**: Click this button to automatically load comprehensive test samples into the "Type" tab. Use this to reference various usage examples and see how settings apply.
* **恢復初設 (Reset Default)**: Restore all settings to their original defaults.

---

## About Us (About)

* TL Pinyin -> POJ Sûi-sî-choán Converter  
* Copyright © 2026 [Cyber O͘-hîm ki-tē](https://cyberoohim.github.io/)  
* Licensed under MIT License

### Libraries & Assets

**PDF.js** (Mozilla Foundation)  

* Licensed under Apache License 2.0

**Readability.js** (Mozilla Foundation)  

* Licensed under Apache License 2.0

**Turndown.js** (Dom Christie)  

* Licensed under MIT License

**Huninn** (justfont)  

* Licensed under SIL Open Font License 1.1

**Chiayi City Font** (Chiayi City Gov)  

* Licensed under SIL Open Font License 1.1
