/**
 * @file IDE 메인 코어 클래스 (정적 서비스용) - 번역 키 적용
 * @description PC 에이전트와 직접 통신하는 통합 Arduino IDE의 메인 클래스
 */

class IntegratedArduinoIDE {
    /**
     * IDE의 모든 상태와 컴포넌트를 초기화하는 생성자 함수입니다.
     */
    constructor() {
        // --- 클래스 속성 정의 ---
        this.currentMode = 'block';  // 현재 에디터 모드 ('block' | 'text')
        this.serverUrl = 'http://localhost:8080'; // PC 에이전트 주소로 변경
        this.elements = {}; // 자주 사용하는 DOM 요소를 캐싱하는 객체

        // --- 초기화 메서드 호출 ---
        this.initElements();       // UI 요소 캐싱
        this.initEventListeners(); // 이벤트 리스너 등록
        this.initialize();         // 전체 IDE 시스템 초기화 시작
    }

    //================================================================
    // 1. 초기화 및 설정 (Initialization & Setup)
    //================================================================

    /**
     * HTML 문서에서 자주 사용하는 DOM 요소들을 미리 찾아 this.elements 객체에 저장합니다.
     * 매번 document.getElementById를 호출하는 것을 방지하여 성능을 향상시킵니다.
     */
    initElements() {
        const elementIds = [
            'blockModeBtn', 'textModeBtn', 'editorArea', 'blocklyPanel',
            'monacoEditor', 'codePreview', 'languageSelect', 'languageStatus',
            'compileBtn', 'uploadBtn', 'boardSelect', 'boardIndicator',
            'portSelect', 'refreshPortsBtn', 'consoleOutput', 'copyBtn',
            'saveBtn', 'loadBtn', 'loadFile', 'fileNameInput', 'codeTitle',
            'agentStatusIndicator', 'loadingText'
        ];

        this.elements = window.IDEUtils.cacheElements(elementIds);
    }

