/**
 * @file IDE 유틸리티 모듈
 * @description 공통으로 사용되는 헬퍼 함수들을 모아둔 모듈
 */

window.IDEUtils = {
    /**
     * 바이트 단위를 사람이 읽기 쉬운 KB, MB 단위로 변환합니다.
     * @param {number} bytes - 변환할 바이트 값
     * @returns {string} 변환된 문자열
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 하단 콘솔 패널에 타임스탬프와 함께 로그 메시지를 출력합니다.
     * @param {string} message - 출력할 메시지
     * @param {boolean} isRaw - 타임스탬프 없이 원본 그대로 출력할지 여부
     */
    logToConsole(message, isRaw = false) {
        const consoleEl = document.getElementById('consoleOutput');
        if (!consoleEl) return;
        
        const timestamp = new Date().toLocaleTimeString();
        consoleEl.textContent += isRaw ? message : `[${timestamp}] ${message}\n`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
    },

    /**
     * 콘텐츠를 파일로 다운로드하는 헬퍼 함수입니다.
     * @param {Blob} blob - 파일의 콘텐츠 
     * @param {string} filename - 저장할 파일 이름
     */
    downloadFile(blob, filename) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    },

    /**
     * 동적으로 스크립트 파일을 로드하는 Promise 기반 함수입니다.
     * RequireJS와의 충돌을 피하기 위한 안전장치가 포함되어 있습니다.
     * @param {string} url - 로드할 스크립트의 URL
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // 기존 언어 스크립트 제거 (충돌 방지)
            const existingScripts = document.querySelectorAll(`script[src*="/msg/"]`);
            existingScripts.forEach(s => s.remove());

            const script = document.createElement('script');
            script.src = url;
            script.async = false;
            script.onload = () => {
                console.log(`스크립트 로드 완료: ${url}`);
                setTimeout(resolve, 50);
            };
            script.onerror = () => {
                console.error(`스크립트 로드 실패: ${url}`);
                reject(new Error(`Script load error for ${url}`));
            };
            document.head.appendChild(script);
        });
    },

    /**
     * HTML 문서에서 자주 사용하는 DOM 요소들을 미리 찾아 객체에 저장합니다.
     * 매번 document.getElementById를 호출하는 것을 방지하여 성능을 향상시킵니다.
     * @param {Array<string>} elementIds - 캐싱할 요소 ID 배열
     * @returns {object} 요소 ID를 키로 하고 DOM 요소를 값으로 하는 객체
     */
    cacheElements(elementIds) {
        const elements = {};
        elementIds.forEach(id => {
            elements[id] = document.getElementById(id);
        });
        return elements;
    },

    /**
     * 현재 코드를 사용자의 클립보드에 복사합니다.
     * @param {string} code - 복사할 코드 내용
     * @returns {Promise<boolean>} 복사 성공 여부
     */
    async copyCodeToClipboard(code) {
        try {
            await navigator.clipboard.writeText(code);
            this.logToConsole(window.IDEI18n ? window.IDEI18n.getMsg('js_log_codeCopiedSuccess', '코드가 클립보드에 복사되었습니다.') : '코드가 클립보드에 복사되었습니다.');
            return true;
        } catch (error) {
            this.logToConsole(window.IDEI18n ? window.IDEI18n.getMsg('js_log_codeCopiedFail', '클립보드 복사에 실패했습니다.') : '클립보드 복사에 실패했습니다.');
            return false;
        }
    },

    /**
     * 보드 유형에 따라 보드 표시기의 스타일을 업데이트합니다.
     * @param {string} boardType - 선택된 보드 유형
     * @param {HTMLElement} indicator - 보드 표시기 DOM 요소
     */
    updateBoardIndicator(boardType, indicator) {
        if (!indicator) return;
        
        indicator.textContent = boardType.toUpperCase();
        indicator.className = 'board-indicator';
        
        if (['uno', 'nano', 'mega'].includes(boardType)) {
            indicator.classList.add('board-arduino');
        } else if (boardType.startsWith('esp32')) {
            indicator.classList.add('board-esp32');
        } else if (boardType.includes('pico')) {
            indicator.classList.add('board-pico');
        }
    },

    /**
     * 디버그 정보를 콘솔과 화면 로그에 동시에 출력합니다.
     * @param {string} context - 디버그 컨텍스트 (예: '초기화', '컴파일' 등)
     * @param {any} data - 출력할 데이터
     */
    debug(context, data) {
        const debugMsg = `[DEBUG:${context}] ${JSON.stringify(data)}`;
        console.log(debugMsg);
        this.logToConsole(debugMsg);
    },

    /**
     * 요소가 화면에 보이는지 확인합니다.
     * @param {HTMLElement} element - 확인할 DOM 요소
     * @returns {boolean} 보이는지 여부
     */
    isElementVisible(element) {
        return element && element.offsetParent !== null;
    },

    /**
     * 간단한 지연 함수 (Promise 기반)
     * @param {number} ms - 지연할 밀리초
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};