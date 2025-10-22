/**
 * Arduino 블록 프로그래밍 유틸리티 함수들 (Blockly 12.2.0 호환)
 * 코드 업데이트, 복사, 하이라이팅 등의 기능을 담당합니다.
 */

/**
 * 실시간 코드 업데이트 함수 (수정된 버전)
 */
function updateCode(event) { 
    try { 
        // workspace 존재 확인 (다양한 방법으로)
        const currentWorkspace = window.workspace || 
                                (typeof Blockly !== 'undefined' && Blockly.mainWorkspace) ||
                                workspace;
        
        if (!currentWorkspace) {
            console.warn('워크스페이스를 찾을 수 없습니다.');
            return;
        }
        
        // 코드 생성 시도
        let code = '';
        if (typeof Arduino !== 'undefined' && Arduino.workspaceToCode) {
            code = Arduino.workspaceToCode(currentWorkspace);
        } else if (typeof Blockly !== 'undefined' && Blockly.JavaScript) {
            code = Blockly.JavaScript.workspaceToCode(currentWorkspace);
        } else {
            code = '// 코드 생성기를 찾을 수 없습니다.';
        }
        
        // 코드 표시
        const codePreviewElement = document.getElementById('codePreview');
        if (codePreviewElement) {
            codePreviewElement.innerHTML = highlightArduinoCode(code);
        }
        
    } catch (e) { 
        console.error('코드 생성 오류:', e); 
        const codePreviewElement = document.getElementById('codePreview');
        if (codePreviewElement) {
            codePreviewElement.innerHTML = 
                '<span style="color: #ff6b6b;">코드 생성 중 오류가 발생했습니다. 블록 연결을 확인해주세요.</span>';
        }
    } 
}

/**
 * 코드 복사 함수 (개선된 버전)
 */
function copyCode() { 
    try {
        const codePreviewElement = document.getElementById('codePreview');
        if (!codePreviewElement) {
            console.error('코드 미리보기 요소를 찾을 수 없습니다.');
            return;
        }
        
        const codeText = codePreviewElement.textContent || codePreviewElement.innerText || '';
        
        if (!codeText.trim()) {
            showCopyFeedback(false, '복사할 코드가 없습니다.');
            return;
        }
        
        navigator.clipboard.writeText(codeText).then(() => {
            showCopyFeedback(true); // 성공
        }).catch(err => {
            console.error('Copy failed:', err);
            
            // 대안: 텍스트 선택 방식
            try {
                const textArea = document.createElement('textarea');
                textArea.value = codeText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopyFeedback(true);
            } catch (fallbackErr) {
                console.error('Fallback copy failed:', fallbackErr);
                showCopyFeedback(false); // 실패
            }
        });
    } catch (error) {
        console.error('copyCode 함수 오류:', error);
        showCopyFeedback(false);
    }
}

/**
 * 복사 완료 피드백 표시 (개선된 버전)
 */
function showCopyFeedback(isSuccess, customMessage = null) {
    try {
        const btn = document.querySelector('.copy-btn');
        if (!btn) {
            console.warn('복사 버튼을 찾을 수 없습니다.');
            return;
        }
        
        const originalText = btn.textContent || '📋 복사';
        
        // 메시지 결정
        let message;
        if (customMessage) {
            message = customMessage;
        } else if (isSuccess) {
            message = '✅ 복사됨!';
        } else {
            message = '❌ 복사 실패';
        }
        
        // 피드백 표시
        btn.textContent = message;
        btn.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545';
        
        // 원래 상태로 복원
        setTimeout(() => { 
            btn.textContent = originalText;
            btn.style.backgroundColor = ''; // 원래 색상으로
        }, 1500);
        
    } catch (error) {
        console.error('showCopyFeedback 함수 오류:', error);
    }
}

/**
 * Arduino 코드 신택스 하이라이팅 함수 (개선된 버전)
 */
function highlightArduinoCode(code) {
    try {
        // HTML 특수문자 이스케이프
        code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Arduino 키워드
        const keywords = [
            'void', 'int', 'float', 'char', 'byte', 'boolean', 'unsigned', 'long', 'short', 'double',
            'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return',
            'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'true', 'false', 'setup', 'loop',
            'const', 'static', 'volatile'
        ];
        code = code.replace(new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g'), 
                           '<span style="color: #569cd6; font-weight: bold;">$1</span>');
        
        // Arduino 함수들
        const functions = [
            'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead', 'pinMode', 'delay', 'delayMicroseconds',
            'Serial', 'begin', 'println', 'print', 'available', 'read', 'write', 'flush',
            'attach', 'detach', 'millis', 'micros', 'tone', 'noTone', 'pulseIn', 'shiftOut', 'shiftIn',
            'map', 'constrain', 'min', 'max', 'abs', 'sqrt', 'pow', 'sin', 'cos', 'tan',
            'random', 'randomSeed', 'sizeof', 'strlen', 'strcmp', 'strcpy'
        ];
        code = code.replace(new RegExp('\\b(' + functions.join('|') + ')\\b', 'g'), 
                           '<span style="color: #dcdcaa;">$1</span>');
        
        // 숫자
        code = code.replace(/\b(\d+\.?\d*[fFlL]?)\b/g, '<span style="color: #b5cea8;">$1</span>');
        
        // 문자열
        code = code.replace(/&quot;([^&]*)&quot;/g, '<span style="color: #ce9178;">&quot;$1&quot;</span>');
        code = code.replace(/\'([^'])\'/g, '<span style="color: #ce9178;">\'$1\'</span>');
        
        // 주석
        code = code.replace(/(\/\/.*$)/gm, '<span style="color: #6a9955; font-style: italic;">$1</span>');
        code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6a9955; font-style: italic;">$1</span>');
        
        // 전처리기 지시문
        code = code.replace(/(#.*$)/gm, '<span style="color: #9cdcfe;">$1</span>');
        
        return code;
        
    } catch (error) {
        console.error('코드 하이라이팅 오류:', error);
        return code; // 오류 시 원본 코드 반환
    }
}

/**
 * 안전한 전역 에러 핸들러 (개선된 버전)
 */
window.addEventListener('error', function(e) {
    // Script error는 CORS 정책으로 인한 것이므로 무시
    if (e.message === 'Script error.' && e.lineno === 0) {
        return; // 로그하지 않음
    }
    
    // 실제 오류만 로깅
    console.error('전역 에러 발생:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
    });
});

/**
 * Blockly 워크스페이스 이벤트 리스너 등록 (유틸리티)
 */
function setupWorkspaceListeners(workspace) {
    if (!workspace) return;
    
    try {
        // 코드 변경 이벤트 리스너
        workspace.addChangeListener(updateCode);
        console.log('워크스페이스 이벤트 리스너 등록 완료');
    } catch (error) {
        console.error('워크스페이스 리스너 등록 실패:', error);
    }
}

// 전역 함수로 내보내기 (필요한 경우)
if (typeof window !== 'undefined') {
    window.updateCode = updateCode;
    window.copyCode = copyCode;
    window.highlightArduinoCode = highlightArduinoCode;
    window.setupWorkspaceListeners = setupWorkspaceListeners;
}