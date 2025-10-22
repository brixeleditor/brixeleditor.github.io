/**
 * @file IDE 서버 통신 모듈 (정적 서비스용) - 번역 키 적용
 * @description PC 에이전트와의 로컬 통신을 담당하는 모듈 (컴파일, 업로드, WebSocket 등)
 */

window.IDEServerComm = {
    serverUrl: 'http://localhost:8080',  // PC 에이전트 주소로 변경
    websocket: null,                     // WebSocket 연결 인스턴스
    sketchId: null,                      // 컴파일 후 생성된 스케치 ID
    compiledBoard: null,                 // 컴파일이 완료된 보드 타입

    /**
     * WebSocket을 통해 PC 에이전트로 로그 메시지를 전송합니다.
     * @param {string} message - 전송할 로그 메시지
     */
    sendLogToServer(message) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const logData = {
                type: 'log',
                payload: message
            };
            this.websocket.send(JSON.stringify(logData));
        } else {
            console.warn('WebSocket is not connected. Log was not sent to the agent.');
        }
    },

    /**
     * [변경] 콘솔에 로그를 기록하고, PC 에이전트로도 로그를 전송합니다. (사용자 행동 로그용)
     * @param {string} message - 기록할 메시지
     * @param {boolean} isRaw - 원본 텍스트(Raw) 그대로 출력할지 여부
     */
    logAndSend(message, isRaw = false) {
        window.IDEUtils.logToConsole(message, isRaw); // UI 콘솔에 로그 표시
        this.sendLogToServer(message);                // PC 에이전트로 로그 전송
    },

    /**
     * [추가] 웹 에디터의 콘솔에만 로그를 기록합니다. (자동 상태 로그용)
     * @param {string} message - 기록할 메시지
     * @param {boolean} isRaw - 원본 텍스트(Raw) 그대로 출력할지 여부
     */
    logToConsoleOnly(message, isRaw = false) {
        window.IDEUtils.logToConsole(message, isRaw); // UI 콘솔에만 로그 표시
    },

    /**
     * PC 에이전트에 코드 컴파일을 요청합니다.
     */
    async compileCode() {
        this.logAndSend(
            window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_start', '코드 컴파일을 시작합니다.') : '코드 컴파일을 시작합니다.'
        );
        
        const currentMode = window.IDEEditors ? window.IDEEditors.currentMode : 'block';
        this.logAndSend(
            (window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_mode', '현재 모드: {modeName}') : '현재 모드: {modeName}')
                .replace('{modeName}', currentMode)
        );

        const code = window.IDEEditors ? window.IDEEditors.getCurrentCode() : '';
        
        // 코드 유효성 검사
        const initialMsg = window.IDEI18n ? window.IDEI18n.getMsg('codePreview_initial', '// 블록을 배치하면 여기에 코드가 생성됩니다.') : '// 블록을 배치하면 여기에 코드가 생성됩니다.';
        if (!code.trim() || code.includes(initialMsg)) {
            this.logAndSend(
                window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_no_code', '컴파일할 코드가 없습니다.') : '컴파일할 코드가 없습니다.'
            );
            return;
        }

        // 버튼 상태 변경
        const compileBtn = document.getElementById('compileBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        
        if (compileBtn) compileBtn.disabled = true;
        if (uploadBtn) uploadBtn.disabled = true;

        try {
            const boardSelect = document.getElementById('boardSelect');
            const selectedBoard = boardSelect ? boardSelect.value : 'uno';

            // PC 에이전트 연결 상태 확인
            const isAgentConnected = await this.checkAgentConnection();
            if (!isAgentConnected) {
                this.logAndSend(
                    window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_no_connection', '❌ PC 에이전트에 연결할 수 없습니다. 에이전트가 실행 중인지 확인해주세요.') : '❌ PC 에이전트에 연결할 수 없습니다. 에이전트가 실행 중인지 확인해주세요.'
                );
                return;
            }

            const response = await fetch(`${this.serverUrl}/api/compile`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    code: code, 
                    board: selectedBoard,
                    autoInstallLibs: true
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success) {
                this.sketchId = result.sketchId;
                this.compiledBoard = result.board;
                
                if (uploadBtn) uploadBtn.disabled = false;
                
                const sizeText = result.size ? window.IDEUtils.formatBytes(result.size) : '알 수 없음';
                const memoryText = result.memoryUsage ? ` (메모리 ${result.memoryUsage}% 사용)` : '';
                
                this.logAndSend(
                    (window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_success', '✅ 컴파일 완료! 크기: {size}') : '✅ 컴파일 완료! 크기: {size}')
                        .replace('{size}', sizeText + memoryText)
                );
            } else {
                this.logAndSend(
                    (window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_fail', '❌ 컴파일 실패: {errorMsg}') : '❌ 컴파일 실패: {errorMsg}')
                        .replace('{errorMsg}', result.error || '알 수 없는 오류')
                );
            }
        } catch (error) {
            console.error('컴파일 요청 실패:', error);
            let errorMsg = error.message;
            
            if (error.message.includes('fetch')) {
                errorMsg = window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_no_connection', 'PC 에이전트에 연결할 수 없습니다.') : 'PC 에이전트에 연결할 수 없습니다.';
            }
            
            this.logAndSend(
                (window.IDEI18n ? window.IDEI18n.getMsg('agent_compile_request_fail', '❌ 컴파일 요청 실패: {errorMsg}') : '❌ 컴파일 요청 실패: {errorMsg}')
                    .replace('{errorMsg}', errorMsg)
            );
        } finally {
            if (compileBtn) compileBtn.disabled = false;
        }
    },

    /**
     * 컴파일된 펌웨어를 보드에 업로드합니다.
     */
    async uploadCode() {
        if (!this.sketchId) {
            this.logAndSend(
                window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_need_compile', '업로드하기 전에 먼저 컴파일을 해주세요.') : '업로드하기 전에 먼저 컴파일을 해주세요.'
            );
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) uploadBtn.disabled = true;

        try {
            const boardSelect = document.getElementById('boardSelect');
            const portSelect = document.getElementById('portSelect');
            
            const requestData = {
                sketchId: this.sketchId,
                board: boardSelect ? boardSelect.value : 'uno',
                port: portSelect ? (portSelect.value || null) : null
            };

            const response = await fetch(`${this.serverUrl}/api/upload`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.logAndSend(
                    window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_request_sent', '📤 업로드 요청을 전송했습니다.') : '📤 업로드 요청을 전송했습니다.'
                );
            } else {
                this.logAndSend(
                    (window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_fail', '❌ 업로드 실패: {errorMsg}') : '❌ 업로드 실패: {errorMsg}')
                        .replace('{errorMsg}', result.error || '알 수 없는 오류')
                );
            }

        } catch (error) {
            console.error('업로드 요청 실패:', error);
            
            let errorMsg = error.message;
            if (error.message.includes('fetch')) {
                errorMsg = window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_no_connection', 'PC 에이전트에 연결할 수 없습니다.') : 'PC 에이전트에 연결할 수 없습니다.';
            }
            
            this.logAndSend(
                (window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_request_fail', '❌ 업로드 요청 실패: {errorMsg}') : '❌ 업로드 요청 실패: {errorMsg}')
                    .replace('{errorMsg}', errorMsg)
            );
        } finally {
            // 2초 후 업로드 버튼 재활성화
            setTimeout(() => {
                if (uploadBtn) uploadBtn.disabled = false;
            }, 2000);
        }
    },

    /**
     * PC 에이전트에게 시리얼 포트 목록을 요청합니다.
     */
    async requestPorts() {
        try {
            this.logAndSend(
                window.IDEI18n ? window.IDEI18n.getMsg('agent_port_request', '🔍 포트 목록을 요청합니다...') : '🔍 포트 목록을 요청합니다...'
            );

            const response = await fetch(`${this.serverUrl}/api/ports`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success && result.ports) {
                this.updatePortList(result.ports);
            } else {
                this.logAndSend(
                    window.IDEI18n ? window.IDEI18n.getMsg('agent_port_not_available', '⚠️ 포트 목록을 가져올 수 없었습니다.') : '⚠️ 포트 목록을 가져올 수 없었습니다.'
                );
            }

        } catch (error) {
            console.error('포트 요청 실패:', error);
            
            let errorMsg = error.message;
            if (error.message.includes('fetch')) {
                errorMsg = window.IDEI18n ? window.IDEI18n.getMsg('agent_upload_no_connection', 'PC 에이전트에 연결할 수 없습니다.') : 'PC 에이전트에 연결할 수 없습니다.';
            }
            
            this.logAndSend(
                window.IDEI18n ? window.IDEI18n.getMsg('agent_port_request_fail', '포트 목록 요청에 실패했습니다.') : '포트 목록 요청에 실패했습니다.'
            );
        }
    },
    
    /**
     * 포트 목록으로 UI를 업데이트합니다.
     * @param {Array<object>} ports - 포트 정보를 담은 객체 배열
     */
    updatePortList(ports) {
        const portSelect = document.getElementById('portSelect');
        if (!portSelect) return;

        const currentVal = portSelect.value;
        
        const autoSelectMsg = window.IDEI18n ? window.IDEI18n.getMsg('portAutoSelect', '포트 자동 선택') : '포트 자동 선택';
        portSelect.innerHTML = `<option value="">${autoSelectMsg}</option>`;

        ports.forEach(port => {
            const option = document.createElement('option');
            option.value = port.path;
            option.textContent = `${port.path} (${port.name})`;
            portSelect.appendChild(option);
        });

        if (ports.some(p => p.path === currentVal)) {
            portSelect.value = currentVal;
        }

        this.logAndSend(
            (window.IDEI18n ? window.IDEI18n.getMsg('agent_port_list_updated', '포트 목록 업데이트 완료 ({portCount}개)') : '포트 목록 업데이트 완료 ({portCount}개)')
                .replace('{portCount}', ports.length)
        );
    },
    
    /**
     * PC 에이전트와의 WebSocket 연결을 초기화합니다.
     */
    initWebSocket() {
        try {
            const wsUrl = `ws://localhost:8081`;
            this.websocket = new WebSocket(wsUrl);

            // [변경] 자동 연결 상태 메시지는 콘솔에만 표시하도록 logToConsoleOnly 사용
            this.websocket.onopen = () => {
                this.logToConsoleOnly(
                    window.IDEI18n ? window.IDEI18n.getMsg('websocket_connected', '🌐 PC 에이전트에 연결되었습니다.') : '🌐 PC 에이전트에 연결되었습니다.'
                );
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (e) {
                    // 에이전트로부터 받은 로그는 logAndSend를 통해 다시 보내지 않도록 logToConsoleOnly 사용
                    this.logToConsoleOnly(event.data, true);
                }
            };

            this.websocket.onclose = () => {
                this.logToConsoleOnly(
                    window.IDEI18n ? window.IDEI18n.getMsg('websocket_disconnected', '🔌 PC 에이전트와의 연결이 끊어졌습니다.') : '🔌 PC 에이전트와의 연결이 끊어졌습니다.'
                );
            };

            this.websocket.onerror = () => {
                this.logToConsoleOnly(
                    window.IDEI18n ? window.IDEI18n.getMsg('websocket_error', '❌ PC 에이전트 연결 오류가 발생했습니다.') : '❌ PC 에이전트 연결 오류가 발생했습니다.'
                );
            };

        } catch (error) {
            console.warn('WebSocket 연결 실패:', error);
            this.logToConsoleOnly(
                window.IDEI18n ? window.IDEI18n.getMsg('websocket_unavailable', '⚠️ 실시간 통신을 사용할 수 없습니다.') : '⚠️ 실시간 통신을 사용할 수 없습니다.'
            );
        }
    },

    /**
     * WebSocket으로 수신된 메시지를 처리합니다.
     * @param {object} data - 수신된 데이터 객체
     */
    handleWebSocketMessage(data) {
        // 에이전트로부터 받은 메시지는 다시 에이전트로 보낼 필요가 없으므로 logToConsoleOnly 사용
        switch (data.type) {
            case 'port-list':
                this.updatePortList(data.payload);
                break;
                
            case 'compile-progress':
                this.logToConsoleOnly(
                    (window.IDEI18n ? window.IDEI18n.getMsg('compile_progress', '🔄 컴파일 진행: {message}') : '🔄 컴파일 진행: {message}')
                        .replace('{message}', data.payload.message)
                );
                break;
                
            case 'upload-progress':
                this.logToConsoleOnly(
                    (window.IDEI18n ? window.IDEI18n.getMsg('upload_progress', '📤 업로드 진행: {message}') : '📤 업로드 진행: {message}')
                        .replace('{message}', data.payload.message)
                );
                break;
                
            case 'error':
                this.logToConsoleOnly(
                    (window.IDEI18n ? window.IDEI18n.getMsg('agent_error', '❌ 오류: {message}') : '❌ 오류: {message}')
                        .replace('{message}', data.payload.message)
                );
                break;
                
            case 'log':
                this.logToConsoleOnly(data.payload.message, data.payload.raw || false);
                break;
                
            default:
                console.log('알 수 없는 WebSocket 메시지:', data);
        }
    },

    /**
     * PC 에이전트 연결 상태를 확인합니다.
     * @returns {Promise<boolean>} 에이전트 연결 상태
     */
    async checkAgentConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.serverUrl}/api/health`, {
                method: 'GET',
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const isConnected = data.success === true;
                
                if (window.updateAgentStatus) {
                    window.updateAgentStatus(isConnected);
                }
                
                return isConnected;
            } else {
                if (window.updateAgentStatus) {
                    window.updateAgentStatus(false);
                }
                return false;
            }
        } catch (error) {
            console.warn('PC 에이전트 연결 확인 실패:', error.message);
            
            if (window.updateAgentStatus) {
                window.updateAgentStatus(false);
            }
            return false;
        }
    },

    /**
     * WebSocket 연결을 종료합니다.
     */
    closeWebSocket() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    },

    /**
     * PC 에이전트 URL을 변경합니다.
     * @param {string} newUrl - 새로운 에이전트 URL
     */
    setServerUrl(newUrl) {
        this.serverUrl = newUrl;
        console.log('PC 에이전트 URL 변경됨:', newUrl);
    }
};