    /**
     * 사용자의 상호작용을 처리하기 위해 각 UI 요소에 이벤트 리스너를 등록합니다.
     */
    initEventListeners() {
        // 모드 전환 버튼
        if (this.elements.blockModeBtn) {
            this.elements.blockModeBtn.addEventListener('click', () => this.switchMode('block'));
        }
        if (this.elements.textModeBtn) {
            this.elements.textModeBtn.addEventListener('click', () => this.switchMode('text'));
        }

        // 언어 선택
        if (this.elements.languageSelect) {
            this.elements.languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }

        // 파일 관리
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => this.saveWorkspace());
        }
        if (this.elements.loadBtn) {
            this.elements.loadBtn.addEventListener('click', () => this.elements.loadFile.click());
        }
        if (this.elements.loadFile) {
            this.elements.loadFile.addEventListener('change', (e) => this.loadWorkspace(e));
        }
        if (this.elements.copyBtn) {
            this.elements.copyBtn.addEventListener('click', () => this.copyCode());
        }

        // 보드 및 컴파일
        if (this.elements.boardSelect) {
            this.elements.boardSelect.addEventListener('change', () => {
                this.updateBoardIndicator();
                this.updateEditorTemplate();
            });
        }
        if (this.elements.compileBtn) {
            this.elements.compileBtn.addEventListener('click', () => this.compileCode());
        }
        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', () => this.uploadCode());
        }

        // 포트 관리
        if (this.elements.refreshPortsBtn) {
            this.elements.refreshPortsBtn.addEventListener('click', () => this.requestPorts());
        }
    }

    /**
     * IDE의 모든 구성 요소를 순서대로 초기화하는 메인 함수입니다.
     * 페이지 로딩 시 한 번만 호출됩니다.
     */
    async initialize() {
        try {
            console.log('=== 정적 웹 IDE 초기화 시작 ===');

            // 1. 다국어 시스템 초기화 (가장 먼저)
            await window.IDEI18n.initialize();
            await window.IDEUtils.delay(100);

            // 2. Arduino 커스텀 블록 정의
            if (typeof window.defineArduinoBlocks === 'function') {
                window.defineArduinoBlocks();
                console.log('Arduino 커스텀 블록 정의 완료');
            }

            // 3. 에디터 초기화
            await window.IDEEditors.initializeBlockly();
            await window.IDEEditors.initializeMonaco();

            // 4. UI 초기 상태 설정
            this.updateBoardIndicator();
            window.IDEI18n.updateUITexts(); // 초기 UI 번역 적용

            // 5. PC 에이전트 연결 상태 확인
            await this.checkAgentConnection();

            // 6. PC 에이전트 통신 초기화
            window.IDEServerComm.initWebSocket();

            // 7. 초기화 완료 로그
            window.IDEUtils.logToConsole(
                window.IDEI18n.getMsg('system_ready', '✅ 정적 웹 Arduino IDE 초기화 완료')
            );

        } catch (error) {
            console.error('초기화 실패:', error);
            window.IDEUtils.logToConsole(
                window.IDEI18n.getMsg('system_init_fail', '⚠️ 시스템 초기화에 실패했습니다.')
            );
        } finally {
            // 로딩 오버레이 숨기기
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    /**
     * PC 에이전트 연결 상태를 확인하고 UI에 표시합니다.
     */
    async checkAgentConnection() {
        try {
            const isConnected = await window.IDEServerComm.checkAgentConnection();
            const statusIndicator = this.elements.agentStatusIndicator || 
                                  document.getElementById('agentStatusIndicator');
            
            if (statusIndicator) {
                if (isConnected) {
                    statusIndicator.textContent = '🟢 연결됨';
                    statusIndicator.className = 'agent-status connected';
                    window.IDEUtils.logToConsole(
                        window.IDEI18n.getMsg('agent_connected', '🔗 PC 에이전트와 연결되었습니다.')
                    );
                } else {
                    statusIndicator.textContent = '🔴 연결 안됨';
                    statusIndicator.className = 'agent-status disconnected';
                    window.IDEUtils.logToConsole(
                        window.IDEI18n.getMsg('agent_not_found', '⚠️ PC 에이전트를 찾을 수 없습니다. 에이전트를 설치하고 실행해주세요.')
                    );
                }
            }
            
            return isConnected;
        } catch (error) {
            console.error('에이전트 연결 확인 실패:', error);
            return false;
        }
    }

    //================================================================
    // 2. 모듈 연결 메서드들 (Module Bridge Methods)
    //================================================================

    /**
     * 언어 변경을 다국어 모듈에 위임합니다.
     * @param {string} newLanguage - 변경할 언어 코드
     */
    async changeLanguage(newLanguage) {
        await window.IDEI18n.changeLanguage(newLanguage);
    }

    /**
     * 모드 전환을 에디터 모듈에 위임합니다.
     * @param {string} mode - 전환할 모드 ('block' 또는 'text')
     */
    switchMode(mode) {
        this.currentMode = mode;
        window.IDEEditors.currentMode = mode;
        window.IDEEditors.switchMode(mode);
    }

    /**
     * 워크스페이스 저장을 파일 관리 모듈에 위임합니다.
     */
    saveWorkspace() {
        window.IDEFileManager.saveWorkspace();
    }

    /**
     * 워크스페이스 로드를 파일 관리 모듈에 위임합니다.
     * @param {Event} event - 파일 입력 이벤트
     */
    loadWorkspace(event) {
        window.IDEFileManager.loadWorkspace(event);
    }

    /**
     * 코드 복사를 파일 관리 모듈에 위임합니다.
     */
    copyCode() {
        window.IDEFileManager.copyCode();
    }

    /**
     * 코드 컴파일을 서버 통신 모듈에 위임합니다.
     */
    async compileCode() {
        // 컴파일 전 에이전트 연결 상태 확인
        const isConnected = await this.checkAgentConnection();
        if (!isConnected) {
            window.IDEUtils.logToConsole(
                window.IDEI18n.getMsg('agent_connection_required', '❌ PC 에이전트에 연결할 수 없습니다. 에이전트를 먼저 실행해주세요.')
            );
            return;
        }
        
        window.IDEServerComm.compileCode();
    }

    /**
     * 코드 업로드를 서버 통신 모듈에 위임합니다.
     */
    async uploadCode() {
        // 업로드 전 에이전트 연결 상태 확인
        const isConnected = await this.checkAgentConnection();
        if (!isConnected) {
            window.IDEUtils.logToConsole(
                window.IDEI18n.getMsg('agent_connection_required', '❌ PC 에이전트에 연결할 수 없습니다. 에이전트를 먼저 실행해주세요.')
            );
            return;
        }
        
        window.IDEServerComm.uploadCode();
    }

    /**
     * 포트 요청을 서버 통신 모듈에 위임합니다.
     */
    async requestPorts() {
        // 포트 요청 전 에이전트 연결 상태 확인
        const isConnected = await this.checkAgentConnection();
        if (!isConnected) {
            window.IDEUtils.logToConsole(
                window.IDEI18n.getMsg('agent_connection_required', '❌ PC 에이전트에 연결할 수 없습니다. 에이전트를 먼저 실행해주세요.')
            );
            return;
        }
        
        window.IDEServerComm.requestPorts();
    }

    //================================================================
    // 3. UI 업데이트 메서드들 (UI Update Methods)
    //================================================================

    /**
     * 상단 툴바에 현재 선택된 보드의 종류를 표시하고 색상을 변경합니다.
     */
    updateBoardIndicator() {
        const boardType = this.elements.boardSelect ? this.elements.boardSelect.value : 'uno';
        window.IDEUtils.updateBoardIndicator(boardType, this.elements.boardIndicator);
    }

    /**
     * 보드 선택 시 텍스트 에디터의 기본 템플릿 코드를 해당 보드에 맞게 변경합니다.
     */
    updateEditorTemplate() {
        const boardType = this.elements.boardSelect ? this.elements.boardSelect.value : 'uno';
        window.IDEEditors.updateEditorTemplate(boardType);
    }

    //================================================================
    // 4. 유틸리티 메서드들 (Utility Methods)
    //================================================================

    /**
     * 현재 활성화된 에디터의 코드를 반환합니다.
     * @returns {string} 현재 에디터의 코드
     */
    getCurrentCode() {
        return window.IDEEditors.getCurrentCode();
    }

    /**
     * 콘솔에 로그 메시지를 출력합니다.
     * @param {string} message - 출력할 메시지
     * @param {boolean} isRaw - 원본 형태로 출력할지 여부
     */
    logToConsole(message, isRaw = false) {
        window.IDEUtils.logToConsole(message, isRaw);
    }

    /**
     * 번역 메시지를 가져옵니다.
     * @param {string} key - 번역 키
     * @param {string} defaultText - 기본 텍스트
     * @returns {string} 번역된 텍스트
     */
    getMsg(key, defaultText = key) {
        return window.IDEI18n.getMsg(key, defaultText);
    }

    /**
     * IDE 시스템 정보를 반환합니다.
     * @returns {object} 시스템 정보
     */
    getSystemInfo() {
        return {
            version: '2.0.0',
            mode: 'static',
            currentMode: this.currentMode,
            currentLanguage: window.IDEI18n.getCurrentLanguage(),
            hasBlocklyWorkspace: !!(window.IDEEditors && window.IDEEditors.workspace),
            hasMonacoEditor: !!(window.IDEEditors && window.IDEEditors.monacoEditor),
            isWebSocketConnected: !!(window.IDEServerComm && window.IDEServerComm.websocket),
            agentUrl: window.IDEServerComm ? window.IDEServerComm.serverUrl : this.serverUrl
        };
    }

    /**
     * IDE를 정리하고 리소스를 해제합니다.
     */
    cleanup() {
        if (window.IDEServerComm) {
            window.IDEServerComm.closeWebSocket();
        }
        if (window.IDEEditors && window.IDEEditors.workspace) {
            window.IDEEditors.workspace.dispose();
        }
        if (window.IDEEditors && window.IDEEditors.monacoEditor) {
            window.IDEEditors.monacoEditor.dispose();
        }
        console.log('IDE 정리 완료');
    }
}

//================================================================
// DOM 로드 완료 후 IDE 초기화 실행
//================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Monaco Editor를 위한 RequireJS 설정
    require.config({
        paths: {
            'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs'
        }
    });

    // Monaco Editor 로드 완료 후 IDE 인스턴스 생성
    require(['vs/editor/editor.main'], () => {
        try {
            // 전역 IDE 인스턴스 생성
            window.arduinoIDE = new IntegratedArduinoIDE();
            
            // 브라우저 종료 시 정리 작업
            window.addEventListener('beforeunload', () => {
                if (window.arduinoIDE) {
                    window.arduinoIDE.cleanup();
                }
            });

            console.log('✅ 정적 웹 IDE 인스턴스 생성 완료');
        } catch (error) {
            console.error('❌ IDE 인스턴스 생성 실패:', error);
        }
    });
});