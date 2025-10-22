/**
 * @file IDE 에디터 관리 모듈 - 번역 키 적용
 * @description Blockly 워크스페이스와 Monaco 에디터 관리를 담당하는 모듈
 */

window.IDEEditors = {
    workspace: null,       // Blockly 워크스페이스 인스턴스
    monacoEditor: null,    // Monaco 에디터 인스턴스
    currentMode: 'block',  // 현재 에디터 모드

    /**
     * Blockly 워크스페이스를 초기화하고 화면에 렌더링합니다.
     * 테마, 툴박스, 그리드 등을 설정합니다.
     */
    async initializeBlockly() {
        try {
            // 이벤트 블록 스타일 정의
            const eventBlockStyles = {
                'event_blocks': { 
                    'colourPrimary': '#FFAB19', 
                    'colourSecondary': '#FF8F00', 
                    'colourTertiary': '#FF6F00', 
                    'hat': 'cap' 
                },
                'logic_blocks': { 'colourPrimary': '#5CB1D6' },
                'math_blocks': { 'colourPrimary': '#59C059' },
                'text_blocks': { 'colourPrimary': '#82a52d' },
                'variable_blocks': { 'colourPrimary': '#98607F' },
                'procedure_blocks': { 'colourPrimary': '#8E61A3' }
            };

            // 커스텀 테마 생성
            window.eventTheme = Blockly.Theme.defineTheme('eventTheme', {
                'base': Blockly.Themes.Scratch,
                'blockStyles': eventBlockStyles
            });

            await this.createWorkspace();
        } catch (error) {
            console.error('Blockly 초기화 실패:', error);
        }
    },

    /**
     * Blockly 워크스페이스 인스턴스를 생성합니다.
     * 이 함수는 툴박스 생성 후 호출됩니다.
     */
    async createWorkspace() {
        return new Promise((resolve) => {
            try {
                if (this.workspace) this.workspace.dispose();

                const toolboxElement = document.getElementById('toolbox');
                const waitForToolbox = () => {
                    if (typeof generateToolbox === 'function') {
                        try {
                            console.log('툴박스 생성 시점 메시지 확인:', {
                                LOGIC_BOOLEAN_TRUE: Blockly.Msg.LOGIC_BOOLEAN_TRUE,
                                CONTROLS_IF_MSG_IF: Blockly.Msg.CONTROLS_IF_MSG_IF
                            });
                            toolboxElement.innerHTML = generateToolbox();
                            this.createWorkspaceWithToolbox(resolve);
                        } catch (error) {
                            console.error('툴박스 생성 오류:', error);
                            toolboxElement.innerHTML = '<xml></xml>';
                            this.createWorkspaceWithToolbox(resolve);
                        }
                    } else {
                        setTimeout(waitForToolbox, 100);
                    }
                };
                waitForToolbox();
            } catch (error) {
                console.error('워크스페이스 생성 오류:', error);
                resolve();
            }
        });
    },
    
    /**
     * 툴박스 XML이 준비된 후, 실제 Blockly.inject를 호출하여 워크스페이스를 생성합니다.
     * @param {function} resolve - Promise를 해결하는 함수
     */
    createWorkspaceWithToolbox(resolve) {
        try {
            const toolboxElement = document.getElementById('toolbox');
            console.log('[디버그] 툴박스 생성 시점 Blockly.Msg 상태:', 
                Object.keys(Blockly.Msg).length > 0 ? '로드됨' : '비어있음');

            this.workspace = Blockly.inject('blocklyDiv', {
                    toolbox: toolboxElement,
                    renderer: 'zelos',
                    theme: window.eventTheme,
                    grid: {
                        spacing: 0,   // 0보다는 20~40 정도가 좋아
                        length: 3,
                        colour: '#ccc',
                        snap: true
                    },
                    zoom: {
                        controls: true,
                        wheel: false,
                        startScale: 0.8
                    },
                    trashcan: true,
                    scrollbars: true,
                    sounds: true,
                    move: {
                        scrollbars: true,   // 스크롤바 드래그로 이동
                        drag: true,         // 마우스로 화면 끌어서 이동
                        wheel: true         // 마우스 휠로 이동
                    }
                    });


            // 워크스페이스 변경 리스너 등록
            this.workspace.addChangeListener(() => this.updateCode());

            // Arduino 초기화
            if (typeof Arduino !== 'undefined' && Arduino.init) {
                Arduino.init(this.workspace);
            }

            this.updateControlBlockColors();
            console.log('Blockly 워크스페이스 생성 완료');

            setTimeout(() => {
                this.updateCode();
                if (this.workspace) {
                    this.workspace.updateToolbox(toolboxElement);
                }
                resolve();
            }, 100);

        } catch (error) {
            console.error('워크스페이스 생성 실패:', error);
            resolve();
        }
    },

    /**
     * 언어 변경과 같이 워크스페이스를 새로 그려야 할 때 호출됩니다.
     * 현재 블록 상태를 XML로 저장한 후, 워크스페이스를 재생성하고 블록을 복원합니다.
     */
    async recreateWorkspace() {
        const oldXml = this.workspace ? Blockly.Xml.workspaceToDom(this.workspace) : null;
        await this.createWorkspace();
        if (oldXml) {
            try {
                Blockly.Xml.domToWorkspace(oldXml, this.workspace);
            } catch (e) {
                console.warn('블록 복원 중 오류:', e);
            }
        }
    },

    /**
     * Monaco 텍스트 에디터를 초기화합니다.
     * RequireJS를 사용하여 비동기적으로 로드됩니다.
     * RTL 언어 지원을 위한 설정이 추가되었습니다.
     */
    async initializeMonaco() {
        return new Promise((resolve, reject) => {
            require.config({
                paths: {
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.0/min/vs'
                }
            });

            require(['vs/editor/editor.main'], () => {
                try {
                    const monacoDiv = document.getElementById('monacoEditor');
                    
                    // RTL 언어 대응: Monaco 에디터는 항상 LTR 방향 유지
                    this.monacoEditor = monaco.editor.create(monacoDiv, {
                        value: window.IDEI18n ? window.IDEI18n.getMsg('template_arduino') : '// Arduino 코드를 여기에 작성하세요',
                        language: 'cpp',
                        theme: 'vs-dark',
                        automaticLayout: true,
                        minimap: { enabled: window.innerWidth > 1200 },
                        
                        // RTL 언어 대응 설정 추가
                        wordWrap: 'on',
                        renderControlCharacters: false,
                        renderWhitespace: 'none',
                        // Monaco 에디터 자체는 direction 옵션이 없으므로 DOM에서 처리
                    });

                    // RTL 언어 대응: 에디터 컨테이너의 방향성 강제 설정
                    this.forceMonacoLTRDirection(monacoDiv);

                    console.log('Monaco 에디터 초기화 완료 (RTL 대응 포함)');
                    
                    // 컴파일 버튼 활성화
                    const compileBtn = document.getElementById('compileBtn');
                    if (compileBtn) {
                        compileBtn.disabled = false;
                    }

                    resolve();
                } catch (error) {
                    console.error('Monaco 에디터 초기화 실패:', error);
                    reject(error);
                }
            });
        });
    },

    /**
     * Monaco 에디터를 강제로 LTR 방향으로 설정합니다.
     * RTL 언어에서도 코드가 정상적으로 표시되도록 합니다.
     * @param {HTMLElement} monacoDiv - Monaco 에디터 컨테이너 DOM 요소
     */
    forceMonacoLTRDirection(monacoDiv) {
        // 에디터 컨테이너 자체를 LTR로 강제 설정
        monacoDiv.style.direction = 'ltr';
        monacoDiv.style.textAlign = 'left';
        monacoDiv.setAttribute('dir', 'ltr');
        
        // 추가 안전장치: Monaco 에디터 내부 요소들도 LTR 강제
        setTimeout(() => {
            const monacoElements = monacoDiv.querySelectorAll('.monaco-editor, .overflow-guard, .monaco-scrollable-element');
            monacoElements.forEach(element => {
                element.style.direction = 'ltr';
                element.style.textAlign = 'left';
            });
            
            // 텍스트 입력 영역도 LTR로 설정
            const textareas = monacoDiv.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.style.direction = 'ltr';
                textarea.style.textAlign = 'left';
            });
        }, 100);
    },

    /**
     * 블록코딩 모드와 텍스트코딩 모드 간의 UI 전환을 처리합니다.
     * @param {string} mode - 전환할 모드 ('block' 또는 'text')
     */
    switchMode(mode) {
        this.currentMode = mode;
        const isBlockMode = mode === 'block';

        // 모드 버튼 활성화 상태 변경
        const blockModeBtn = document.getElementById('blockModeBtn');
        const textModeBtn = document.getElementById('textModeBtn');
        
        if (blockModeBtn) blockModeBtn.classList.toggle('active', isBlockMode);
        if (textModeBtn) textModeBtn.classList.toggle('active', !isBlockMode);

        // UI 레이아웃 변경
        const editorArea = document.getElementById('editorArea');
        const blocklyPanel = document.getElementById('blocklyPanel');
        const codePreview = document.getElementById('codePreview');
        const monacoEditor = document.getElementById('monacoEditor');

        if (editorArea) editorArea.classList.toggle('text-mode', !isBlockMode);
        if (blocklyPanel) blocklyPanel.classList.toggle('hidden', !isBlockMode);
        if (codePreview) codePreview.style.display = isBlockMode ? 'block' : 'none';
        if (monacoEditor) monacoEditor.classList.toggle('hidden', isBlockMode);

        // UI 텍스트 업데이트
        if (window.IDEI18n) {
            window.IDEI18n.updateUITexts();
        }

        // 텍스트 모드로 전환 시 Monaco 에디터 설정
        if (!isBlockMode && this.monacoEditor) {
            setTimeout(() => {
                // RTL 언어 대응: Monaco 에디터 방향성 재설정
                const monacoDiv = document.getElementById('monacoEditor');
                if (monacoDiv) {
                    this.forceMonacoLTRDirection(monacoDiv);
                }
                
                this.monacoEditor.layout();
                const generatedCode = this.generateArduinoCode();
                if (generatedCode && generatedCode.trim() && 
                    !generatedCode.includes('블록을 배치하면')) {
                    this.monacoEditor.setValue(generatedCode);
                }
            }, 100);
        }

        // 로그 출력 - 번역 키 적용
        const modeName = isBlockMode ? 
            (window.IDEI18n ? window.IDEI18n.getMsg('mode_block', '블록코딩') : '블록코딩') :
            (window.IDEI18n ? window.IDEI18n.getMsg('mode_text', '텍스트코딩') : '텍스트코딩');
        
        window.IDEUtils.logToConsole(
            (window.IDEI18n ? window.IDEI18n.getMsg('mode_switch_message', '{modeName} 모드로 전환되었습니다.') : '{modeName} 모드로 전환되었습니다.')
                .replace('{modeName}', modeName)
        );
    },

    /**
     * Blockly 워크스페이스에 변경이 있을 때마다 호출되어 실시간으로 코드를 업데이트합니다.
     */
    updateCode() {
        if (this.currentMode === 'block' && this.workspace) {
            const code = this.generateArduinoCode();
            const codePreview = document.getElementById('codePreview');
            if (codePreview) {
                const initialMsg = window.IDEI18n ? 
                    window.IDEI18n.getMsg('codePreview_initial', '// 블록을 배치하면 여기에 코드가 생성됩니다.') :
                    '// 블록을 배치하면 여기에 코드가 생성됩니다.';
                codePreview.textContent = code || initialMsg;
            }
        }
    },

    /**
     * Blockly 워크스페이스의 블록들을 Arduino C++ 코드로 변환합니다.
     * @returns {string} 생성된 Arduino C++ 코드
     */
    generateArduinoCode() {
        try {
            if (typeof Arduino !== 'undefined' && Arduino.workspaceToCode) {
                return Arduino.workspaceToCode(this.workspace);
            } else if (typeof Blockly !== 'undefined') {
                return Blockly.JavaScript.workspaceToCode(this.workspace);
            }
            return '// 코드 생성기를 로드할 수 없습니다.';
        } catch (error) {
            console.error('코드 생성 오류:', error);
            return '// 코드 생성 중 오류가 발생했습니다.';
        }
    },

    /**
     * 현재 활성화된 에디터(Blockly 또는 Monaco)의 코드를 반환합니다.
     * @returns {string} 현재 에디터의 코드
     */
    getCurrentCode() {
        return this.currentMode === 'block' ? 
            this.generateArduinoCode() : 
            (this.monacoEditor ? this.monacoEditor.getValue() : '');
    },

    /**
     * 내장 제어 블록들의 색상을 주황색 계열로 변경하여 가시성을 높입니다.
     */
    updateControlBlockColors() {
        if (this._controlColorsPatched) return;
        this._controlColorsPatched = true;

        const controlBlocks = [
            'controls_if', 'controls_repeat_ext', 'controls_whileUntil', 
            'controls_for', 'controls_flow_statements'
        ];

        controlBlocks.forEach(blockType => {
            const blk = Blockly.Blocks[blockType];
            if (!blk || !blk.init || blk._colorPatched) return;

            const originalInit = blk.init;
            blk.init = function() {
                originalInit.call(this);
                this.setColour('#FF9800');
            };
            blk._colorPatched = true;
        });
    },

    /**
     * 보드 선택 시 텍스트 에디터의 기본 템플릿 코드를 해당 보드에 맞게 변경합니다.
     * @param {string} boardType - 선택된 보드 유형
     */
    updateEditorTemplate(boardType) {
        const templates = {
            arduino: window.IDEI18n ? window.IDEI18n.getMsg('template_arduino', '// Arduino 코드') : '// Arduino 코드',
            esp32: window.IDEI18n ? window.IDEI18n.getMsg('template_esp32', '// ESP32 코드') : '// ESP32 코드',
            pico: window.IDEI18n ? window.IDEI18n.getMsg('template_pico', '// Raspberry Pi Pico 코드') : '// Raspberry Pi Pico 코드'
        };

        let template = templates.arduino;
        if (boardType && boardType.startsWith('esp32')) {
            template = templates.esp32;
        } else if (boardType && boardType.includes('pico')) {
            template = templates.pico;
        }

        // 텍스트 모드이고 Monaco 에디터가 있으며, 현재 코드가 비어있거나 기본 템플릿인 경우에만 변경
        if (this.currentMode === 'text' && this.monacoEditor) {
            const currentCode = this.monacoEditor.getValue().trim();
            if (!currentCode || Object.values(templates).some(t => t.trim() === currentCode)) {
                this.monacoEditor.setValue(template);
            }
        }
    },

    /**
     * 현재 워크스페이스를 XML 형태로 반환합니다.
     * @returns {string} XML 형태의 워크스페이스 데이터
     */
    getWorkspaceXml() {
        if (!this.workspace) return null;
        const xml = Blockly.Xml.workspaceToDom(this.workspace);
        return Blockly.Xml.domToText(xml);
    },

    /**
     * XML 데이터를 워크스페이스에 로드합니다.
     * @param {string} xmlString - XML 형태의 워크스페이스 데이터
     */
    loadWorkspaceFromXml(xmlString) {
        if (!this.workspace || !xmlString) return;
        try {
            const xml = Blockly.utils.xml.textToDom(xmlString);
            this.workspace.clear();
            Blockly.Xml.domToWorkspace(xml, this.workspace);
        } catch (error) {
            console.error('XML 로드 실패:', error);
        }
    }
};