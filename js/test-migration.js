/**
 * @file 모듈화 마이그레이션 테스트 스크립트
 * @description 분리된 모듈들이 정상 작동하는지 자동으로 검증
 * @usage 브라우저 콘솔에서 실행: testMigration()
 */

window.testMigration = function() {
    console.log('🧪 === IDE 모듈화 마이그레이션 테스트 시작 ===');
    
    const results = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };

    function test(name, testFn) {
        results.total++;
        try {
            const result = testFn();
            if (result) {
                results.passed++;
                results.details.push(`✅ ${name}`);
                console.log(`✅ ${name}`);
            } else {
                results.failed++;
                results.details.push(`❌ ${name}: 검증 실패`);
                console.error(`❌ ${name}: 검증 실패`);
            }
        } catch (error) {
            results.failed++;
            results.details.push(`❌ ${name}: ${error.message}`);
            console.error(`❌ ${name}:`, error);
        }
    }

    // 1. 모듈 로딩 검증
    console.log('\n📦 1. 모듈 로딩 검증');
    test('IDEUtils 모듈 로딩', () => typeof window.IDEUtils === 'object');
    test('IDEI18n 모듈 로딩', () => typeof window.IDEI18n === 'object');
    test('IDEEditors 모듈 로딩', () => typeof window.IDEEditors === 'object');
    test('IDEFileManager 모듈 로딩', () => typeof window.IDEFileManager === 'object');
    test('IDEServerComm 모듈 로딩', () => typeof window.IDEServerComm === 'object');
    test('IntegratedArduinoIDE 클래스 정의', () => typeof window.IntegratedArduinoIDE === 'function');

    // 2. 메인 IDE 인스턴스 검증
    console.log('\n🎯 2. 메인 IDE 인스턴스 검증');
    test('window.arduinoIDE 존재', () => typeof window.arduinoIDE === 'object');
    test('currentMode 속성', () => typeof window.arduinoIDE?.currentMode === 'string');
    test('elements 객체', () => typeof window.arduinoIDE?.elements === 'object');

    // 3. 핵심 메서드 존재 검증
    console.log('\n⚙️ 3. 핵심 메서드 존재 검증');
    const ide = window.arduinoIDE;
    if (ide) {
        test('switchMode 메서드', () => typeof ide.switchMode === 'function');
        test('changeLanguage 메서드', () => typeof ide.changeLanguage === 'function');
        test('saveWorkspace 메서드', () => typeof ide.saveWorkspace === 'function');
        test('loadWorkspace 메서드', () => typeof ide.loadWorkspace === 'function');
        test('compileCode 메서드', () => typeof ide.compileCode === 'function');
        test('uploadCode 메서드', () => typeof ide.uploadCode === 'function');
        test('getCurrentCode 메서드', () => typeof ide.getCurrentCode === 'function');
        test('logToConsole 메서드', () => typeof ide.logToConsole === 'function');
    }

    // 4. DOM 요소 연결 검증
    console.log('\n🔗 4. DOM 요소 연결 검증');
    const requiredElements = [
        'blockModeBtn', 'textModeBtn', 'editorArea', 'blocklyPanel',
        'monacoEditor', 'codePreview', 'languageSelect', 'boardSelect',
        'compileBtn', 'uploadBtn', 'saveBtn', 'loadBtn', 'consoleOutput'
    ];
    
    requiredElements.forEach(elementId => {
        test(`DOM 요소: ${elementId}`, () => {
            const element = document.getElementById(elementId);
            return element !== null;
        });
    });

    // 5. Blockly 워크스페이스 검증
    console.log('\n🧩 5. Blockly 워크스페이스 검증');
    test('Blockly 라이브러리 로딩', () => typeof window.Blockly === 'object');
    test('워크스페이스 인스턴스', () => {
        return IDEEditors.workspace && typeof IDEEditors.workspace.dispose === 'function';
    });
    test('툴박스 존재', () => {
        const toolbox = document.getElementById('toolbox');
        return toolbox && toolbox.innerHTML.trim().length > 0;
    });

    // 6. Monaco 에디터 검증
    console.log('\n📝 6. Monaco 에디터 검증');
    test('Monaco 라이브러리 로딩', () => typeof window.monaco === 'object');
    test('Monaco 에디터 인스턴스', () => {
        return IDEEditors.monacoEditor && typeof IDEEditors.monacoEditor.getValue === 'function';
    });

    // 7. 다국어 시스템 검증
    console.log('\n🌐 7. 다국어 시스템 검증');
    test('i18n 시스템 로딩', () => typeof window.i18n === 'object');
    test('Blockly 메시지 객체', () => typeof window.Blockly?.Msg === 'object');
    test('번역 메시지 개수', () => Object.keys(window.Blockly?.Msg || {}).length > 50);

    // 8. 유틸리티 함수 검증
    console.log('\n🛠️ 8. 유틸리티 함수 검증');
    test('formatBytes 함수', () => {
        const result = IDEUtils.formatBytes(1024);
        return result === '1 KB';
    });
    test('getMsg 함수', () => {
        const result = IDEI18n.getMsg('test_key', 'default_value');
        return result === 'default_value';
    });

    // 9. 실제 기능 테스트
    console.log('\n🎮 9. 실제 기능 테스트');
    test('코드 생성 기능', () => {
        try {
            const code = IDEEditors.generateArduinoCode();
            return typeof code === 'string';
        } catch (e) {
            return false;
        }
    });

    test('모드 전환 기능', () => {
        try {
            const originalMode = ide.currentMode;
            const newMode = originalMode === 'block' ? 'text' : 'block';
            ide.switchMode(newMode);
            const switched = ide.currentMode === newMode;
            ide.switchMode(originalMode); // 원복
            return switched;
        } catch (e) {
            return false;
        }
    });

    // 10. 이벤트 리스너 검증
    console.log('\n🎪 10. 이벤트 리스너 검증');
    test('블록 모드 버튼 이벤트', () => {
        const btn = document.getElementById('blockModeBtn');
        return btn && btn.onclick !== null;
    });
    test('언어 선택 이벤트', () => {
        const select = document.getElementById('languageSelect');
        return select && select.onchange !== null;
    });

    // 결과 요약 출력
    console.log('\n📊 === 테스트 결과 요약 ===');
    console.log(`총 테스트: ${results.total}개`);
    console.log(`성공: ${results.passed}개`);
    console.log(`실패: ${results.failed}개`);
    console.log(`성공률: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('🎉 모든 테스트 통과! 모듈화 마이그레이션이 성공적으로 완료되었습니다.');
    } else {
        console.log('⚠️ 일부 테스트 실패. 아래 실패 항목을 확인하세요:');
        results.details.filter(detail => detail.startsWith('❌')).forEach(detail => {
            console.log(detail);
        });
    }

    return results;
};

// 페이지 로드 후 자동 실행 (선택사항)
document.addEventListener('DOMContentLoaded', () => {
    // 5초 후 자동 테스트 실행 (IDE 초기화 완료 대기)
    setTimeout(() => {
        if (window.location.search.includes('autotest=true')) {
            testMigration();
        }
    }, 5000);
});

console.log('✅ 테스트 스크립트 로드 완료. testMigration() 함수를 실행하여 테스트를 시작하세요.');