# TL -> POJ 隨時轉 (Sûi-sî-choán)

**TL -> POJ 隨時轉** is a Chrome Extension designed for Taiwanese language users. It allows instant conversion of **KIP Tâi-lô (TL)** to **Taiwanese Pe̍h-ōe-jī (POJ)** across web pages, text input, and various file formats.

**TL -> POJ 隨時轉** 是一款專門為台語使用者設計 ê Chrome Extension。伊 hō͘ 你 tī 網頁、拍字、抑是各種檔案格式，隨時 kā **教育部台羅拼音 (KIP Tâi-lô pheng-im)** 轉做 **台灣 白話字 (Pe̍h-ōe-jī)**。

![SCREENSHOT](docs/SCREENSHOT.md)

## Features / 功能

### 1. 轉網頁 (Scan Mode)

* **Web Page Conversion:** Select text on any webpage to convert it to POJ immediately in the side panel.

    **轉網頁：** 揀網頁頂懸 ê 文字，隨時 tī 邊欄 kā 轉做 POJ。

* **Live Conversion:** Transform the entire webpage's TL text into POJ in-place.

    **就地轉 (Live Conversion)：** 直接原位 kā 規頁網頁 ê TL 轉做 POJ，原位顯示。

* **Markdown Support:** Copy converted content as Markdown, preserving links and formatting.

    **Markdown 支援：** 會使 kā 轉好 ê 內容 Kho͘ (Copy) 做 Markdown，保留網鏈 kah 格式。

### 2. 拍字轉 (Type Mode)

* **Real-time Editor:** Type Tâi-lô with numeric tones (e.g., `tsui2`) or diacritics (e.g., ) and see POJ output（chúi） instantly.

    **即時編輯器：** 輸入 Tâi-lô 數字調`tsuí` (像 `tsui2`) ah-si 符號調號 (像 `tsuí`)，隨 tō 看著 POJ 輸出（chúi）。

* **Inject (Pôaⁿ):** Directly paste converted POJ into active text fields on websites.

    **Poânn (Inject)：** 直接 kā 轉好 ê POJ 貼入去網頁 ê 輸入框 (Input field)。

### 3. 轉書類 (File Mode)

* **Multi-format Support:** Convert `.txt`, `.md`, `.srt/.vtt` (Subtitles), `.srt/.vtt`, `.json`, and `.pdf` files.

    **Chē格式支援：** 支援轉換 `.txt`, `.md`, `.srt/.vtt` (字幕), `.csv/.tsv`, `.json`, kah `.pdf` 檔案。

* **Advanced Options:**
  * **Subtitles:** Select specific lines to convert (e.g., 2nd line only) for bilingual subtitles.
  * **CSV/JSON:** Choose specific columns or keys to convert.

    **進階設定：**
  * **字幕：** 會使揀欲轉 tó-ūi (親像 kan-ta 轉第 2 逝)，利便做雙語字幕。
  * **CSV/JSON：** 揀欲轉 ê 直逝 (columns) ia̍h-sī Key。

### 4. Customization / 設定

* **Nasal Tone:** Choose whether to use `N`. `nn` is always converted (superscript n).

    **鼻化音：** 選擇 kám 欲用 `N` 。 `nn` 是一定會轉 (superscript n)。

* **Tone 6:** Choose between `á` (caron) or `á` (acute).

    **第 6 調：** 選擇欲用 `á` (caron) ah-sī `á` (acute)。

* **Dark Mode:** Cyberpunk-themed dark mode for comfortable reading.

    **暗暝模式：** 規个暗色，hō͘ 目睭較四序。

## Installation / 安裝

### Install from Chrome extension store / Ùi Chrome 線頂應用程式商店安裝

**[Download from Chrome Web Store](https://chromewebstore.google.com/detail/tl-%3E-poj-%E9%9A%A8%E6%99%82%E8%BD%89/fifgafegihlbgnalgnjinaokghnplkli?hl=en-US&utm_source=ext_sidebar)**

### Load Unpacked (Development) / 掠未封包 (開發用)

Currently, this extension is in development and can be installed via "Load Unpacked":

現此時本 Extension iáu leh 開發，ài 用 "Load Unpacked" 來安裝：

1. Clone or download this repository.

    Clone ah-sī 是 tàng-lō͘ 這个專案 (repository)。

2. Open Chrome and go to `chrome://extensions/`.

    開 Chrome，去 `chrome://extensions/`。

3. Enable **"Developer mode"** (top right corner).

    Kā 正頂懸 ê **"Developer mode" (開發人員模式)** 開--開。

4. Click **"Load unpacked"**.

    Chhi̍h **"Load unpacked"** chhi̍h鈕。

5. Select the folder containing this project's `manifest.json`.

    揀這个專案 (有 `manifest.json` ê 資料夾)。

## Usage / 使用

1. Click the extension icon or open the Chrome Side Panel and select "TL -> POJ 隨時轉".

    點 Extension ái-kháng（icon ），ah-sī 開 Chrome Side Panel (邊欄) 揀 "TL -> POJ 隨時轉"。

2. **Scan:** Highlight text on a page or right-click and select "Convert to POJ".

    **Scan (轉網頁)：** 揀網頁文字，he̍k-chiá chhi̍h 電腦鼠正khí揀 "Convert to POJ" (掠規篇文章)。

3. **Type:** Switch to the "Type" tab to start typing TL.

    **Type (拍字轉)：** 切去 "Type" 子頁開始拍 TL。

4. **File:** Switch to the "File" tab to drag and drop files for conversion.

    **File (轉書類)：** 切去 "File" 分頁，giú 檔案來轉。

## License & Credits / 授權與感謝

* **License:** [MIT License](LICENSE)
* **Privacy:** See [PRIVACY.md](docs/PRIVACY.md) for our privacy policy and data handling practices.

    **隱私政策：** 請看 [PRIVACY.md](docs/PRIVACY.md) 了解阮 ê 隱私政策 kah 資料處理方式。

* **Third-Party Assets:** See [LEGAL.md](docs/LEGAL.md) for details on libraries and fonts used (PDF.js, Turndown, justfont Huninn Font, etc.).

    **第三方資源：** 請看 [LEGAL.md](docs/LEGAL.md) 了解阮使用 ê 外部程式庫 kah 字型 (PDF.js, Turndown, justfont 粉圓體等等) ê 詳細資訊。

---

© 2026 Cyber O͘-hîm ki-tē
