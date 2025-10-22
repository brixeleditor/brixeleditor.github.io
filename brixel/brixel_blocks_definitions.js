/**
 * STEP-3 Final Version:
 * - All hardcoded Korean strings have been replaced with BKY message keys.
 * - All dropdown options now correctly reference BKY message keys.
 * - This file is now fully synchronized with the updated en.json.
 */
/**
 * 개발자 : 김석전, alphaco@kakao.com
 * Arduino 블록 정의 파일 (다국어 지원 버전 - 완전판)
 * - 모든 텍스트가 번역 메시지 키로 대체됨
 * - 원본의 모든 블록 정의 포함
 */

// ★★★ 핵심 수정: 헬퍼 함수들을 전역 스코프로 이동 ★★★
// 편의를 위한 메시지 함수 (전역)

/* msg() removed (migration to %{BKY_*}) */
// 기존 헬퍼 함수들을 전역 스코프로 이동
function getProcedureParams(block) {
    const args = [];
    let argumentNames = [];
    
    if (block.getVars && typeof block.getVars === 'function') {
        argumentNames = block.getVars();
    } else if (block.arguments_) {
        argumentNames = block.arguments_;
    } else if (block.parameterNames_) {
        argumentNames = block.parameterNames_;
    }
    
    for (let i = 0; i < argumentNames.length; i++) {
        let varName;
        if (typeof argumentNames[i] === 'string') {
            varName = argumentNames[i];
        } else if (block.workspace && block.workspace.getVariableById) {
            const variable = block.workspace.getVariableById(argumentNames[i]);
            varName = variable ? variable.name : 'param' + i;
        } else {
            varName = 'param' + i;
        }
        args.push('float ' + varName);
    }
    
    return { args, argumentNames };
}

function getProcedureCallArgs(block, generator) {
    const args = [];
    const { argumentNames } = getProcedureParams(block);
    
    for (let i = 0; i < argumentNames.length; i++) {
        const argValue = generator.valueToCode(block, 'ARG' + i, Arduino.ORDER_COMMA) || '0';
        args.push(argValue);
    }
    
    return args;
}

function debugProcedureBlock(block) {
    console.log('=== 함수 블록 디버깅 ===');
    console.log('블록 타입:', block.type);
    console.log('함수 이름:', block.getFieldValue('NAME'));
    console.log('getVars 함수 존재:', typeof block.getVars);
    console.log('arguments_ 속성:', block.arguments_);
    console.log('parameterNames_ 속성:', block.parameterNames_);
    
    if (block.getVars && typeof block.getVars === 'function') {
        console.log('getVars() 결과:', block.getVars());
    }
    
    console.log('입력들:', Object.keys(block.inputList || {}));
    
    for (let i = 0; i < 10; i++) {
        const argInput = block.getInput('ARG' + i);
        if (argInput && argInput.connection && argInput.connection.targetBlock()) {
            console.log('ARG' + i + ' 연결됨:', argInput.connection.targetBlock().type);
        }
    }
    console.log('========================');
}
/* ============== Field: Matrix Pixel Picker (8x8 / 8x16) ============== */
(function(){
  class FieldMatrix extends Blockly.Field {
    constructor(value, config){ super(value || ""); this.W=(config&&config.w)||8; this.H=(config&&config.h)||8; }
    static fromJson(opts){ return new FieldMatrix(opts["value"], opts); }
    showEditor_(){
      const w=this.W, h=this.H;
      let bits=this.getValue(); if(!bits || bits.length!==w*h) bits="0".repeat(w*h);
      const wrap=document.createElement('div'); wrap.style.padding='6px';
      const grid=document.createElement('div');
      grid.style.display='grid'; grid.style.gridTemplateColumns=`repeat(${w},16px)`; grid.style.gridGap='2px';
      for(let y=0;y<h;y++){
        for(let x=0;x<w;x++){
          const idx=y*w+x; const cell=document.createElement('div');
          cell.style.width='16px'; cell.style.height='16px';
          cell.style.border='1px solid #999'; cell.style.cursor='pointer';
          const paint=()=>{ cell.style.background = (bits[idx]==='1') ? '#d33' : '#eee'; }; paint();
          cell.addEventListener('click', ()=>{ bits=bits.substring(0,idx)+(bits[idx]==='1'?'0':'1')+bits.substring(idx+1); paint(); this.setValue(bits); });
          grid.appendChild(cell);
        }
      }
      wrap.appendChild(grid);
      Blockly.DropDownDiv.getContentDiv().innerHTML='';
      Blockly.DropDownDiv.getContentDiv().appendChild(wrap);
      Blockly.DropDownDiv.setColour('#fff','#ddd');
      Blockly.DropDownDiv.showPositionedByField(this);
    }
    getText(){ const b=this.getValue()||""; let on=0; for(const c of b) if(c==='1') on++; return `${this.W}x${this.H}:${on}`; }
  }
  Blockly.fieldRegistry.register('field_matrix', FieldMatrix);
})();

function defineArduinoBlocks() {
    // 번역된 메시지로 블록 정의 배열을 동적 생성 - Part 1
    const blockDefinitions = [

// 1. ===============================================================메인 카테고리
        {
            "type": "arduino_uno_starts_up",
            "message0": Blockly.Msg.BKY_ARDUINO_STARTS_UP || "When MCU Board Starts Up!",
            "nextStatement": null,
            "style": "event_blocks",
            "tooltip": Blockly.Msg.BKY_ARDUINO_STARTS_UP_TOOLTIP || "Includes essential libraries when the program starts."
        },
        {
            "type": "arduino_setup",
            "message0": Blockly.Msg.BKY_ARDUINO_SETUP || "Setup",
            "message1": "%1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "SETUP"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#FFAB19",
            "tooltip": Blockly.Msg.BKY_ARDUINO_SETUP_TOOLTIP || "Setup function runs once at startup."
        },
        {
            "type": "arduino_loop",
            "message0": Blockly.Msg.BKY_ARDUINO_LOOP || "Loop",
            "message1": "%1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "LOOP"
                }
            ],
            "previousStatement": null,
            "colour": "#FFAB19",
            "tooltip": Blockly.Msg.BKY_ARDUINO_LOOP_TOOLTIP || "Loop function runs continuously."
        },

// 2. ===============================================================핀제어 카테고리
        {
            "type": "pin_mode",
            "message0": Blockly.Msg.BKY_PIN_MODE || "Set Pin %1 to %2",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "field_dropdown", "name": "MODE", "options": [
                    [Blockly.Msg.BKY_INPUT || "Input", "INPUT"], 
                    [Blockly.Msg.BKY_OUTPUT || "Output", "OUTPUT"]
                ]}
            ],
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_PIN_MODE_TOOLTIP || "Sets pin mode to INPUT or OUTPUT."
        },
        {
            "type": "read_digital_pin",
            "message0": Blockly.Msg.BKY_READ_DIGITAL_PIN || "Read Digital Pin %1",
            "args0": [{ "type": "input_value", "name": "PIN", "check": "Number" }],
            "output": "Boolean", 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_READ_DIGITAL_PIN_TOOLTIP || "Read digital value from pin."
        },
        {
            "type": "set_digital_pin",
            "message0": Blockly.Msg.BKY_SET_DIGITAL_PIN || "Set Digital Pin %1 to %2",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "field_dropdown", "name":"STATE","options":[[Blockly.Msg.BKY_HIGH || "High","HIGH"],[Blockly.Msg.BKY_LOW || "Low","LOW"]] }
            ],
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_SET_DIGITAL_PIN_TOOLTIP || "Set digital pin to HIGH or LOW."
        },
        {
            "type": "read_analog_pin",
            "message0": Blockly.Msg.BKY_READ_ANALOG_PIN || "Read Analog Pin %1",
            "args0": [{ "type": "input_value", "name": "PIN", "check": "Number" }],
            "output": "Number", 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_READ_ANALOG_PIN_TOOLTIP || "Read analog value from pin."
        },
        {
            "type": "set_pwm_pin",
            "message0": Blockly.Msg.BKY_SET_PWM_PIN || "Set PWM Pin %1 to %2",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "input_value", "name": "VALUE", "check": "Number" }
            ],
            "inputsInline": true, 
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_SET_PWM_PIN_TOOLTIP || "Set PWM value on pin."
        },
        {
            "type": "servo_setup",
            "message0": Blockly.Msg.BKY_SERVO_SETUP || "Setup Servo on Pin %1",
            "args0": [{ "type": "input_value", "name": "PIN", "check": "Number" }],
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_SERVO_SETUP_TOOLTIP || "Initialize servo on specified pin."
        },
        {
            "type": "set_servo_angle",
            "message0": Blockly.Msg.BKY_SET_SERVO_ANGLE || "Set Servo Pin %1 to Angle %2",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "input_value", "name": "ANGLE", "check": "Number" }
            ],
            "inputsInline": true, 
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_SET_SERVO_ANGLE_TOOLTIP || "Set servo to specified angle."
        },
        {
            "type": "tone_out",
            "message0": Blockly.Msg.BKY_TONE_OUT || "Play Tone Pin %1 Frequency %2 Duration %3",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "input_value", "name": "FREQUENCY", "check": "Number" },
                { "type": "input_value", "name": "DURATION", "check": "Number" }
            ],
            "inputsInline": true, 
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_TONE_OUT_TOOLTIP || "Play tone on pin with frequency and duration."
        },
        {
            "type": "no_tone",
            "message0": Blockly.Msg.BKY_NO_TONE || "Stop Tone Pin %1",
            "args0": [{ "type": "input_value", "name": "PIN", "check": "Number" }],
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_NO_TONE_TOOLTIP || "Stop tone on pin."
        },
        {
            "type": "delay_ms",
            "message0": Blockly.Msg.BKY_DELAY_MS || "Delay %1 milliseconds",
            "args0": [{ "type": "input_value", "name": "DELAY_TIME", "check": "Number" }],
            "inputsInline": true, 
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#FF9800",
            "tooltip": Blockly.Msg.BKY_DELAY_MS_TOOLTIP || "Pause execution for specified milliseconds."
        },
        {
            "type": "timer_millis",
            "message0": Blockly.Msg.BKY_TIMER_MILLIS || "Timer (milliseconds)",
            "output": "Number", 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_TIMER_MILLIS_TOOLTIP || "Get current time in milliseconds."
        },
        {
            "type": "timer_reset",
            "message0": Blockly.Msg.BKY_TIMER_RESET || "Reset Timer %1",
            "args0": [
                {
                    "type": "input_value", 
                    "name": "TIMER_NUM",
                    "check": "Number"
                }
            ],
            "previousStatement": null,
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_TIMER_RESET_TOOLTIP || "Reset specified timer."
        },
        {
            "type": "timer_non_blocking_delay",
            "message0": Blockly.Msg.BKY_TIMER_NON_BLOCKING_DELAY || "Every %1 milliseconds",
            "args0": [
                {
                    "type": "input_value",
                    "name": "INTERVAL",
                    "check": "Number"
                }
            ],
            "message1": "%1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_TIMER_NON_BLOCKING_DELAY_TOOLTIP || "Execute code at specified intervals."
        },
        {
            "type": "arduino_interrupt",
            "message0": Blockly.Msg.BKY_ARDUINO_INTERRUPT || "When Pin %1 %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "PIN",
                    "check": "Number"
                },
                {
                    "type": "field_dropdown",
                    "name": "MODE",
                    "options": [
                        [Blockly.Msg.BKY_INTERRUPT_RISING || "Rising", "RISING"],
                        [Blockly.Msg.BKY_INTERRUPT_FALLING || "Falling", "FALLING"],
                        [Blockly.Msg.BKY_INTERRUPT_CHANGE || "Change", "CHANGE"]
                    ]
                }
            ],
            "message1": "%1",
            "args1": [
                {
                    "type": "input_statement",
                    "name": "DO"
                }
            ],
            "inputsInline": true,
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_ARDUINO_INTERRUPT_TOOLTIP || "Execute code when pin state changes."
        },
        {
            "type": "pulse_in",
            "message0": Blockly.Msg.BKY_PULSE_IN || "Measure Pulse Pin %1 State %2 Timeout %3",
            "args0": [
                { "type": "input_value", "name": "PIN", "check": "Number" },
                { "type": "field_dropdown", "name":"STATE","options":[[Blockly.Msg.BKY_HIGH || "High","HIGH"],[Blockly.Msg.BKY_LOW || "Low","LOW"]] },
                { "type": "input_value", "name": "TIMEOUT", "check": "Number" }
            ],
            "output": "Number", 
            "colour": "#6190DF", 
            "inputsInline": true,
            "tooltip": Blockly.Msg.BKY_PULSE_IN_TOOLTIP || "Measure pulse duration on pin."
        },
        {
            "type": "shift_out",
            "message0": Blockly.Msg.BKY_SHIFT_OUT || "Shift Out Data Pin %1 Clock Pin %2 Latch Pin %3",
            "inputsInline": true,
            "args0": [
                { "type": "input_value", "name": "DATA_PIN", "check": "Number" },
                { "type": "input_value", "name": "CLOCK_PIN", "check": "Number" },
                { "type": "input_value", "name": "LATCH_PIN", "check": "Number" }
            ],
            "message1": Blockly.Msg.BKY_SHIFT_OUT_VALUE || "%1 Value %2",
            "args1": [
                { "type": "field_dropdown", "name": "BIT_ORDER", "options": [
                    [Blockly.Msg.BKY_SHIFT_MSB_FIRST || "MSB First", "MSBFIRST"], 
                    [Blockly.Msg.BKY_SHIFT_LSB_FIRST || "LSB First", "LSBFIRST"]
                ]},
                { "type": "input_value", "name": "VALUE", "check": "Number" }
            ],
            "previousStatement": null, 
            "nextStatement": null, 
            "colour": "#6190DF",
            "tooltip": Blockly.Msg.BKY_SHIFT_OUT_TOOLTIP || "Shift out data to shift register."
        }
    ];
    
    // 첫 번째 배치의 블록들을 등록
    Blockly.common.defineBlocksWithJsonArray(blockDefinitions);


// Part 2: 제어, 텍스트, 색상, 변수, 함수 카테고리
const blockDefinitionsPart2 = [

// 3. ===============================================================제어 카테고리
    {
        "type": "wait_until",
        "message0": Blockly.Msg.BKY_WAIT_UNTIL || "Wait Until %1",
        "args0": [{ "type": "input_value", "name": "CONDITION", "check": "Boolean" }],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF9800",
        "tooltip": Blockly.Msg.BKY_WAIT_UNTIL_TOOLTIP || "Wait until condition becomes true."
    },

// 6. ===============================================================텍스트 카테고리
    {
        "type": "custom_text_join",
        "message0": Blockly.Msg.BKY_CUSTOM_TEXT_JOIN || "Join %1 %2",
        "args0": [
            { "type": "input_value", "name": "TEXT1" },
            { "type": "input_value", "name": "TEXT2" }
        ],
        "output": "String",
        "colour": "#82a52d",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_CUSTOM_TEXT_JOIN_TOOLTIP || "Join two text strings together."
    },
    {
        "type": "custom_text_char_at",
        "message0": Blockly.Msg.BKY_CUSTOM_TEXT_CHAR_AT || "Character at index %2 of %1",
        "args0": [
            { "type": "input_value", "name": "TEXT" },
            { "type": "input_value", "name": "INDEX", "check": "Number" }
        ],
        "output": "String",
        "colour": "#82a52d",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_CUSTOM_TEXT_CHAR_AT_TOOLTIP || "Get character at specified index."
    },
    {
        "type": "custom_text_length",
        "message0": Blockly.Msg.BKY_CUSTOM_TEXT_LENGTH || "Length of %1",
        "args0": [
            { "type": "input_value", "name": "TEXT" }
        ],
        "output": "Number",
        "colour": "#82a52d",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_CUSTOM_TEXT_LENGTH_TOOLTIP || "Get length of text string."
    },
    {
        "type": "custom_text_contains",
        "message0": Blockly.Msg.BKY_CUSTOM_TEXT_CONTAINS || "%1 contains %2",
        "args0": [
            { "type": "input_value", "name": "TEXT" },
            { "type": "input_value", "name": "SUBSTRING" }
        ],
        "output": "Boolean",
        "colour": "#82a52d",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_CUSTOM_TEXT_CONTAINS_TOOLTIP || "Check if text contains substring."
    },

// 7. ==========================================================색상 카테고리
    {
        "type": "colour_picker_custom",
        "message0": Blockly.Msg.BKY_COLOUR_PICKER || "Color %1",
        "args0": [
            {
                "type": "field_colour",
                "name": "COLOUR",
                "colour": "#ff0000"
            }
        ],
        "output": "Colour",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_PICKER_TOOLTIP || "Pick a color."
    },
    {
        "type": "colour_random_custom", 
        "message0": Blockly.Msg.BKY_COLOUR_RANDOM || "Random Color",
        "output": "Colour",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_RANDOM_TOOLTIP || "Generate random color."
    },
    {
        "type": "colour_rgb_custom",
        "message0": Blockly.Msg.BKY_COLOUR_RGB || "Color Red %1 Green %2 Blue %3",
        "args0": [
            { "type": "input_value", "name": "RED", "check": "Number" },
            { "type": "input_value", "name": "GREEN", "check": "Number" },
            { "type": "input_value", "name": "BLUE", "check": "Number" }
        ],
        "inputsInline": true,
        "output": "Colour",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_RGB_TOOLTIP || "Create color from RGB values."
    },
    {
        "type": "colour_blend_custom",
        "message0": Blockly.Msg.BKY_COLOUR_BLEND || "Blend %1 and %2 ratio %3",
        "args0": [
            { "type": "input_value", "name": "COLOUR1", "check": "Colour" },
            { "type": "input_value", "name": "COLOUR2", "check": "Colour" },
            { "type": "input_value", "name": "RATIO", "check": "Number" }
        ],
        "inputsInline": true,
        "output": "Colour",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_BLEND_TOOLTIP || "Blend two colors."
    },
    {
        "type": "colour_to_hex",
        "message0": Blockly.Msg.BKY_COLOUR_TO_HEX || "Color %1 to hex",
        "args0": [
            { "type": "input_value", "name": "COLOUR", "check": "Colour" }
        ],
        "output": "String",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_TO_HEX_TOOLTIP || "Convert color to hex string."
    },
    {
        "type": "colour_to_rgb_values",
        "message0": Blockly.Msg.BKY_COLOUR_TO_RGB_VALUES || "%2 value of %1",
        "args0": [
            { "type": "input_value", "name": "COLOUR", "check": "Colour" },
            { "type": "field_dropdown", "name": "COMPONENT", "options": [
                [Blockly.Msg.BKY_RED || "Red", "RED"], 
                [Blockly.Msg.BKY_GREEN || "Green", "GREEN"], 
                [Blockly.Msg.BKY_BLUE || "Blue", "BLUE"]
            ]}
        ],
        "output": "Number",
        "colour": "#A855F7",
        "tooltip": Blockly.Msg.BKY_COLOUR_TO_RGB_VALUES_TOOLTIP || "Get RGB component value."
    },

// 8. ===============================================================변수 카테고리
    {
        "type": "number_variable_set",
        "message0": Blockly.Msg.BKY_NUMBER_VARIABLE_SET || "Set %1 to %2",
        "args0": [
            { "type": "field_variable", "name": "VAR", "variable": "item" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#98607F",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_NUMBER_VARIABLE_SET_TOOLTIP || "Set variable to a value."
    },
    {
        "type": "number_variable_get",
        "message0": Blockly.Msg.BKY_NUMBER_VARIABLE_GET || "%1",
        "args0": [
            { "type": "field_variable", "name": "VAR", "variable": "item" }
        ],
        "output": "Number",
        "colour": "#98607F",
        "tooltip": Blockly.Msg.BKY_NUMBER_VARIABLE_GET_TOOLTIP || "Get variable value."
    },
    {
        "type": "string_variable_set",
        "message0": Blockly.Msg.BKY_STRING_VARIABLE_SET || "Set %1 to %2",
        "args0": [
            { "type": "field_variable", "name": "VAR", "variable": "item" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#98607F",
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_STRING_VARIABLE_SET_TOOLTIP || "Set string variable to a value."
    },
    {
        "type": "string_variable_get",
        "message0": Blockly.Msg.BKY_STRING_VARIABLE_GET || "%1",
        "args0": [
            { "type": "field_variable", "name": "VAR", "variable": "item" }
        ],
        "output": "String",
        "colour": "#98607F",
        "tooltip": Blockly.Msg.BKY_STRING_VARIABLE_GET_TOOLTIP || "Get string variable value."
    },
// 8-1. ======================================================리스트 카테고리
// ===== 배열 생성 및 초기화 블록 (통합) =====
    {
        "type": "array_create",
        "message0": Blockly.Msg.BKY_ARRAY_CREATE || "create array %1 type %2 with values %3",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "field_dropdown", "name": "TYPE", "options": [
                [Blockly.Msg.BKY_ARRAY_TYPE_INT || "integer", "int"],
                [Blockly.Msg.BKY_ARRAY_TYPE_FLOAT || "decimal", "float"],
                [Blockly.Msg.BKY_ARRAY_TYPE_CHAR || "character", "char"]
            ]},
            {"type": "input_value", "name": "VALUES", "check": ["String", "Number"]}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_CREATE_TIP || "Create an array with initial values"
    },
    {
        "type": "array_create_empty",
        "message0": Blockly.Msg.BKY_ARRAY_CREATE_EMPTY || "create empty array %1 type %2 size %3",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "field_dropdown", "name": "TYPE", "options": [
                [Blockly.Msg.BKY_ARRAY_TYPE_INT || "integer", "int"],
                [Blockly.Msg.BKY_ARRAY_TYPE_FLOAT || "decimal", "float"],
                [Blockly.Msg.BKY_ARRAY_TYPE_CHAR || "character", "char"]
            ]},
            {"type": "input_value", "name": "SIZE", "check": "Number"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_CREATE_EMPTY_TIP || "Create an empty array with specified size"
    },
    {
        "type": "array_get",
        "message0": Blockly.Msg.BKY_ARRAY_GET || "get array %1 at index %2",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "input_value", "name": "INDEX", "check": "Number"}
        ],
        "output": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_GET_TIP || "Get value from array at specified index"
    },
    {
        "type": "array_set",
        "message0": Blockly.Msg.BKY_ARRAY_SET || "set array %1 at index %2 to %3",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "input_value", "name": "INDEX", "check": "Number"},
            {"type": "input_value", "name": "VALUE", "check": "Number"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_SET_TIP || "Set array value at specified index"
    },
    {
        "type": "array_append",
        "message0": Blockly.Msg.BKY_ARRAY_APPEND || "append %1 to array %2",
        "args0": [
            {"type": "input_value", "name": "VALUE", "check": "Number"},
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_APPEND_TIP || "Add value to end of array"
    },
    {
        "type": "array_remove",
        "message0": Blockly.Msg.BKY_ARRAY_REMOVE || "remove from array %1 at index %2",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "input_value", "name": "INDEX", "check": "Number"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_REMOVE_TIP || "Remove value from array at specified index"
    },
    {
        "type": "array_find",
        "message0": Blockly.Msg.BKY_ARRAY_FIND || "find %1 in array %2",
        "args0": [
            {"type": "input_value", "name": "VALUE", "check": "Number"},
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"}
        ],
        "output": "Number",
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_FIND_TIP || "Find value in array and return index (-1 if not found)"
    },
    {
        "type": "array_length",
        "message0": Blockly.Msg.BKY_ARRAY_LENGTH || "length of array %1",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"}
        ],
        "output": "Number",
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_LENGTH_TIP || "Get the length of array"
    },
    {
        "type": "array_clear",
        "message0": Blockly.Msg.BKY_ARRAY_CLEAR || "fill array %1 with %2",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "input_value", "name": "VALUE", "check": "Number"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_CLEAR_TIP || "Fill entire array with specified value"
    },
    {
        "type": "array_copy",
        "message0": Blockly.Msg.BKY_ARRAY_COPY || "copy array from %1 to %2",
        "args0": [
            {"type": "field_input", "name": "SOURCE", "text": "sourceArray"},
            {"type": "field_input", "name": "DEST", "text": "destArray"}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_COPY_TIP || "Copy all values from source array to destination array"
    },
    {
        "type": "array_strlen",
        "message0": Blockly.Msg.BKY_ARRAY_STRLEN || "string length of %1",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"}
        ],
        "output": "Number",
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_STRLEN_TIP || "Get actual length of character array (string)"
    },
    {
        "type": "array_contains",
        "message0": Blockly.Msg.BKY_ARRAY_CONTAINS || "array %1 contains %2",
        "args0": [
            {"type": "field_input", "name": "VAR_NAME", "text": "myArray"},
            {"type": "input_value", "name": "VALUE", "check": "Number"}
        ],
        "output": "Boolean",
        "colour": "#59ACF7",
        "tooltip": Blockly.Msg.BKY_ARRAY_CONTAINS_TIP || "Check if value exists in array"
    },

// ===== 배열 요소 삭제 블록 (앞으로 이동) =====
{
    "type": "array_remove",
    "message0": Blockly.Msg.BKY_ARRAY_REMOVE || "배열 %1 인덱스 %2 삭제하기",
    "args0": [
        {
            "type": "field_input",
            "name": "VAR_NAME",
            "text": "myArray"
        },
        {
            "type": "input_value",
            "name": "INDEX",
            "check": ["Number", "ArrayIndex"]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true,
    "colour": "#59ACF7",
    "tooltip": Blockly.Msg.BKY_ARRAY_REMOVE_TIP || "배열의 특정 위치 값을 삭제하고 뒤 요소들을 앞으로 이동합니다"
},

// ===== 배열 요소 초기화 블록 =====
{
    "type": "array_clear_at",
    "message0": Blockly.Msg.BKY_ARRAY_CLEAR_AT || "배열 %1 인덱스 %2 를 %3 로 초기화",
    "args0": [
        {
            "type": "field_input",
            "name": "VAR_NAME",
            "text": "myArray"
        },
        {
            "type": "input_value",
            "name": "INDEX",
            "check": ["Number", "ArrayIndex"]
        },
        {
            "type": "input_value",
            "name": "VALUE",
            "check": ["Number", "Boolean"]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true,
    "colour": "#59ACF7",
    "tooltip": Blockly.Msg.BKY_ARRAY_CLEAR_AT_TIP || "배열의 특정 위치를 지정한 값으로 초기화합니다 (보통 0)"
},


// 9. ===============================================================함수 카테고리
    {
        "type": "procedures_ifreturn",
        "message0": Blockly.Msg.BKY_PROCEDURES_IFRETURN || "If %1 return %2",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#8E61A3",
        "tooltip": Blockly.Msg.BKY_PROCEDURES_IFRETURN_TOOLTIP || "Return value if condition is true."
    },
    {
        "type": "procedures_ifreturn_void",
        "message0": Blockly.Msg.BKY_PROCEDURES_IFRETURN_VOID || "If %1 return",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#8E61A3",
        "tooltip": Blockly.Msg.BKY_PROCEDURES_IFRETURN_VOID_TOOLTIP || "Return from function if condition is true."
    }
];

// Part 2 블록들을 기존 배열에 추가하여 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart2);

// Part 3: 디스플레이 카테고리 (LCD, FND, NeoPixel)
const blockDefinitionsPart3 = [

// 10. =====================================================A.디스플레이 카테고리 
// LCD
    {
        "type": "lcd_i2c_setup",
        "message0": Blockly.Msg.BKY_LCD_I2C_SETUP || "Setup LCD %1 Address %2 Cols %3 Rows %4",
        "inputsInline": true,
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "ADDRESS", "options": [["0x20", "0x20"], ["0x27", "0x27"], ["0x3F", "0x3F"]] },
            { "type": "field_dropdown", "name": "COLS", "options": [["16", "16"], ["20", "20"]] },
            { "type": "field_dropdown", "name": "ROWS", "options": [["2", "2"], ["4", "4"]] }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_SETUP_TOOLTIP || "Setup I2C LCD display."
    },
    {
        "type": "lcd_i2c_print",
        "message0": Blockly.Msg.BKY_LCD_I2C_PRINT || "LCD %1 Print at Row %2 Col %3 Text %4",
        "inputsInline": true,
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "input_value", "name": "ROW", "check": "Number" },
            { "type": "input_value", "name": "COL", "check": "Number" },
            { "type": "input_value", "name": "TEXT" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_PRINT_TOOLTIP || "Print text on LCD at specified position."
    },
    {
        "type": "lcd_i2c_clear",
        "message0": Blockly.Msg.BKY_LCD_I2C_CLEAR || "Clear LCD %1",
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_CLEAR_TOOLTIP || "Clear LCD display."
    },
    {
        "type": "lcd_i2c_cursor",
        "message0": Blockly.Msg.BKY_LCD_I2C_CURSOR || "LCD %1 Cursor %2",
        "inputsInline": true,
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "CURSOR_MODE", "options": [
                [Blockly.Msg.BKY_ON || "On", "ON"], 
                [Blockly.Msg.BKY_OFF || "Off", "OFF"], 
                [Blockly.Msg.BKY_BLINK || "Blink", "BLINK"], 
                [Blockly.Msg.BKY_NO_BLINK || "No Blink", "NO_BLINK"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_CURSOR_TOOLTIP || "Control LCD cursor display."
    },
    {
        "type": "lcd_i2c_backlight",
        "message0": Blockly.Msg.BKY_LCD_I2C_BACKLIGHT || "LCD %1 Backlight %2",
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "BACKLIGHT", "options": [
                [Blockly.Msg.BKY_ON || "On", "ON"], 
                [Blockly.Msg.BKY_OFF || "Off", "OFF"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_BACKLIGHT_TOOLTIP || "Control LCD backlight."
    },
    {
        "type": "lcd_i2c_scroll",
        "message0": Blockly.Msg.BKY_LCD_I2C_SCROLL || "LCD %1 Scroll %2",
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "DIRECTION", "options": [
                [Blockly.Msg.BKY_LEFT || "Left", "LEFT"], 
                [Blockly.Msg.BKY_RIGHT || "Right", "RIGHT"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_SCROLL_TOOLTIP || "Scroll LCD display."
    },
    {
        "type": "lcd_i2c_display",
        "message0": Blockly.Msg.BKY_LCD_I2C_DISPLAY || "LCD %1 Display %2",
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "DISPLAY", "options": [
                [Blockly.Msg.BKY_ON || "On", "ON"], 
                [Blockly.Msg.BKY_OFF || "Off", "OFF"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_DISPLAY_TOOLTIP || "Turn LCD display on/off."
    },
    {
        "type": "lcd_i2c_set_cursor",
        "message0": Blockly.Msg.BKY_LCD_I2C_SET_CURSOR || "LCD %1 Set Cursor Row %2 Col %3",
        "inputsInline": true,
        "args0": [
            { "type": "input_value", "name": "LCD_NUM", "check": "Number" },
            { "type": "input_value", "name": "ROW", "check": "Number" },
            { "type": "input_value", "name": "COL", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_LCD_I2C_SET_CURSOR_TOOLTIP || "Set LCD cursor position."
    },

// TM1637Display 4-Digit Display 블록 정의 (v2.0)

// 1. TM1637Display 설정 블록 (첫 번째 블록 - 모든 #include 포함)
{
    "type": "tm1637_setup",
    "message0": Blockly.Msg.BKY_TM1637_SETUP || "TM1637Display setup CLK pin %1 DATA pin %2",
    "args0": [
        {
            "type": "input_value",
            "name": "CLK_PIN",
            "check": "Number"
        },
        {
            "type": "input_value", 
            "name": "DATA_PIN",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline": true,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_SETUP_TIP || "Initialize TM1637Display 4-digit display with CLK and DATA pins"
},

// 2. 숫자 표시 블록
{
    "type": "tm1637_display_number",
    "message0": Blockly.Msg.BKY_TM1637_DISPLAY_NUMBER || "Display number %1 %2 %3",
    "args0": [
        {
            "type": "input_value",
            "name": "NUMBER",
            "check": "Number"
        },
        {
            "type": "field_dropdown",
            "name": "DECIMAL_TYPE",
            "options": [
                [Blockly.Msg.BKY_TM1637_NO_DECIMAL || "No decimal", "0"],
                [Blockly.Msg.BKY_TM1637_ONE_DECIMAL || "1 decimal place", "1"],
                [Blockly.Msg.BKY_TM1637_COLON || "With colon (:)", "2"]
            ]
        },
        {
            "type": "field_dropdown", 
            "name": "SHOW_MINUS",
            "options": [
                [Blockly.Msg.BKY_TM1637_SHOW_MINUS || "Show minus", "true"],
                [Blockly.Msg.BKY_TM1637_HIDE_MINUS || "Hide minus", "false"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_DISPLAY_NUMBER_TIP || "Display a number with optional decimal places or colon"
},

// 3. 시계 표시 블록
{
    "type": "tm1637_display_time",
    "message0": Blockly.Msg.BKY_TM1637_DISPLAY_TIME || "Display time %1 : %2 %3",
    "args0": [
        {
            "type": "input_value",
            "name": "HOUR",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "MINUTE", 
            "check": "Number"
        },
        {
            "type": "field_dropdown",
            "name": "SHOW_COLON",
            "options": [
                [Blockly.Msg.BKY_TM1637_COLON_ON || "Show colon", "true"],
                [Blockly.Msg.BKY_TM1637_COLON_OFF || "Hide colon", "false"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_DISPLAY_TIME_TIP || "Display time in HH:MM format"
},

// 4. 문자열 표시 블록
{
    "type": "tm1637_display_text",
    "message0": Blockly.Msg.BKY_TM1637_DISPLAY_TEXT || "Display text %1 scroll delay %2 ms",
    "args0": [
        {
            "type": "input_value",
            "name": "TEXT",
            "check": ["String", "Number"]
        },
        {
            "type": "input_value",
            "name": "DELAY",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_DISPLAY_TEXT_TIP || "Display text with scrolling if longer than 4 characters"
},

// 5. 개별 자리 표시 블록
{
    "type": "tm1637_display_digit",
    "message0": Blockly.Msg.BKY_TM1637_DISPLAY_DIGIT || "Display at position %1 digit %2",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "POSITION", 
            "options": [
                [Blockly.Msg.BKY_TM1637_POSITION_1 || "1st (left)", "0"],
                [Blockly.Msg.BKY_TM1637_POSITION_2 || "2nd", "1"],
                [Blockly.Msg.BKY_TM1637_POSITION_3 || "3rd", "2"],
                [Blockly.Msg.BKY_TM1637_POSITION_4 || "4th (right)", "3"]
            ]
        },
        {
            "type": "input_value",
            "name": "DIGIT",
            "check": ["Number", "String"]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_DISPLAY_DIGIT_TIP || "Display a single digit or character at specific position"
},

// 6. 화면 지우기 블록
{
    "type": "tm1637_clear",
    "message0": Blockly.Msg.BKY_TM1637_CLEAR || "Clear display",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_CLEAR_TIP || "Clear all digits on the display"
},

// 7. 밝기 설정 블록
{
    "type": "tm1637_brightness",
    "message0": Blockly.Msg.BKY_TM1637_BRIGHTNESS || "Set brightness %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "BRIGHTNESS",
            "options": [
                ["0", "0"],
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["4", "4"], 
                ["5", "5"],
                ["6", "6"],
                ["7", "7"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_BRIGHTNESS_TIP || "Set display brightness from 0 (darkest) to 7 (brightest)"
},

// 8. 콜론 제어 블록
{
    "type": "tm1637_colon",
    "message0": Blockly.Msg.BKY_TM1637_COLON_CONTROL || "Colon %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "STATE",
            "options": [
                [Blockly.Msg.BKY_TM1637_COLON_ON || "Show", "true"],
                [Blockly.Msg.BKY_TM1637_COLON_OFF || "Hide", "false"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_TM1637_COLON_CONTROL_TIP || "Show or hide the colon between digits"
},

// NeoPixel
    {
        "type": "neopixel_setup",
        "message0": Blockly.Msg.BKY_NEO_SETUP_T || "Setup NeoPixel",
        "message1": Blockly.Msg.BKY_NEO_SETUP_L1 || "Strip %1 Pin %2 LEDs %3",
        "args1": [
            { "type": "field_number", "name": "STRIP_NUM", "value": 1, "min": 1 },
            { "type": "input_value", "name": "PIN", "check": "Number" },
            { "type": "input_value", "name": "LED_COUNT", "check": "Number" }
        ],
        "message2": Blockly.Msg.BKY_NEO_SETUP_L2 || "Type %1",
        "args2": [
            { "type": "field_dropdown", "name": "ORDER", "options": [
                [Blockly.Msg.BKY_NEO_TYPE_GRB || "GRB", "NEO_GRB + NEO_KHZ800"],
                [Blockly.Msg.BKY_NEO_TYPE_RGB || "RGB", "NEO_RGB + NEO_KHZ800"],
                [Blockly.Msg.BKY_NEO_TYPE_BRG || "BRG", "NEO_BRG + NEO_KHZ800"],
                [Blockly.Msg.BKY_NEO_TYPE_BGR || "BGR", "NEO_BGR + NEO_KHZ800"],
                [Blockly.Msg.BKY_NEO_TYPE_GRBW || "GRBW", "NEO_GRBW + NEO_KHZ800"],
                [Blockly.Msg.BKY_NEO_TYPE_RGBW || "RGBW", "NEO_RGBW + NEO_KHZ800"]
            ]}
        ],
        "previousStatement": null,
        "nextStatement": null,
        "inputsInline": true,
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_SETUP_TIP || "Setup NeoPixel LED strip."
    },
    {
        "type": "neopixel_set_rgb",
        "message0": Blockly.Msg.BKY_NEO_SET_RGB || "NeoPixel %1 LED %2 R %3 G %4 B %5",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "LED_INDEX", "check": "Number" },
            { "type": "input_value", "name": "R", "check": "Number" },
            { "type": "input_value", "name": "G", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_SET_RGB_TIP || "Set NeoPixel LED color."
    },
    {
        "type": "neopixel_set_rgbw",
        "message0": Blockly.Msg.BKY_NEO_SET_RGBW || "NeoPixel %1 LED %2 R %3 G %4 B %5 W %6",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "LED_INDEX", "check": "Number" },
            { "type": "input_value", "name": "R", "check": "Number" },
            { "type": "input_value", "name": "G", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" },
            { "type": "input_value", "name": "W", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_SET_RGBW_TIP || "Set NeoPixel LED color with white."
    },
    {
        "type": "neopixel_brightness",
        "message0": Blockly.Msg.BKY_NEO_BRI || "NeoPixel %1 Brightness %2",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "BRI", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_BRI_TIP || "Set NeoPixel brightness."
    },
    {
        "type": "neopixel_show",
        "message0": Blockly.Msg.BKY_NEO_SHOW || "NeoPixel %1 Show",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_SHOW_TIP || "Update NeoPixel display."
    },
    {
        "type": "neopixel_clear",
        "message0": Blockly.Msg.BKY_NEO_CLEAR || "NeoPixel %1 Clear",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_CLEAR_TIP || "Clear NeoPixel display."
    },
    {
        "type": "neopixel_fill_rgb_all",
        "message0": Blockly.Msg.BKY_NEO_FILL_ALL || "NeoPixel %1 Fill All R %2 G %3 B %4",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "R", "check": "Number" },
            { "type": "input_value", "name": "G", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_FILL_ALL_TIP || "Fill all NeoPixels with color."
    },
    {
        "type": "neopixel_anim_rainbow",
        "message0": Blockly.Msg.BKY_NEO_ANIM_RAINBOW || "NeoPixel %1 Rainbow Wait %2ms Loops %3",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "WAIT", "check": "Number" },
            { "type": "input_value", "name": "LOOPS", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_ANIM_RAINBOW_TIP || "Display rainbow animation."
    },
    {
        "type": "neopixel_anim_shift",
        "message0": Blockly.Msg.BKY_NEO_ANIM_SHIFT || "NeoPixel %1 Shift %2 Steps %3 Wait %4ms",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "DIR", "options": [
                [Blockly.Msg.BKY_NEO_DIR_L || "Left","LEFT"],
                [Blockly.Msg.BKY_NEO_DIR_R || "Right","RIGHT"]
            ]},
            { "type": "input_value", "name": "STEPS", "check": "Number" },
            { "type": "input_value", "name": "WAIT", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_ANIM_SHIFT_TIP || "Shift animation."
    },
    {
        "type": "neopixel_anim_breathe",
        "message0": Blockly.Msg.BKY_NEO_ANIM_BREATHE || "NeoPixel %1 Breathe R %2 G %3 B %4",
        "args0": [
            { "type": "input_value", "name": "STRIP_NUM", "check": "Number" },
            { "type": "input_value", "name": "R", "check": "Number" },
            { "type": "input_value", "name": "G", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" }
        ],
        "message1": Blockly.Msg.BKY_NEO_ANIM_BREATHE_L2 || "Min %1 Max %2 Step %3 Wait %4ms",
        "args1": [
            { "type": "input_value", "name": "MIN_BRI", "check": "Number" },
            { "type": "input_value", "name": "MAX_BRI", "check": "Number" },
            { "type": "input_value", "name": "STEP", "check": "Number" },
            { "type": "input_value", "name": "WAIT", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null,
        "inputsInline": true, 
        "colour": "#FAC907",
        "tooltip": Blockly.Msg.BKY_NEO_ANIM_BREATHE_TIP || "Breathing animation."
    }
];

// Part 3 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart3);




// Part 4: 고급 디스플레이 카테고리 (OLED SH1106, HT16K33 Dot Matrix)
const blockDefinitionsPart4 = [

// 11. ================================================= B.고급 디스플레이 카테고리 
// ===================== SH110X OLED Block Definitions =====================

// 1) 설정 블록 (I2C)
{
    "type": "sh110x_setup_i2c",
    "message0": Blockly.Msg.BKY_SH110X_SETUP_I2C || "Setup SH110X OLED %1 Type %2 I2C Address %3 Reset Pin %4 Width %5 Height %6",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "TYPE", "options": [
            ["SH1106G", "SH1106G"],
            ["SH1107", "SH1107"]
        ]},
        {"type": "field_dropdown", "name": "ADDR", "options": [
            ["0x3C", "0x3C"],
            ["0x3D", "0x3D"]
        ]},
        {"type": "input_value", "name": "RST", "check": "Number"},
        {"type": "input_value", "name": "WIDTH", "check": "Number"},
        {"type": "input_value", "name": "HEIGHT", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline":true,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_SETUP_I2C_TIP || "Setup SH110X OLED display with I2C connection."
},

// 2) 화면 표시/지우기
{
    "type": "sh110x_display",
    "message0": Blockly.Msg.BKY_SH110X_DISPLAY || "OLED %1 Display",
    "args0": [{"type": "input_value", "name": "NUM", "check": "Number"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_DISPLAY_TIP || "Show current buffer on OLED display."
},

{
    "type": "sh110x_clear",
    "message0": Blockly.Msg.BKY_SH110X_CLEAR || "OLED %1 Clear",
    "args0": [{"type": "input_value", "name": "NUM", "check": "Number"}],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_CLEAR_TIP || "Clear OLED display buffer."
},

// 3) 화면 제어
{
    "type": "sh110x_control",
    "message0": Blockly.Msg.BKY_SH110X_CONTROL || "OLED %1 %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "ACTION", "options": [
            ["Invert Display", "INVERT"],
            ["Normal Display", "NORMAL"],
            ["Turn On", "ON"],
            ["Turn Off", "OFF"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_CONTROL_TIP || "Control OLED display state."
},

// 4) 픽셀 그리기
{
    "type": "sh110x_pixel",
    "message0": Blockly.Msg.BKY_SH110X_PIXEL || "OLED %1 Draw Pixel X %2 Y %3 Color %4",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "field_dropdown", "name": "COL", "options": [
            ["White", "SH110X_WHITE"],
            ["Black", "SH110X_BLACK"],
            ["Inverse", "SH110X_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_PIXEL_TIP || "Draw a pixel on OLED display."
},

// 5) 선 그리기
{
    "type": "sh110x_line",
    "message0": Blockly.Msg.BKY_SH110X_LINE || "OLED %1 Draw Line From X1 %2 Y1 %3 To X2 %4 Y2 %5 Color %6",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X1", "check": "Number"},
        {"type": "input_value", "name": "Y1", "check": "Number"},
        {"type": "input_value", "name": "X2", "check": "Number"},
        {"type": "input_value", "name": "Y2", "check": "Number"},
        {"type": "field_dropdown", "name": "COL", "options": [
            ["White", "SH110X_WHITE"],
            ["Black", "SH110X_BLACK"],
            ["Inverse", "SH110X_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_LINE_TIP || "Draw a line on OLED display."
},

// 6) 사각형 그리기
{
    "type": "sh110x_rect",
    "message0": Blockly.Msg.BKY_SH110X_RECT || "OLED %1 Draw Rectangle X %2 Y %3 Width %4 Height %5 %6 Color %7",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "W", "check": "Number"},
        {"type": "input_value", "name": "H", "check": "Number"},
        {"type": "field_dropdown", "name": "FILL", "options": [
            [Blockly.Msg.BKY_SH110X_FILL_OUTLINE || "Outline", "0"],
            [Blockly.Msg.BKY_SH110X_FILL_FILLED || "Filled", "1"]
        ]},
        {"type": "field_dropdown", "name": "COL", "options": [
            [Blockly.Msg.BKY_SH110X_COLOR_WHITE || "White", "SH110X_WHITE"],
            [Blockly.Msg.BKY_SH110X_COLOR_BLACK || "Black", "SH110X_BLACK"],
            [Blockly.Msg.BKY_SH110X_COLOR_INVERSE || "Inverse", "SH110X_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_RECT_TIP || "Draw a rectangle on OLED display."
},

// 7) 원 그리기
{
    "type": "sh110x_circle",
    "message0": Blockly.Msg.BKY_SH110X_CIRCLE || "OLED %1 Draw Circle X %2 Y %3 Radius %4 %5 Color %6",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "R", "check": "Number"},
        {"type": "field_dropdown", "name": "FILL", "options": [
            [Blockly.Msg.BKY_SH110X_FILL_OUTLINE || "Outline", "0"],
            [Blockly.Msg.BKY_SH110X_FILL_FILLED || "Filled", "1"]
        ]},
        {"type": "field_dropdown", "name": "COL", "options": [
            [Blockly.Msg.BKY_SH110X_COLOR_WHITE || "White", "SH110X_WHITE"],
            [Blockly.Msg.BKY_SH110X_COLOR_BLACK || "Black", "SH110X_BLACK"],
            [Blockly.Msg.BKY_SH110X_COLOR_INVERSE || "Inverse", "SH110X_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_CIRCLE_TIP || "Draw a circle on OLED display."
},

// 8) 텍스트 출력
{
    "type": "sh110x_text",
    "message0": Blockly.Msg.BKY_SH110X_TEXT || "OLED %1 Print Text %2 X %3 Y %4 Size %5 Color %6 Wrap %7",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "TXT", "check": ["String", "Number"]},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "SIZE", "check": "Number"},
        {"type": "field_dropdown", "name": "COL", "options": [
            [Blockly.Msg.BKY_SH110X_COLOR_WHITE || "White", "SH110X_WHITE"],
            [Blockly.Msg.BKY_SH110X_COLOR_BLACK || "Black", "SH110X_BLACK"],
            [Blockly.Msg.BKY_SH110X_COLOR_INVERSE || "Inverse", "SH110X_INVERSE"]
        ]},
        {"type": "field_dropdown", "name": "WRAP", "options": [
            [Blockly.Msg.BKY_SH110X_WRAP_NO || "No Wrap", "0"],
            [Blockly.Msg.BKY_SH110X_WRAP_YES || "Wrap", "1"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_TEXT_TIP || "Print text on OLED display."
},

// 9) 밝기 조절
{
    "type": "sh110x_contrast",
    "message0": Blockly.Msg.BKY_SH110X_CONTRAST || "OLED %1 Set Contrast %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CONTRAST", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline":true,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH110X_CONTRAST_TIP || "Set OLED display contrast (0-255)."
},

// SH1106 OLED 한글 라이브러리 블록 정의

// 1. 설정 블록 (Setup Block)
{
    "type": "sh1106_setup",
    "message0": Blockly.Msg.BKY_SH1106_SETUP || "Setup SH1106 OLED Display",
    "args0": [],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH1106_SETUP_TIP || "Initialize SH1106 OLED display for Korean text output"
},

// 2. 화면 지우기 블록
{
    "type": "sh1106_clear",
    "message0": Blockly.Msg.BKY_SH1106_CLEAR || "Clear OLED display",
    "args0": [],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH1106_CLEAR_TIP || "Clear all content from OLED display"
},

// 3. 텍스트 출력 블록 (한글/영문 지원)
{
    "type": "sh1106_print_text",
    "message0": Blockly.Msg.BKY_SH1106_PRINT_TEXT || "Print text %1 at X %2 Y %3 style %4",
    "args0": [
        {
            "type": "input_value",
            "name": "TEXT",
            "check": ["String", "Number"]
        },
        {
            "type": "input_value",
            "name": "X",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "Y",
            "check": "Number"
        },
        {
            "type": "field_dropdown",
            "name": "STYLE",
            "options": [
                [Blockly.Msg.BKY_SH1106_STYLE_NORMAL || "Normal", "NORMAL"],
                [Blockly.Msg.BKY_SH1106_STYLE_INVERSE || "Inverse", "INVERSE"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH1106_PRINT_TEXT_TIP || "Print Korean or English text at specified position"
},

// 4. 큰 숫자 출력 블록
{
    "type": "sh1106_large_number",
    "message0": Blockly.Msg.BKY_SH1106_LARGE_NUMBER || "Display large number %1 at X %2 Y %3 style %4",
    "args0": [
        {
            "type": "input_value",
            "name": "NUMBER",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "X",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "Y",
            "check": "Number"
        },
        {
            "type": "field_dropdown",
            "name": "STYLE",
            "options": [
                [Blockly.Msg.BKY_SH1106_STYLE_NORMAL || "Normal", "NORMAL"],
                [Blockly.Msg.BKY_SH1106_STYLE_INVERSE || "Inverse", "INVERSE"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH1106_LARGE_NUMBER_TIP || "Display large bitmap number (0-9) or colon (:)"
},

// 5. 바 그래프 블록
{
    "type": "sh1106_draw_bar",
    "message0": Blockly.Msg.BKY_SH1106_DRAW_BAR || "Draw bar graph at X %1 Y %2 value %3",
    "args0": [
        {
            "type": "input_value",
            "name": "X",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "Y",
            "check": "Number"
        },
        {
            "type": "input_value",
            "name": "VALUE",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "inputsInline":true,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SH1106_DRAW_BAR_TIP || "Draw horizontal bar graph with specified value (0-128)"
},

// HT16K33 Dot Matrix
    {
        "type":"ht16k33_setup",
        "message0": Blockly.Msg.BKY_HT16_SETUP || "Setup Dot Matrix",
        "message1": Blockly.Msg.BKY_HT16_SETUP_1 || "Display %1 Type %2 Address %3",
        "args1":[
            {"type":"field_number","name":"NUM","value":1,"min":1},
            {"type":"field_dropdown","name":"DEV","options":[
                [Blockly.Msg.BKY_DM_8X8 || "8x8 Matrix","M8x8"],
                [Blockly.Msg.BKY_DM_8X16 || "8x16 Matrix","M8x16"],
                [Blockly.Msg.BKY_DM_8X16MINI || "8x16 Mini","M8x16mini"],
                [Blockly.Msg.BKY_DM_BICOLOR8 || "8x8 Bicolor","B8x8"]
            ]},
            {"type":"field_dropdown","name":"ADDR","options":[["0x70","0x70"],["0x71","0x71"],["0x72","0x72"],["0x73","0x73"],["0x74","0x74"],["0x75","0x75"],["0x76","0x76"],["0x77","0x77"]]}
        ],
        "message2": Blockly.Msg.BKY_HT16_SETUP_2 || "Brightness %1 Blink %2 Rotation %3",
        "args2":[
            {"type":"input_value","name":"BRI","check":"Number"},
            {"type":"field_dropdown","name":"BLINK","options":[[Blockly.Msg.BKY_OFF || "Off","HT16K33_BLINK_OFF"],[Blockly.Msg.BKY_BLINK_2HZ || "2 Hz","HT16K33_BLINK_2HZ"],[Blockly.Msg.BKY_BLINK_1HZ || "1 Hz","HT16K33_BLINK_1HZ"],[Blockly.Msg.BKY_BLINK_0_5HZ || "0.5 Hz","HT16K33_BLINK_HALFHZ"]]},
            {"type":"field_dropdown","name":"ROT","options":[["0","0"],["1","1"],["2","2"],["3","3"]]}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_SETUP_TIP || "Setup HT16K33 dot matrix display."
    },
    { 
        "type":"ht16k33_set_brightness",
        "message0": Blockly.Msg.BKY_HT16_BRI || "Dot Matrix %1 Brightness %2",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"BRI","check":"Number"}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_BRI_TIP || "Set dot matrix brightness."
    },
    { 
        "type":"ht16k33_set_blink",
        "message0": Blockly.Msg.BKY_HT16_BLINK || "Dot Matrix %1 Blink %2",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"field_dropdown","name":"BLINK","options":[[Blockly.Msg.BKY_OFF || "Off","HT16K33_BLINK_OFF"],[Blockly.Msg.BKY_BLINK_2HZ || "2 Hz","HT16K33_BLINK_2HZ"],[Blockly.Msg.BKY_BLINK_1HZ || "1 Hz","HT16K33_BLINK_1HZ"],[Blockly.Msg.BKY_BLINK_0_5HZ || "0.5 Hz","HT16K33_BLINK_HALFHZ"]]}
        ],
        "previousStatement":null,"nextStatement":null,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_BLINK_TIP || "Set dot matrix blink rate."
    },
    {
        "type":"ht16k33_pixel",
        "message0": Blockly.Msg.BKY_HT16_PIXEL || "Dot Matrix %1 Pixel Row %2 Col %3 %4",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"ROW","check":"Number"},
            {"type":"input_value","name":"COL","check":"Number"},
            {"type":"field_dropdown","name":"ON","options":[
                [Blockly.Msg.BKY_ON || "On","1"],
                [Blockly.Msg.BKY_OFF || "Off","0"]
            ]}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_PIXEL_TIP || "Set dot matrix pixel."
    },
    {
        "type":"ht16k33_bicolor_pixel",
        "message0": Blockly.Msg.BKY_HT16_BIPIX || "Bicolor Matrix %1 Pixel Row %2 Col %3 Color %4",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"ROW","check":"Number"},
            {"type":"input_value","name":"COL","check":"Number"},
            {"type":"field_dropdown","name":"COLR","options":[[Blockly.Msg.BKY_OFF || "Off","LED_OFF"],[Blockly.Msg.BKY_RED || "Red","LED_RED"],[Blockly.Msg.BKY_GREEN || "Green","LED_GREEN"],[Blockly.Msg.BKY_YELLOW || "Yellow","LED_YELLOW"]]}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_BIPIX_TIP || "Set bicolor matrix pixel."
    },
    {
        "type":"ht16k33_pattern_8x8",
        "message0": Blockly.Msg.BKY_HT16_P8 || "Dot Matrix %1 Pattern 8x8",
        "inputsInline": true,
        "args0":[ {"type":"input_value","name":"NUM","check":"Number"} ],
        "message1": "%1",
        "args1":[ { "type":"field_matrix", "name":"MAT", "w":8, "h":8, "value":"0000000000000000000000000000000000000000000000000000000000000000" } ],
        "previousStatement":null,"nextStatement":null,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_P8_TIP || "Display 8x8 pattern on matrix."
    },
    {
        "type":"ht16k33_pattern_8x16",
        "message0": Blockly.Msg.BKY_HT16_P816 || "Dot Matrix %1 Pattern 8x16",
        "inputsInline": true,
        "args0":[ { "type":"input_value","name":"NUM","check":"Number" } ],
        "message1": "%1",
        "args1":[
            { "type":"field_matrix", "name":"MAT", "w":16, "h":8, "value": ( "0".repeat(16*8) ) }
        ],
        "previousStatement": null, "nextStatement": null,
        "colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_P816_TIP || "Display 8x16 pattern on matrix."
    },
    {
        "type":"ht16k33_line",
        "message0": Blockly.Msg.BKY_HT16_LINE || "Dot Matrix %1 Line R1 %2 C1 %3 R2 %4 C2 %5",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"R1","check":"Number"},
            {"type":"input_value","name":"C1","check":"Number"},
            {"type":"input_value","name":"R2","check":"Number"},
            {"type":"input_value","name":"C2","check":"Number"}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_LINE_TIP || "Draw line on dot matrix."
    },
    {
        "type":"ht16k33_circle",
        "message0": Blockly.Msg.BKY_HT16_CIR || "Dot Matrix %1 Circle R %2 C %3 Radius %4",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"R","check":"Number"},
            {"type":"input_value","name":"C","check":"Number"},
            {"type":"input_value","name":"RAD","check":"Number"}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_CIR_TIP || "Draw circle on dot matrix."
    },
    {
        "type":"ht16k33_rect",
        "message0": Blockly.Msg.BKY_HT16_RECT || "Dot Matrix %1 Rect R %2 C %3 W %4 H %5 %6",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"R","check":"Number"},
            {"type":"input_value","name":"C","check":"Number"},
            {"type":"input_value","name":"W","check":"Number"},
            {"type":"input_value","name":"H","check":"Number"},
            {"type":"field_dropdown","name":"FILL","options":[
                [Blockly.Msg.BKY_OUTLINE || "Outline","0"],
                [Blockly.Msg.BKY_FILL || "Fill","1"]
            ]}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_RECT_TIP || "Draw rectangle on dot matrix."
    },
    { 
        "type":"ht16k33_show",  
        "message0": Blockly.Msg.BKY_HT16_SHOW || "Dot Matrix %1 Show", 
        "args0":[{"type":"input_value","name":"NUM","check":"Number"}], 
        "previousStatement":null,"nextStatement":null,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_SHOW_TIP || "Update dot matrix display."
    },
    { 
        "type":"ht16k33_clear", 
        "message0": Blockly.Msg.BKY_HT16_CLR || "Dot Matrix %1 Clear", 
        "args0":[{"type":"input_value","name":"NUM","check":"Number"}], 
        "previousStatement":null,"nextStatement":null,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_CLR_TIP || "Clear dot matrix display."
    },
    {
        "type":"ht16k33_scroll_text",
        "message0": Blockly.Msg.BKY_HT16_SCROLL || "Dot Matrix %1 Scroll Text %2 %3 Speed %4s",
        "args0":[
            {"type":"input_value","name":"NUM","check":"Number"},
            {"type":"input_value","name":"TEXT","check":["String","Number"]},  // 변경된 부분
            {"type":"field_dropdown","name":"DIR","options":[
                [Blockly.Msg.BKY_LEFT || "Left","LEFT"],
                [Blockly.Msg.BKY_RIGHT || "Right","RIGHT"]
            ]},
            {"type":"input_value","name":"SEC","check":"Number"}
        ],
        "previousStatement":null,"nextStatement":null,"inputsInline":true,"colour":"#FAC907",
        "tooltip": Blockly.Msg.BKY_HT16_SCROLL_TIP || "Scroll text on dot matrix."
    },
    // ===================== SSD1306 OLED 0.96" Block Definitions =====================

// 1) 설정 블록 (I2C)
{
    "type": "ssd1306_setup_i2c",
    "message0": Blockly.Msg.BKY_SSD1306_SETUP_I2C || "Setup SSD1306 OLED %1 Width %2 Height %3 I2C Address %4 Reset Pin %5",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "WIDTH", "options": [
            ["128", "128"],
            ["96", "96"],
            ["64", "64"]
        ]},
        {"type": "field_dropdown", "name": "HEIGHT", "options": [
            ["64", "64"],
            ["32", "32"],
            ["16", "16"]
        ]},
        {"type": "field_dropdown", "name": "ADDR", "options": [
            ["0x3C", "0x3C"],
            ["0x3D", "0x3D"]
        ]},
        {"type": "input_value", "name": "RST", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SSD1306_SETUP_I2C_TIP || "Setup SSD1306 OLED display with I2C connection."
},

// 2) 기본 제어
{
    "type": "ssd1306_control",
    "message0": Blockly.Msg.BKY_SSD1306_CONTROL || "OLED %1 %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "ACTION", "options": [
            [Blockly.Msg.BKY_SSD1306_ACTION_DISPLAY || "Display", "DISPLAY"],
            [Blockly.Msg.BKY_SSD1306_ACTION_CLEAR || "Clear", "CLEAR"],
            [Blockly.Msg.BKY_SSD1306_ACTION_INVERT || "Invert", "INVERT"],
            [Blockly.Msg.BKY_SSD1306_ACTION_NORMAL || "Normal", "NORMAL"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_CONTROL_TIP || "Control OLED display basic functions."
},

// 3) 밝기 조절
{
    "type": "ssd1306_dim",
    "message0": Blockly.Msg.BKY_SSD1306_DIM || "OLED %1 Dim %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "STATE", "options": [
            [Blockly.Msg.BKY_SSD1306_DIM_ON || "On", "true"],
            [Blockly.Msg.BKY_SSD1306_DIM_OFF || "Off", "false"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_DIM_TIP || "Set OLED display dim mode."
},

// 4) 픽셀 그리기
{
    "type": "ssd1306_pixel",
    "message0": Blockly.Msg.BKY_SSD1306_PIXEL || "OLED %1 Draw Pixel X %2 Y %3 Color %4",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "field_dropdown", "name": "COLOR", "options": [
            [Blockly.Msg.BKY_SSD1306_COLOR_WHITE || "White", "SSD1306_WHITE"],
            [Blockly.Msg.BKY_SSD1306_COLOR_BLACK || "Black", "SSD1306_BLACK"],
            [Blockly.Msg.BKY_SSD1306_COLOR_INVERSE || "Inverse", "SSD1306_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_PIXEL_TIP || "Draw a pixel on OLED display."
},

// 5) 선 그리기
{
    "type": "ssd1306_line",
    "message0": Blockly.Msg.BKY_SSD1306_LINE || "OLED %1 Draw Line From X1 %2 Y1 %3 To X2 %4 Y2 %5 Color %6",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X1", "check": "Number"},
        {"type": "input_value", "name": "Y1", "check": "Number"},
        {"type": "input_value", "name": "X2", "check": "Number"},
        {"type": "input_value", "name": "Y2", "check": "Number"},
        {"type": "field_dropdown", "name": "COLOR", "options": [
            [Blockly.Msg.BKY_SSD1306_COLOR_WHITE || "White", "SSD1306_WHITE"],
            [Blockly.Msg.BKY_SSD1306_COLOR_BLACK || "Black", "SSD1306_BLACK"],
            [Blockly.Msg.BKY_SSD1306_COLOR_INVERSE || "Inverse", "SSD1306_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_LINE_TIP || "Draw a line on OLED display."
},

// 6) 사각형 그리기
{
    "type": "ssd1306_rect",
    "message0": Blockly.Msg.BKY_SSD1306_RECT || "OLED %1 Draw Rectangle X %2 Y %3 Width %4 Height %5 %6 Color %7",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "W", "check": "Number"},
        {"type": "input_value", "name": "H", "check": "Number"},
        {"type": "field_dropdown", "name": "FILL", "options": [
            [Blockly.Msg.BKY_SSD1306_FILL_OUTLINE || "Outline", "0"],
            [Blockly.Msg.BKY_SSD1306_FILL_FILLED || "Filled", "1"]
        ]},
        {"type": "field_dropdown", "name": "COLOR", "options": [
            [Blockly.Msg.BKY_SSD1306_COLOR_WHITE || "White", "SSD1306_WHITE"],
            [Blockly.Msg.BKY_SSD1306_COLOR_BLACK || "Black", "SSD1306_BLACK"],
            [Blockly.Msg.BKY_SSD1306_COLOR_INVERSE || "Inverse", "SSD1306_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_RECT_TIP || "Draw a rectangle on OLED display."
},

// 7) 원 그리기
{
    "type": "ssd1306_circle",
    "message0": Blockly.Msg.BKY_SSD1306_CIRCLE || "OLED %1 Draw Circle X %2 Y %3 Radius %4 %5 Color %6",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "R", "check": "Number"},
        {"type": "field_dropdown", "name": "FILL", "options": [
            [Blockly.Msg.BKY_SSD1306_FILL_OUTLINE || "Outline", "0"],
            [Blockly.Msg.BKY_SSD1306_FILL_FILLED || "Filled", "1"]
        ]},
        {"type": "field_dropdown", "name": "COLOR", "options": [
            [Blockly.Msg.BKY_SSD1306_COLOR_WHITE || "White", "SSD1306_WHITE"],
            [Blockly.Msg.BKY_SSD1306_COLOR_BLACK || "Black", "SSD1306_BLACK"],
            [Blockly.Msg.BKY_SSD1306_COLOR_INVERSE || "Inverse", "SSD1306_INVERSE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_CIRCLE_TIP || "Draw a circle on OLED display."
},

// 8) 텍스트 출력
{
    "type": "ssd1306_text",
    "message0": Blockly.Msg.BKY_SSD1306_TEXT || "OLED %1 Print Text %2 X %3 Y %4 Size %5 Color %6 Wrap %7",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "TEXT", "check": ["String", "Number"]},
        {"type": "input_value", "name": "X", "check": "Number"},
        {"type": "input_value", "name": "Y", "check": "Number"},
        {"type": "input_value", "name": "SIZE", "check": "Number"},
        {"type": "field_dropdown", "name": "COLOR", "options": [
            [Blockly.Msg.BKY_SSD1306_COLOR_WHITE || "White", "SSD1306_WHITE"],
            [Blockly.Msg.BKY_SSD1306_COLOR_BLACK || "Black", "SSD1306_BLACK"],
            [Blockly.Msg.BKY_SSD1306_COLOR_INVERSE || "Inverse", "SSD1306_INVERSE"]
        ]},
        {"type": "field_dropdown", "name": "WRAP", "options": [
            [Blockly.Msg.BKY_SSD1306_WRAP_NO || "No Wrap", "false"],
            [Blockly.Msg.BKY_SSD1306_WRAP_YES || "Wrap", "true"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "tooltip": Blockly.Msg.BKY_SSD1306_TEXT_TIP || "Print text on OLED display."
},

// 9) 스크롤 기능
{
    "type": "ssd1306_scroll",
    "message0": Blockly.Msg.BKY_SSD1306_SCROLL || "OLED %1 Scroll %2 Start %3 Stop %4",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "DIRECTION", "options": [
            [Blockly.Msg.BKY_SSD1306_SCROLL_RIGHT || "Right", "RIGHT"],
            [Blockly.Msg.BKY_SSD1306_SCROLL_LEFT || "Left", "LEFT"],
            [Blockly.Msg.BKY_SSD1306_SCROLL_DIAG_RIGHT || "Diagonal Right", "DIAG_RIGHT"],
            [Blockly.Msg.BKY_SSD1306_SCROLL_DIAG_LEFT || "Diagonal Left", "DIAG_LEFT"],
            [Blockly.Msg.BKY_SSD1306_SCROLL_STOP || "Stop", "STOP"]
        ]},
        {"type": "input_value", "name": "START", "check": "Number"},
        {"type": "input_value", "name": "STOP", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FAC907",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SSD1306_SCROLL_TIP || "Control OLED display scroll function."
},

// ============한글출력블록(SSD1306)
{
  // 설정 블록
  "type": "oled_han_setup",
  "message0": Blockly.Msg.BKY_OLED_HAN_SETUP || "Setup OLED Display (Korean Support)",
  "args0": [],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#FAC907",
  "tooltip": Blockly.Msg.BKY_OLED_HAN_SETUP_TIP || "Initialize OLED display with Korean text support. Must be used first."
},
{
  // 화면 지우기
  "type": "oled_han_clear",
  "message0": Blockly.Msg.BKY_OLED_HAN_CLEAR || "Clear OLED Display",
  "args0": [],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#FAC907",
  "tooltip": Blockly.Msg.BKY_OLED_HAN_CLEAR_TIP || "Clear all content on the OLED display."
},
{
  // 통합 텍스트 출력 블록
  "type": "oled_han_print_text",
  "message0": Blockly.Msg.BKY_OLED_HAN_PRINT_TEXT || "Print text %1 at X %2 Y %3 %4",
  "args0": [
    {
      "type": "input_value",
      "name": "TEXT",
      "check": ["String", "Number"]
    },
    {
      "type": "input_value",
      "name": "X",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "Y",
      "check": "Number"
    },
    {
      "type": "field_dropdown",
      "name": "MODE",
      "options": [
        [Blockly.Msg.BKY_OLED_HAN_MODE_NORMAL || "Normal", "NORMAL"],
        [Blockly.Msg.BKY_OLED_HAN_MODE_INVERSE || "Inverse", "INVERSE"]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#FAC907",
  "tooltip": Blockly.Msg.BKY_OLED_HAN_PRINT_TEXT_TIP || "Print any text (Korean, English, numbers, mixed) at specified position."
},
{
  // 큰 숫자 표시
  "type": "oled_han_big_digit",
  "message0": Blockly.Msg.BKY_OLED_HAN_BIG_DIGIT || "Show big digit %1 at X %2 Y %3 %4",
  "args0": [
    {
      "type": "input_value",
      "name": "DIGIT",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "X",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "Y",
      "check": "Number"
    },
    {
      "type": "field_dropdown",
      "name": "MODE",
      "options": [
        [Blockly.Msg.BKY_OLED_HAN_MODE_NORMAL || "Normal", "NORMAL"],
        [Blockly.Msg.BKY_OLED_HAN_MODE_INVERSE || "Inverse", "INVERSE"]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": "#FAC907",
  "tooltip": Blockly.Msg.BKY_OLED_HAN_BIG_DIGIT_TIP || "Display a large digit (0-9) using 7-segment style."
},
{
  // 바 그래프
  "type": "oled_han_draw_bar",
  "message0": Blockly.Msg.BKY_OLED_HAN_DRAW_BAR || "Draw bar graph at X %1 Y %2 value %3",
  "args0": [
    {
      "type": "input_value",
      "name": "X",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "Y",
      "check": "Number"
    },
    {
      "type": "input_value",
      "name": "VALUE",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "inputsInline": true,
  "colour": "#FAC907",
  "tooltip": Blockly.Msg.BKY_OLED_HAN_DRAW_BAR_TIP || "Draw a horizontal bar graph with value (0-128)."
}
];

// Part 4 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart4);


// Part 5: 일반센서 카테고리
const blockDefinitionsPart5 = [

// 12. ================================================= A.일반센서 카테고리
// Ultrasonic
    {
        "type":"ultrasonic_setup",
        "message0": Blockly.Msg.BKY_ULTRA_SETUP || "Setup Ultrasonic Trig Pin %1 Echo Pin %2",
        "args0":[
            { "type":"field_number","name":"TRIG_PIN","value":7 },
            { "type":"field_number","name":"ECHO_PIN","value":8 }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour":"#FF6F00",
        "tooltip": Blockly.Msg.BKY_ULTRA_SETUP_TIP || "Setup ultrasonic sensor."
    },
    {
        "type":"ultrasonic_distance",
        "message0": Blockly.Msg.BKY_ULTRA_DISTANCE || "Ultrasonic Distance %1",
        "args0":[
            { "type":"field_dropdown","name":"UNIT","options":[ 
                [Blockly.Msg.BKY_UNIT_CM || "cm","CM"], 
                [Blockly.Msg.BKY_UNIT_MM || "mm","MM"] 
            ]}
        ],
        "output":"Number","colour":"#FF6F00",
        "tooltip": Blockly.Msg.BKY_ULTRA_DISTANCE_TIP || "Get ultrasonic distance measurement."
    },

// DHT
    {
        "type": "dht_setup",
        "message0": Blockly.Msg.BKY_DHT_SETUP || "Setup DHT Pin %1 Type %2",
        "args0": [
            { "type": "input_value", "name": "PIN", "check": "Number" },
            { "type": "field_dropdown", "name": "TYPE", "options": [
                    ["DHT11", "DHT11"], ["DHT22", "DHT22"], ["DHT21", "DHT21"], ["AM2301", "AM2301"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_DHT_SETUP_TOOLTIP || "Setup DHT temperature and humidity sensor."
    },
    {
        "type": "dht_read_temperature",
        "message0": Blockly.Msg.BKY_DHT_READ_TEMPERATURE || "DHT Pin %1 Temperature %2",
        "args0": [
            { "type": "input_value", "name": "PIN", "check": "Number" },
            { "type": "field_dropdown", "name": "SCALE", "options": [
                    [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "false"], 
                    [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "true"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_DHT_READ_TEMPERATURE_TOOLTIP || "Read temperature from DHT sensor."
    },
    {
        "type": "dht_read_humidity",
        "message0": Blockly.Msg.BKY_DHT_READ_HUMIDITY || "DHT Pin %1 Humidity",
        "args0": [ { "type": "input_value", "name": "PIN", "check": "Number" } ],
        "output": "Number", 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_DHT_READ_HUMIDITY_TOOLTIP || "Read humidity from DHT sensor."
    },
    {
        "type": "dht_convert_temperature",
        "message0": Blockly.Msg.BKY_DHT_CONVERT_TEMPERATURE || "Convert Temperature %1 From %2 To %3",
        "args0": [
            { "type": "input_value", "name": "TEMPERATURE", "check": "Number" },
            { "type": "field_dropdown", "name": "FROM", "options": [
                    [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "C"], 
                    [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "F"]
            ]},
            { "type": "field_dropdown", "name": "TO", "options": [
                    [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "F"], 
                    [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "C"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_DHT_CONVERT_TEMPERATURE_TOOLTIP || "Convert temperature between Celsius and Fahrenheit."
    },
    {
        "type": "dht_heat_index",
        "message0": Blockly.Msg.BKY_DHT_HEAT_INDEX || "Heat Index Temperature %1 Humidity %2 Unit %3",
        "args0": [
            { "type": "input_value", "name": "TEMPERATURE", "check": "Number" },
            { "type": "input_value", "name": "HUMIDITY", "check": "Number" },
            { "type": "field_dropdown", "name": "UNIT", "options": [
                    [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "false"], 
                    [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "true"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_DHT_HEAT_INDEX_TOOLTIP || "Calculate heat index."
    },

// Dallas Temperature
    {
        "type": "dallas_temp_setup",
        "message0": Blockly.Msg.BKY_DALLAS_SETUP || "Setup Dallas Temperature Pin %1",
        "args0": [ { "type": "field_number", "name": "PIN", "value": 2, "min": 0, "max": 53 } ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_DALLAS_SETUP_TIP || "Setup Dallas temperature sensors."
    },
    {
        "type": "dallas_temp_read",
        "message0": Blockly.Msg.BKY_DALLAS_READ || "Dallas Temperature Sensor %1 Unit %2",
        "args0": [
            { "type": "field_number", "name": "INDEX", "value": 0, "min": 0, "max": 10 },
            { "type": "field_dropdown", "name": "UNIT", "options": [
                [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "C"], 
                [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "F"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_DALLAS_READ_TIP || "Read temperature from Dallas sensor."
    },
    {
        "type": "dallas_temp_count",
        "message0": Blockly.Msg.BKY_DALLAS_COUNT || "Dallas Temperature Sensor Count",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_DALLAS_COUNT_TIP || "Get number of Dallas sensors found."
    },
    {
        "type": "dallas_temp_request",
        "message0": Blockly.Msg.BKY_DALLAS_REQUEST || "Dallas Temperature Request All",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_DALLAS_REQUEST_TIP || "Request temperature from all Dallas sensors."
    },

// HX711
    {
        "type": "hx711_setup",
        "message0": Blockly.Msg.BKY_HX711_SETUP || "Setup HX711 DOUT Pin %1 CLK Pin %2 Gain %3",
        "args0": [
            { "type": "input_value", "name": "DOUT_PIN", "check": "Number" },
            { "type": "input_value", "name": "CLK_PIN", "check": "Number" },
            { "type": "field_dropdown", "name": "GAIN", "options": [
                    [Blockly.Msg.BKY_GAIN_128_A || "128 (A)", "128"], 
                    [Blockly.Msg.BKY_GAIN_64_A || "64 (A)", "64"], 
                    [Blockly.Msg.BKY_GAIN_32_B || "32 (B)", "32"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_HX711_SETUP_TOOLTIP || "Setup HX711 load cell amplifier."
    },
    {
        "type": "hx711_get_weight",
        "message0": Blockly.Msg.BKY_HX711_GET_WEIGHT || "HX711 Get Weight",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_GET_WEIGHT_TOOLTIP || "Get weight reading from HX711."
    },
    {
        "type": "hx711_tare",
        "message0": Blockly.Msg.BKY_HX711_TARE || "HX711 Tare %1 times",
        "args0": [ { "type": "input_value", "name": "TIMES", "check": "Number" } ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_TARE_TOOLTIP || "Tare (zero) the HX711 scale."
    },
    {
        "type": "hx711_set_scale",
        "message0": Blockly.Msg.BKY_HX711_SET_SCALE || "HX711 Set Scale %1",
        "args0": [ { "type": "input_value", "name": "SCALE", "check": "Number" } ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_SET_SCALE_TOOLTIP || "Set HX711 calibration scale."
    },
    {
        "type": "hx711_is_ready",
        "message0": Blockly.Msg.BKY_HX711_IS_READY || "HX711 Is Ready",
        "output": "Boolean", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_IS_READY_TOOLTIP || "Check if HX711 is ready for reading."
    },
    {
        "type": "hx711_power_control",
        "message0": Blockly.Msg.BKY_HX711_POWER_CONTROL || "HX711 Power %1",
        "args0": [
            { "type": "field_dropdown", "name": "POWER", "options": [
                    [Blockly.Msg.BKY_POWER_ON || "On", "UP"], 
                    [Blockly.Msg.BKY_POWER_OFF || "Off", "DOWN"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_POWER_CONTROL_TOOLTIP || "Control HX711 power state."
    },
    {
        "type": "hx711_read_data",
        "message0": Blockly.Msg.BKY_HX711_READ_DATA || "HX711 Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "READ_TYPE", "options": [
                    [Blockly.Msg.BKY_RAW_VALUE || "Raw Value", "RAW"], 
                    [Blockly.Msg.BKY_AVERAGE_VALUE || "Average", "AVERAGE"], 
                    [Blockly.Msg.BKY_ACTUAL_VALUE || "Actual Value", "VALUE"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_HX711_READ_DATA_TOOLTIP || "Read different types of data from HX711."
    },
    // I2C 무게센서 블록 정의

// 1. 설정 블록
{
    "type": "i2c_weight_setup",
    "message0": Blockly.Msg.BKY_I2C_WEIGHT_SETUP || "Setup I2C Weight Sensor address %1",
    "args0": [
        {
            "type": "input_value",
            "name": "ADDRESS",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_I2C_WEIGHT_SETUP_TIP || "Initialize I2C weight sensor with slave address"
},

// 2. 무게 읽기 블록
{
    "type": "i2c_weight_read",
    "message0": Blockly.Msg.BKY_I2C_WEIGHT_READ || "Read weight from I2C sensor",
    "output": "Number",
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_I2C_WEIGHT_READ_TIP || "Read weight value from I2C weight sensor"
},

// 3. 센서 연결 확인 블록
{
    "type": "i2c_weight_available",
    "message0": Blockly.Msg.BKY_I2C_WEIGHT_AVAILABLE || "I2C weight sensor is available",
    "output": "Boolean",
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_I2C_WEIGHT_AVAILABLE_TIP || "Check if I2C weight sensor is connected and responding"
},

// 4. 원시 데이터 읽기 블록 (고급 사용자용)
{
    "type": "i2c_weight_raw_data",
    "message0": Blockly.Msg.BKY_I2C_WEIGHT_RAW_DATA || "Read raw data byte %1 from I2C sensor",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "BYTE_INDEX",
            "options": [
                [Blockly.Msg.BKY_I2C_WEIGHT_BYTE_0 || "Byte 0 (Status)", "0"],
                [Blockly.Msg.BKY_I2C_WEIGHT_BYTE_1 || "Byte 1 (High)", "1"],
                [Blockly.Msg.BKY_I2C_WEIGHT_BYTE_2 || "Byte 2 (Low)", "2"]
            ]
        }
    ],
    "output": "Number",
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_I2C_WEIGHT_RAW_DATA_TIP || "Read raw byte data from I2C weight sensor"
},

// Rotary Encoder
    {
        "type": "rotary_setup",
        "message0": Blockly.Msg.BKY_ROTARY_SETUP || "Setup Rotary Encoder DT Pin %1 CLK Pin %2",
        "args0": [
            { "type": "input_value", "name": "DT_PIN", "check": "Number" },
            { "type": "input_value", "name": "CLK_PIN", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_ROTARY_SETUP_TOOLTIP || "Setup rotary encoder."
    },
    {
        "type": "rotary_get_value",
        "message0": Blockly.Msg.BKY_ROTARY_GET_VALUE || "Rotary Encoder Value",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_ROTARY_GET_VALUE_TOOLTIP || "Get rotary encoder current value."
    },
    {
        "type": "rotary_direction",
        "message0": Blockly.Msg.BKY_ROTARY_DIRECTION || "Rotary Encoder Direction",
        "output": "String", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_ROTARY_DIRECTION_TOOLTIP || "Get rotary encoder rotation direction."
    },
    {
        "type": "rotary_counter",
        "message0": Blockly.Msg.BKY_ROTARY_COUNTER || "Rotary Encoder Counter",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_ROTARY_COUNTER_TOOLTIP || "Get rotary encoder step counter."
    },
    {
        "type": "rotary_reset_counter",
        "message0": Blockly.Msg.BKY_ROTARY_RESET_COUNTER || "Rotary Encoder Reset Counter",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_ROTARY_RESET_COUNTER_TOOLTIP || "Reset rotary encoder counter."
    },

// Thermistor
    {
        "type": "thermistor_setup",
        "message0": Blockly.Msg.BKY_THERMISTOR_SETUP || "Setup Thermistor Pin %1 Nominal R %2 Beta %3 Series R %4",
        "args0": [
            { "type": "input_value", "name": "ANALOG_PIN", "check": "Number" },
            { "type": "input_value", "name": "NOMINAL_RES", "check": "Number" },
            { "type": "input_value", "name": "BETA_COEF", "check": "Number" },
            { "type": "input_value", "name": "SERIAL_RES", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_THERMISTOR_SETUP_TOOLTIP || "Setup thermistor temperature sensor."
    },
    {
        "type": "thermistor_read_temperature",
        "message0": Blockly.Msg.BKY_THERMISTOR_READ_TEMPERATURE || "Thermistor Temperature %1",
        "args0": [
            { "type": "field_dropdown", "name": "UNIT", "options": [
                    [Blockly.Msg.BKY_TEMP_CELSIUS || "Celsius", "CELSIUS"], 
                    [Blockly.Msg.BKY_TEMP_FAHRENHEIT || "Fahrenheit", "FAHRENHEIT"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_THERMISTOR_READ_TEMPERATURE_TOOLTIP || "Read temperature from thermistor."
    },
    {
        "type": "thermistor_read_raw",
        "message0": Blockly.Msg.BKY_THERMISTOR_READ_RAW || "Thermistor Raw Value",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_THERMISTOR_READ_RAW_TOOLTIP || "Read raw ADC value from thermistor."
    },
    {
        "type": "thermistor_get_resistance",
        "message0": Blockly.Msg.BKY_THERMISTOR_GET_RESISTANCE || "Thermistor Resistance",
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_THERMISTOR_GET_RESISTANCE_TOOLTIP || "Get thermistor resistance value."
    }
];

// Part 5 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart5);


// Part 6: 나머지 일반센서들 (PMS, MHZ19, TDS, PH, Fingerprint, Turbidity, UV)
const blockDefinitionsPart6 = [

// PMS
    {
        "type": "pms_setup",
        "message0": Blockly.Msg.BKY_PMS_SETUP || "Setup PMS %1 RX Pin %2 TX Pin %3 Baud %4",
        "args0": [
            { "type": "field_dropdown", "name": "SERIAL_PORT", "options": [
                ["SoftwareSerial", "SoftwareSerial"], ["Serial", "Serial"], ["Serial1", "Serial1"], ["Serial2", "Serial2"], ["Serial3", "Serial3"]
            ]},
            { "type": "input_value", "name": "RX_PIN", "check": "Number" },
            { "type": "input_value", "name": "TX_PIN", "check": "Number" },
            { "type": "input_value", "name": "BAUD_RATE", "check": "Number" }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00", 
        "inputsInline": true,
        "tooltip": Blockly.Msg.BKY_PMS_SETUP_TOOLTIP || "Setup PMS particulate matter sensor."
    },
    {
        "type": "pms_power_control",
        "message0": Blockly.Msg.BKY_PMS_POWER_CONTROL || "PMS %1",
        "args0": [
            { "type": "field_dropdown", "name": "POWER_STATE", "options": [
                [Blockly.Msg.BKY_WAKE_UP || "Wake Up", "WAKEUP"], 
                [Blockly.Msg.BKY_SLEEP_MODE || "Sleep", "SLEEP"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_PMS_POWER_CONTROL_TOOLTIP || "Control PMS power state."
    },
    {
        "type": "pms_set_mode",
        "message0": Blockly.Msg.BKY_PMS_SET_MODE || "PMS Set Mode %1",
        "args0": [
            { "type": "field_dropdown", "name": "MODE", "options": [
                [Blockly.Msg.BKY_ACTIVE_MODE || "Active", "ACTIVE"], 
                [Blockly.Msg.BKY_PASSIVE_MODE || "Passive", "PASSIVE"]
            ]}
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_PMS_SET_MODE_TOOLTIP || "Set PMS operating mode."
    },
    {
        "type": "pms_read_data",
        "message0": Blockly.Msg.BKY_PMS_READ_DATA || "PMS Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "DATA_TYPE", "options": [
                [Blockly.Msg.BKY_PM1_0_STANDARD || "PM1.0 Standard", "PM_SP_1_0"],
                [Blockly.Msg.BKY_PM2_5_STANDARD || "PM2.5 Standard", "PM_SP_2_5"], 
                [Blockly.Msg.BKY_PM10_STANDARD || "PM10 Standard", "PM_SP_10_0"],
                [Blockly.Msg.BKY_PM1_0_ATMOSPHERIC || "PM1.0 Atmospheric", "PM_AE_1_0"],
                [Blockly.Msg.BKY_PM2_5_ATMOSPHERIC || "PM2.5 Atmospheric", "PM_AE_2_5"],
                [Blockly.Msg.BKY_PM10_ATMOSPHERIC || "PM10 Atmospheric", "PM_AE_10_0"]
            ]}
        ],
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_PMS_READ_DATA_TOOLTIP || "Read particulate matter data from PMS."
    },
    {
        "type": "pms_request_read",
        "message0": Blockly.Msg.BKY_PMS_REQUEST_READ || "PMS Request Read",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_PMS_REQUEST_READ_TOOLTIP || "Request data reading from PMS."
    },
    {
        "type": "pms_data_available",
        "message0": Blockly.Msg.BKY_PMS_DATA_AVAILABLE || "PMS Data Available",
        "output": "Boolean", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_PMS_DATA_AVAILABLE_TOOLTIP || "Check if PMS data is available."
    },

// MHZ19
    {
        "type": "mhz19_setup",
        "message0": Blockly.Msg.BKY_MHZ19_SETUP || "Setup MHZ19 %1 RX Pin %2 TX Pin %3 Baud %4",
        "args0": [
            { "type": "field_dropdown", "name": "SERIAL_TYPE", "options": [
                [Blockly.Msg.BKY_SERIAL_SOFT || "Software", "SOFT"], 
                [Blockly.Msg.BKY_SERIAL_HARD || "Hardware", "HARD"], 
                [Blockly.Msg.BKY_SERIAL_HARD1 || "Hardware1", "HARD1"], 
                [Blockly.Msg.BKY_SERIAL_HARD2 || "Hardware2", "HARD2"]
            ]},
            { "type": "input_value", "name": "RX_PIN", "check": "Number" },
            { "type": "input_value", "name": "TX_PIN", "check": "Number" },
            { "type": "input_value", "name": "BAUD", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_SETUP_TOOLTIP || "Setup MHZ19 CO2 sensor."
    },
    {
        "type": "mhz19_set_range",
        "message0": Blockly.Msg.BKY_MHZ19_SET_RANGE || "MHZ19 Set Range %1 ppm",
        "args0": [ { "type": "input_value", "name": "RANGE", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_SET_RANGE_TOOLTIP || "Set MHZ19 measurement range."
    },
    {
        "type": "mhz19_filter_mode",
        "message0": Blockly.Msg.BKY_MHZ19_FILTER || "MHZ19 Filter %1 Type %2",
        "args0": [
            { "type": "field_dropdown", "name": "MODE", "options": [ 
                [Blockly.Msg.BKY_FILTER_ON || "On", "ON"], 
                [Blockly.Msg.BKY_FILTER_OFF || "Off", "OFF"] 
            ]},
            { "type": "field_dropdown", "name": "TYPE", "options": [ 
                [Blockly.Msg.BKY_FILTER_CLEAR || "Clear", "CLEAR"], 
                [Blockly.Msg.BKY_FILTER_NORMAL || "Normal", "NORMAL"] 
            ]}
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_FILTER_TOOLTIP || "Control MHZ19 filter settings."
    },
    {
        "type": "mhz19_read_value",
        "message0": Blockly.Msg.BKY_MHZ19_READ || "MHZ19 Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE_TYPE", "options": [
                [Blockly.Msg.BKY_MHZ19_CO2 || "CO2", "CO2"], 
                [Blockly.Msg.BKY_MHZ19_CO2_UNLIM || "CO2 Unlimited", "CO2_UNLIM"], 
                [Blockly.Msg.BKY_MHZ19_TEMP || "Temperature", "TEMP"], 
                [Blockly.Msg.BKY_MHZ19_RAW || "Raw CO2", "RAW"], 
                [Blockly.Msg.BKY_MHZ19_TRANS || "Transmittance", "TRANS"], 
                [Blockly.Msg.BKY_MHZ19_ACCURACY || "Accuracy", "ACCURACY"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_READ_TOOLTIP || "Read values from MHZ19 sensor."
    },
    {
        "type": "mhz19_calibration",
        "message0": Blockly.Msg.BKY_MHZ19_CAL || "MHZ19 Calibration %1 Period %2",
        "args0": [
            { "type": "field_dropdown", "name": "CAL_TYPE", "options": [
                [Blockly.Msg.BKY_CAL_AUTO_ON || "Auto On", "AUTO_ON"], 
                [Blockly.Msg.BKY_CAL_AUTO_OFF || "Auto Off", "AUTO_OFF"], 
                [Blockly.Msg.BKY_CAL_ZERO || "Zero Point", "ZERO_CAL"], 
                [Blockly.Msg.BKY_CAL_RESET || "Reset", "RESET"]
            ]},
            { "type": "input_value", "name": "PERIOD", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_CAL_TOOLTIP || "Perform MHZ19 calibration."
    },
    {
        "type": "mhz19_get_status",
        "message0": Blockly.Msg.BKY_MHZ19_STATUS || "MHZ19 Get %1",
        "args0": [
            { "type": "field_dropdown", "name": "STATUS_TYPE", "options": [
                [Blockly.Msg.BKY_STATUS_RANGE || "Range", "RANGE"], 
                [Blockly.Msg.BKY_STATUS_ABC || "ABC Status", "ABC"], 
                [Blockly.Msg.BKY_STATUS_BG_CO2 || "Background CO2", "BG_CO2"], 
                [Blockly.Msg.BKY_STATUS_VERSION || "Version", "VERSION"]
            ]}
        ],
        "inputsInline": true, 
        "output": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_MHZ19_STATUS_TOOLTIP || "Get MHZ19 status information."
    },

// TDS
    {
        "type": "gravity_tds_setup",
        "message0": Blockly.Msg.BKY_GRAVITY_TDS_SETUP || "Setup TDS Sensor Pin %1",
        "args0": [ { "type": "input_value", "name": "PIN", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_GRAVITY_TDS_SETUP_TOOLTIP || "Setup TDS water quality sensor."
    },
    {
        "type": "gravity_tds_set_temp",
        "message0": Blockly.Msg.BKY_GRAVITY_TDS_TEMP || "TDS Set Temperature %1°C",
        "args0": [ { "type": "input_value", "name": "TEMP", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_GRAVITY_TDS_TEMP_TOOLTIP || "Set temperature for TDS compensation."
    },
    {
        "type": "gravity_tds_update",
        "message0": Blockly.Msg.BKY_GRAVITY_TDS_UPDATE || "TDS Update Reading",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_GRAVITY_TDS_UPDATE_TOOLTIP || "Update TDS sensor reading."
    },
    {
        "type": "gravity_tds_read_value",
        "message0": Blockly.Msg.BKY_GRAVITY_TDS_READ || "TDS Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE_TYPE", "options": [
                [Blockly.Msg.BKY_TDS_VALUE || "TDS Value", "TDS"], 
                [Blockly.Msg.BKY_EC_VALUE || "EC Value", "EC"], 
                [Blockly.Msg.BKY_K_VALUE || "K Value", "K_VAL"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_GRAVITY_TDS_READ_TOOLTIP || "Read TDS sensor values."
    },
    {
        "type": "gravity_tds_advanced_config",
        "message0": Blockly.Msg.BKY_GRAVITY_TDS_ADV || "TDS Advanced Config %1 Value %2",
        "args0": [
            { "type": "field_dropdown", "name": "CONFIG_TYPE", "options": [
                [Blockly.Msg.BKY_ADC_REF || "ADC Reference", "AREF"], 
                [Blockly.Msg.BKY_ADC_RANGE || "ADC Range", "ADC_RANGE"], 
                [Blockly.Msg.BKY_K_ADDRESS || "K Address", "K_ADDR"]
            ]},
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_GRAVITY_TDS_ADV_TOOLTIP || "Advanced TDS sensor configuration."
    },

// PH
// DFRobot_PH 블록 정의

// 1. 설정 블록
{
    "type": "dfrobot_ph_setup",
    "message0": Blockly.Msg.BKY_DFROBOT_PH_SETUP || "Setup pH Sensor pin %1",
    "args0": [
        {
            "type": "input_value",
            "name": "PIN",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_DFROBOT_PH_SETUP_TIP || "Initialize pH sensor with analog pin"
},

// 2. pH 값 읽기 블록
{
    "type": "dfrobot_ph_read",
    "message0": Blockly.Msg.BKY_DFROBOT_PH_READ || "Read pH value at temperature %1 °C",
    "args0": [
        {
            "type": "input_value",
            "name": "TEMPERATURE",
            "check": "Number"
        }
    ],
    "output": "Number",
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_DFROBOT_PH_READ_TIP || "Read pH value with temperature compensation"
},

// 3. 전압 읽기 블록
{
    "type": "dfrobot_ph_voltage",
    "message0": Blockly.Msg.BKY_DFROBOT_PH_VOLTAGE || "Read pH sensor voltage",
    "output": "Number",
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_DFROBOT_PH_VOLTAGE_TIP || "Read raw voltage from pH sensor"
},

// 4. 보정 모드 블록 (간단화)
{
    "type": "dfrobot_ph_calibration",
    "message0": Blockly.Msg.BKY_DFROBOT_PH_CALIBRATION || "pH calibration command %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "COMMAND",
            "options": [
                [Blockly.Msg.BKY_DFROBOT_PH_ENTER || "Enter calibration", "ENTERPH"],
                [Blockly.Msg.BKY_DFROBOT_PH_CALIBRATE || "Calibrate", "CALPH"],
                [Blockly.Msg.BKY_DFROBOT_PH_EXIT || "Exit calibration", "EXITPH"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FF6F00",
    "tooltip": Blockly.Msg.BKY_DFROBOT_PH_CALIBRATION_TIP || "Send calibration command to pH sensor"
},

// Fingerprint
    {
        "type": "fingerprint_setup",
        "message0": Blockly.Msg.BKY_FINGERPRINT_SETUP || "Setup Fingerprint %1 RX Pin %2 TX Pin %3 Baud %4",
        "args0": [
            { "type": "field_dropdown", "name": "SERIAL_TYPE", "options": [
                [Blockly.Msg.BKY_SERIAL_SOFT || "Software", "SOFT"], 
                [Blockly.Msg.BKY_SERIAL_HARD || "Hardware", "HARD"], 
                [Blockly.Msg.BKY_SERIAL_HARD1 || "Hardware1", "HARD1"], 
                [Blockly.Msg.BKY_SERIAL_HARD2 || "Hardware2", "HARD2"]
            ]},
            { "type": "input_value", "name": "RX_PIN", "check": "Number" },
            { "type": "input_value", "name": "TX_PIN", "check": "Number" },
            { "type": "input_value", "name": "BAUD", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_SETUP_TOOLTIP || "Setup fingerprint sensor."
    },
    {
        "type": "fingerprint_enroll_process",
        "message0": Blockly.Msg.BKY_FINGERPRINT_ENROLL || "Fingerprint %1 ID %2",
        "args0": [
            { "type": "field_dropdown", "name": "PROCESS_TYPE", "options": [
                [Blockly.Msg.BKY_GET_IMAGE || "Get Image", "GET_IMAGE"], 
                [Blockly.Msg.BKY_CONVERT_TEMPLATE || "Convert Template", "CONVERT"], 
                [Blockly.Msg.BKY_CREATE_MODEL || "Create Model", "CREATE"], 
                [Blockly.Msg.BKY_STORE_MODEL || "Store Model", "STORE"]
            ]},
            { "type": "input_value", "name": "ID", "check": "Number" }
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_ENROLL_TOOLTIP || "Process fingerprint enrollment steps."
    },
    {
        "type": "fingerprint_search",
        "message0": Blockly.Msg.BKY_FINGERPRINT_SEARCH || "Fingerprint Search %1",
        "args0": [
            { "type": "field_dropdown", "name": "SEARCH_MODE", "options": [
                [Blockly.Msg.BKY_FAST_SEARCH || "Fast", "FAST"], 
                [Blockly.Msg.BKY_NORMAL_SEARCH || "Normal", "NORMAL"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_SEARCH_TOOLTIP || "Search for fingerprint match."
    },
    {
        "type": "fingerprint_get_result",
        "message0": Blockly.Msg.BKY_FINGERPRINT_RESULT || "Fingerprint Get %1",
        "args0": [
            { "type": "field_dropdown", "name": "RESULT_TYPE", "options": [
                [Blockly.Msg.BKY_FINGER_ID || "Finger ID", "FINGER_ID"], 
                [Blockly.Msg.BKY_CONFIDENCE || "Confidence", "CONFIDENCE"], 
                [Blockly.Msg.BKY_TEMPLATE_COUNT || "Template Count", "TEMPLATE_COUNT"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_RESULT_TOOLTIP || "Get fingerprint search results."
    },
    {
        "type": "fingerprint_database",
        "message0": Blockly.Msg.BKY_FINGERPRINT_DATABASE || "Fingerprint Database %1 ID %2",
        "args0": [
            { "type": "field_dropdown", "name": "DB_ACTION", "options": [
                [Blockly.Msg.BKY_DELETE_ID || "Delete ID", "DELETE"], 
                [Blockly.Msg.BKY_EMPTY_ALL || "Empty All", "EMPTY"], 
                [Blockly.Msg.BKY_GET_COUNT || "Get Count", "COUNT"]
            ]},
            { "type": "input_value", "name": "ID", "check": "Number" }
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_DATABASE_TOOLTIP || "Manage fingerprint database."
    },
    {
        "type": "fingerprint_led_control",
        "message0": Blockly.Msg.BKY_FINGERPRINT_LED || "Fingerprint LED %1",
        "args0": [
            { "type": "field_dropdown", "name": "LED_ACTION", "options": [
                [Blockly.Msg.BKY_LED_ON || "On", "ON"], 
                [Blockly.Msg.BKY_LED_OFF || "Off", "OFF"], 
                [Blockly.Msg.BKY_LED_BREATHING || "Breathing", "BREATHING"], 
                [Blockly.Msg.BKY_LED_FLASHING || "Flashing", "FLASHING"]
            ]}
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_FINGERPRINT_LED_TOOLTIP || "Control fingerprint sensor LED."
    },

// Turbidity
    {
        "type": "turbidity_setup",
        "message0": Blockly.Msg.BKY_TURBIDITY_SETUP || "Setup Turbidity Sensor Pin %1",
        "args0": [ { "type": "input_value", "name": "PIN", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_TURBIDITY_SETUP_TOOLTIP || "Setup turbidity sensor."
    },
    {
        "type": "turbidity_calibrate",
        "message0": Blockly.Msg.BKY_TURBIDITY_CALIBRATE || "Turbidity Calibrate",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_TURBIDITY_CALIBRATE_TOOLTIP || "Calibrate turbidity sensor."
    },
    {
        "type": "turbidity_read_value",
        "message0": Blockly.Msg.BKY_TURBIDITY_READ || "Turbidity Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE_TYPE", "options": [
                [Blockly.Msg.BKY_TURBIDITY_NTU || "NTU", "NTU"], 
                [Blockly.Msg.BKY_TURBIDITY_VOLTAGE || "Voltage", "VOLTAGE"], 
                [Blockly.Msg.BKY_TURBIDITY_RAW || "Raw", "RAW"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_TURBIDITY_READ_TOOLTIP || "Read turbidity sensor values."
    },
    {
        "type": "turbidity_update",
        "message0": Blockly.Msg.BKY_TURBIDITY_UPDATE || "Turbidity Update",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_TURBIDITY_UPDATE_TOOLTIP || "Update turbidity sensor reading."
    },

// UV
    {
        "type": "uv_sensor_setup",
        "message0": Blockly.Msg.BKY_UV_SETUP || "Setup UV Sensor Pin %1",
        "args0": [ { "type": "input_value", "name": "PIN", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_UV_SETUP_TOOLTIP || "Setup UV sensor."
    },
    {
        "type": "uv_sensor_calibrate",
        "message0": Blockly.Msg.BKY_UV_CALIBRATE || "UV Sensor Calibrate %1 Voltage %2",
        "args0": [
            { "type": "field_dropdown", "name": "CAL_TYPE", "options": [
                [Blockly.Msg.BKY_CAL_INDOOR || "Indoor", "INDOOR"], 
                [Blockly.Msg.BKY_CAL_OUTDOOR || "Outdoor", "OUTDOOR"], 
                [Blockly.Msg.BKY_CAL_CUSTOM || "Custom", "CUSTOM"]
            ]},
            { "type": "input_value", "name": "VOLTAGE", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_UV_CALIBRATE_TOOLTIP || "Calibrate UV sensor."
    },
    {
        "type": "uv_sensor_read_value",
        "message0": Blockly.Msg.BKY_UV_READ || "UV Sensor Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE_TYPE", "options": [
                [Blockly.Msg.BKY_UV_INDEX || "UV Index", "UV_INDEX"], 
                [Blockly.Msg.BKY_UV_VOLTAGE || "Voltage", "VOLTAGE"], 
                [Blockly.Msg.BKY_UV_VOLTAGE_MV || "Voltage mV", "VOLTAGE_MV"], 
                [Blockly.Msg.BKY_UV_RAW || "Raw", "RAW"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#FF6F00",
        "tooltip": Blockly.Msg.BKY_UV_READ_TOOLTIP || "Read UV sensor values."
    }
];

// Part 6 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart6);


// Part 7: 고급센서 카테고리
const blockDefinitionsPart7 = [

// 13. =======================================================B.고급센서 카테고리====================== 
// ===================== DS1307 RTC Library Block Definitions =====================

// 1) DS1307 RTC 설정 블록
{
    "type": "ds1307_setup",
    "message0": Blockly.Msg.BKY_DS1307_SETUP || "Setup DS1307 RTC %1",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_DS1307_SETUP_TIP || "Initialize DS1307 Real-Time Clock module."
},

// 2) 시간 설정 블록
{
    "type": "ds1307_set_time",
    "message0": Blockly.Msg.BKY_DS1307_SET_TIME || "RTC %1 Set Time Year %2 Month %3 Date %4 Hour %5 Minute %6 Second %7",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "YEAR", "check": "Number"},
        {"type": "input_value", "name": "MONTH", "check": "Number"},
        {"type": "input_value", "name": "DATE", "check": "Number"},
        {"type": "input_value", "name": "HOUR", "check": "Number"},
        {"type": "input_value", "name": "MINUTE", "check": "Number"},
        {"type": "input_value", "name": "SECOND", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_DS1307_SET_TIME_TIP || "Set current date and time on RTC module."
},

// 3) 시간 읽기 블록 (값 반환)
{
    "type": "ds1307_get_time",
    "message0": Blockly.Msg.BKY_DS1307_GET_TIME || "RTC %1 Get %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "TIME_TYPE", "options": [
            [Blockly.Msg.BKY_DS1307_TIME_YEAR || "Year", "DS1307_YR"],
            [Blockly.Msg.BKY_DS1307_TIME_MONTH || "Month", "DS1307_MTH"],
            [Blockly.Msg.BKY_DS1307_TIME_DATE || "Date", "DS1307_DATE"],
            [Blockly.Msg.BKY_DS1307_TIME_HOUR || "Hour", "DS1307_HR"],
            [Blockly.Msg.BKY_DS1307_TIME_MINUTE || "Minute", "DS1307_MIN"],
            [Blockly.Msg.BKY_DS1307_TIME_SECOND || "Second", "DS1307_SEC"],
            [Blockly.Msg.BKY_DS1307_TIME_DAY_OF_WEEK || "Day of Week", "DS1307_DOW"]
        ]}
    ],
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_DS1307_GET_TIME_TIP || "Get specific time value from RTC module."
},

// 4) 클록 제어 블록
{
    "type": "ds1307_clock_control",
    "message0": Blockly.Msg.BKY_DS1307_CLOCK_CONTROL || "RTC %1 Clock %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "ACTION", "options": [
            [Blockly.Msg.BKY_DS1307_CLOCK_START || "Start", "START"],
            [Blockly.Msg.BKY_DS1307_CLOCK_STOP || "Stop", "STOP"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_DS1307_CLOCK_CONTROL_TIP || "Start or stop the RTC clock."
},

// 5) SQW 출력 설정 블록
{
    "type": "ds1307_sqw_output",
    "message0": Blockly.Msg.BKY_DS1307_SQW_OUTPUT || "RTC %1 SQW Output %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "OUTPUT_TYPE", "options": [
            [Blockly.Msg.BKY_DS1307_OUTPUT_HIGH || "High", "HIGH"],
            [Blockly.Msg.BKY_DS1307_OUTPUT_LOW || "Low", "LOW"],
            [Blockly.Msg.BKY_DS1307_OUTPUT_1HZ || "1 Hz", "DS1307_SQW1HZ"],
            [Blockly.Msg.BKY_DS1307_OUTPUT_4KHZ || "4 kHz", "DS1307_SQW4KHZ"],
            [Blockly.Msg.BKY_DS1307_OUTPUT_8KHZ || "8 kHz", "DS1307_SQW8KHZ"],
            [Blockly.Msg.BKY_DS1307_OUTPUT_32KHZ || "32 kHz", "DS1307_SQW32KHZ"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_DS1307_SQW_OUTPUT_TIP || "Set SQW pin output type."
},

// 6) 현재 시간 가져오기 (문자열 반환)
{
    "type": "ds1307_get_time_string",
    "message0": Blockly.Msg.BKY_DS1307_GET_TIME_STRING || "RTC %1 Get Time String Format %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "FORMAT", "options": [
            [Blockly.Msg.BKY_DS1307_FORMAT_DATETIME || "YYYY/MM/DD HH:MM:SS", "DATETIME"],
            [Blockly.Msg.BKY_DS1307_FORMAT_DATE || "YYYY/MM/DD", "DATE"],
            [Blockly.Msg.BKY_DS1307_FORMAT_TIME || "HH:MM:SS", "TIME"]
        ]}
    ],
    "output": "String",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_DS1307_GET_TIME_STRING_TIP || "Get formatted time string from RTC."
},

// 기압고도센서BMP280 블록들
    {
        "type": "bmp280_setup",
        "message0": Blockly.Msg.BKY_BMP280_SETUP || "Setup BMP280",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_BMP280_SETUP_TOOLTIP || "Setup BMP280 pressure and altitude sensor."
    },
    {
        "type": "bmp280_set_sea_pressure",
        "message0": Blockly.Msg.BKY_BMP280_SET_SEA_PRESSURE || "BMP280 Set Sea Level Pressure %1 Pa",
        "args0": [
            { "type": "input_value", "name": "PRESSURE", "check": "Number" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_BMP280_SET_SEA_PRESSURE_TOOLTIP || "Set sea level pressure for altitude calculation."
    },
    {
        "type": "bmp280_set_reference",
        "message0": Blockly.Msg.BKY_BMP280_SET_REFERENCE || "BMP280 Set Reference Altitude %1 m",
        "args0": [
            { "type": "input_value", "name": "ALTITUDE", "check": "Number" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_BMP280_SET_REFERENCE_TOOLTIP || "Set reference altitude."
    },
    {
        "type": "bmp280_read_value",
        "message0": Blockly.Msg.BKY_BMP280_READ || "BMP280 Read %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "FIELD",
                "options": [
                    [Blockly.Msg.BKY_BMP280_PRES_PA || "Pressure Pa", "PRES"],
                    [Blockly.Msg.BKY_BMP280_PRES_HPA || "Pressure hPa", "PRES_HPA"],
                    [Blockly.Msg.BKY_BMP280_ALT || "Altitude", "ALT"],
                    [Blockly.Msg.BKY_BMP280_REL_ALT || "Relative Altitude", "REL_ALT"],
                    [Blockly.Msg.BKY_BMP280_TEMP || "Temperature", "TEMP"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_BMP280_READ_TOOLTIP || "Read BMP280 sensor values."
    },

// MPU6050 블록들
    {
        "type": "bx_mpu_setup",
        "message0": Blockly.Msg.BKY_MPU_SETUP || "Setup MPU6050",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_MPU_SETUP_TOOLTIP || "Setup MPU6050 gyroscope and accelerometer."
    },
    {
        "type": "bx_mpu_update",
        "message0": Blockly.Msg.BKY_MPU_UPDATE || "MPU6050 Update",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_MPU_UPDATE_TIP || "Update MPU6050 sensor readings."
    },
    {
        "type": "bx_mpu_read_value",
        "message0": Blockly.Msg.BKY_MPU_READ || "MPU6050 Read %1",
        "args0": [{
            "type": "field_dropdown",
            "name": "FIELD",
            "options": [
                [Blockly.Msg.BKY_MPU_TEMP || "Temperature", "TEMP"],
                [Blockly.Msg.BKY_MPU_ANGLE_X || "Angle X", "ANGLEX"],
                [Blockly.Msg.BKY_MPU_ANGLE_Y || "Angle Y", "ANGLEY"],
                [Blockly.Msg.BKY_MPU_ANGLE_Z || "Angle Z", "ANGLEZ"],
                [Blockly.Msg.BKY_MPU_ACC_X || "Accel X", "ACCX"],
                [Blockly.Msg.BKY_MPU_ACC_Y || "Accel Y", "ACCY"],
                [Blockly.Msg.BKY_MPU_ACC_Z || "Accel Z", "ACCZ"],
                [Blockly.Msg.BKY_MPU_GYRO_X || "Gyro X", "GYROX"],
                [Blockly.Msg.BKY_MPU_GYRO_Y || "Gyro Y", "GYROY"],
                [Blockly.Msg.BKY_MPU_GYRO_Z || "Gyro Z", "GYROZ"]
            ]
        }],
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_MPU_READ_TIP || "Read MPU6050 sensor values."
    },
    {
        "type": "bx_mpu_set_offsets",
        "message0": Blockly.Msg.BKY_MPU_SET_OFFSETS || "MPU6050 Set Offsets X %1 Y %2 Z %3",
        "args0": [
            { "type": "input_value", "name": "X", "check": "Number" },
            { "type": "input_value", "name": "Y", "check": "Number" },
            { "type": "input_value", "name": "Z", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_MPU_SET_OFFSETS_TIP || "Set MPU6050 calibration offsets."
    },
    {
        "type": "bx_mpu_calc_offsets",
        "message0": Blockly.Msg.BKY_MPU_CALC_OFFSETS || "MPU6050 Calculate Offsets Delay Before %1 After %2",
        "args0": [
            { "type": "input_value", "name": "DELAY_B", "check": "Number" },
            { "type": "input_value", "name": "DELAY_A", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_MPU_CALC_OFFSETS_TIP || "Calculate MPU6050 calibration offsets."
    },

// SGP30 CO2/TVOC 센서
    {
        "type": "sgp30_setup",
        "message0": Blockly.Msg.BKY_SGP30_SETUP || "Setup SGP30 eCO2 Baseline %1 TVOC Baseline %2",
        "args0": [
            { "type": "input_value", "name": "EBASE", "check": "Number" },
            { "type": "input_value", "name": "TBASE", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_SETUP_TOOLTIP || "Setup SGP30 air quality sensor."
    },
    {
        "type": "sgp30_measure",
        "message0": Blockly.Msg.BKY_SGP30_MEASURE || "SGP30 Measure",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_MEASURE_TOOLTIP || "Take SGP30 measurement."
    },
    {
        "type": "sgp30_get_eco2",
        "message0": Blockly.Msg.BKY_SGP30_GET_ECO2 || "SGP30 Get eCO2",
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_GET_ECO2_TOOLTIP || "Get eCO2 value from SGP30."
    },
    {
        "type": "sgp30_get_tvoc",
        "message0": Blockly.Msg.BKY_SGP30_GET_TVOC || "SGP30 Get TVOC",
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_GET_TVOC_TOOLTIP || "Get TVOC value from SGP30."
    },
    {
        "type": "sgp30_set_humidity",
        "message0": Blockly.Msg.BKY_SGP30_SET_HUM || "SGP30 Set Absolute Humidity %1",
        "args0": [
            { "type": "input_value", "name": "AH", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_SET_HUM_TOOLTIP || "Set humidity compensation for SGP30."
    },
    {
        "type": "sgp30_set_baseline",
        "message0": Blockly.Msg.BKY_SGP30_SET_BASE || "SGP30 Set Baseline eCO2 %1 TVOC %2",
        "args0": [
            { "type": "input_value", "name": "EBASE", "check": "Number" },
            { "type": "input_value", "name": "TBASE", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_SET_BASE_TOOLTIP || "Set SGP30 baseline values."
    },
    {
        "type": "sgp30_eeprom_save_baseline_fixed",
        "message0": Blockly.Msg.BKY_SGP30_EE_SAVE_FIXED || "SGP30 Save Baseline to EEPROM",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_EE_SAVE_FIXED_TIP || "Save SGP30 baseline to EEPROM."
    },
    {
        "type": "sgp30_eeprom_load_baseline_fixed",
        "message0": Blockly.Msg.BKY_SGP30_EE_LOAD_FIXED || "SGP30 Load Baseline from EEPROM",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_EE_LOAD_FIXED_TIP || "Load SGP30 baseline from EEPROM."
    },
    {
        "type": "sgp30_eeprom_save_baseline",
        "message0": Blockly.Msg.BKY_SGP30_EE_SAVE || "SGP30 Save Baseline eCO2 Addr %1 TVOC Addr %2",
        "args0": [
            { "type": "input_value", "name": "ADDR_E", "check": "Number" },
            { "type": "input_value", "name": "ADDR_T", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_EE_SAVE_TIP || "Save SGP30 baseline to custom EEPROM addresses."
    },
    {
        "type": "sgp30_eeprom_load_baseline",
        "message0": Blockly.Msg.BKY_SGP30_EE_LOAD || "SGP30 Load Baseline eCO2 Addr %1 TVOC Addr %2",
        "args0": [
            { "type": "input_value", "name": "ADDR_E", "check": "Number" },
            { "type": "input_value", "name": "ADDR_T", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SGP30_EE_LOAD_TIP || "Load SGP30 baseline from custom EEPROM addresses."
    },

// VL53L0X Laser Distance Sensor
    {
        "type": "vl53l0x_setup",
        "message0": Blockly.Msg.BKY_VL53_SETUP || "Setup VL53L0X Address %1",
        "args0": [
            { "type": "input_value", "name": "ADDR", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_VL53_SETUP_TIP || "Setup VL53L0X laser distance sensor."
    },
    {
        "type": "vl53l0x_set_mode",
        "message0": Blockly.Msg.BKY_VL53_SET_MODE || "VL53L0X Set Mode %1 Precision %2",
        "args0": [
            { "type": "field_dropdown", "name": "MODE", "options": [
                [Blockly.Msg.BKY_VL53_MODE_SINGLE || "Single", "eSingle"],
                [Blockly.Msg.BKY_VL53_MODE_CONT || "Continuous", "eContinuous"]
            ]},
            { "type": "field_dropdown", "name": "PREC", "options": [
                [Blockly.Msg.BKY_VL53_PREC_HIGH || "High", "eHigh"],
                [Blockly.Msg.BKY_VL53_PREC_LOW || "Low", "eLow"]
            ]}
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_VL53_SET_MODE_TIP || "Set VL53L0X measurement mode and precision."
    },
    {
        "type": "vl53l0x_control",
        "message0": Blockly.Msg.BKY_VL53_CTRL || "VL53L0X %1 Measurement",
        "args0": [
            { "type": "field_dropdown", "name": "ACT", "options": [
                [Blockly.Msg.BKY_VL53_START || "Start", "START"],
                [Blockly.Msg.BKY_VL53_STOP || "Stop", "STOP"]
            ]}
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_VL53_CTRL_TIP || "Control VL53L0X measurement."
    },
    {
        "type": "vl53l0x_read_value",
        "message0": Blockly.Msg.BKY_VL53_READ || "VL53L0X Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "WHAT", "options": [
                [Blockly.Msg.BKY_VL53_VAL_DIST || "Distance", "DIST"],
                [Blockly.Msg.BKY_VL53_VAL_AMBIENT || "Ambient Light", "AMBIENT"],
                [Blockly.Msg.BKY_VL53_VAL_SIGNAL || "Signal Rate", "SIGNAL"],
                [Blockly.Msg.BKY_VL53_VAL_STATUS || "Status", "STATUS"]
            ]}
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_VL53_READ_TIP || "Read VL53L0X sensor values."
    }
];

// Part 7 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart7);


// Part 8: 나머지 고급센서들
const blockDefinitionsPart8 = [

// SHT31 온습도 센서
    {
        "type": "sht31_setup",
        "message0": Blockly.Msg.BKY_SHT31_SETUP || "Setup SHT31 Address %1",
        "args0": [
            { "type": "input_value", "name": "ADDRESS", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_SETUP_TIP || "Setup SHT31 temperature and humidity sensor."
    },
    {
        "type": "sht31_read",
        "message0": Blockly.Msg.BKY_SHT31_READ || "SHT31 Read %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "FAST",
                "options": [
                    [Blockly.Msg.BKY_SHT31_FAST || "Fast", "true"],
                    [Blockly.Msg.BKY_SHT31_SLOW || "Accurate", "false"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_READ_TIP || "Read data from SHT31 sensor."
    },
    {
        "type": "sht31_is_connected",
        "message0": Blockly.Msg.BKY_SHT31_CONNECTED || "SHT31 Is Connected",
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_CONNECTED_TIP || "Check if SHT31 is connected."
    },
    {
        "type": "sht31_get_data",
        "message0": Blockly.Msg.BKY_SHT31_GET_DATA || "SHT31 Get %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DATA_TYPE",
                "options": [
                    [Blockly.Msg.BKY_SHT31_TEMP_C || "Temperature °C", "TEMP_C"],
                    [Blockly.Msg.BKY_SHT31_TEMP_F || "Temperature °F", "TEMP_F"],
                    [Blockly.Msg.BKY_SHT31_HUMIDITY || "Humidity", "HUMIDITY"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_GET_DATA_TIP || "Get temperature or humidity from SHT31."
    },
    {
        "type": "sht31_heater_control",
        "message0": Blockly.Msg.BKY_SHT31_HEATER || "SHT31 Heater %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ACTION",
                "options": [
                    [Blockly.Msg.BKY_SHT31_HEAT_ON || "On", "ON"],
                    [Blockly.Msg.BKY_SHT31_HEAT_OFF || "Off", "OFF"]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_HEATER_TIP || "Control SHT31 internal heater."
    },
    {
        "type": "sht31_is_heater_on",
        "message0": Blockly.Msg.BKY_SHT31_HEAT_STATUS || "SHT31 Heater Status",
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_HEAT_STATUS_TIP || "Check if SHT31 heater is on."
    },
    {
        "type": "sht31_reset",
        "message0": Blockly.Msg.BKY_SHT31_RESET || "SHT31 Reset %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "HARD",
                "options": [
                    [Blockly.Msg.BKY_SHT31_SOFT || "Soft", "false"],
                    [Blockly.Msg.BKY_SHT31_HARD || "Hard", "true"]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_RESET_TIP || "Reset SHT31 sensor."
    },
    {
        "type": "sht31_get_error",
        "message0": Blockly.Msg.BKY_SHT31_ERROR || "SHT31 Get Error Code",
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SHT31_ERROR_TIP || "Get SHT31 error code."
    },

// Color Sensor
    {
        "type": "color_sensor_setup",
        "message0": Blockly.Msg.BKY_COLOR_SENSOR_SETUP || "Setup Color Sensor",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_COLOR_SENSOR_SETUP_TIP || "Setup color sensor."
    },
    {
        "type": "color_sensor_init",
        "message0": Blockly.Msg.BKY_COLOR_SENSOR_INIT || "Color Sensor Initialize",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_COLOR_SENSOR_INIT_TIP || "Initialize color sensor."
    },
    {
        "type": "color_sensor_trigger",
        "message0": Blockly.Msg.BKY_COLOR_SENSOR_TRIGGER || "Color Sensor Trigger %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ADJUST",
                "options": [
                    [Blockly.Msg.BKY_COLOR_SENSOR_RAW || "Raw", "false"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_ADJUST || "Adjusted", "true"]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_COLOR_SENSOR_TRIGGER_TIP || "Trigger color measurement."
    },
    {
        "type": "color_sensor_get_data",
        "message0": Blockly.Msg.BKY_COLOR_SENSOR_GET_DATA || "Color Sensor Get %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "DATA_TYPE",
                "options": [
                    [Blockly.Msg.BKY_COLOR_SENSOR_RED || "Red", "RED"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_GREEN || "Green", "GREEN"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_BLUE || "Blue", "BLUE"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_HUE || "Hue", "HUE"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_SATURATION || "Saturation", "SATURATION"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_VALUE || "Value", "VALUE"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_COLOR_SENSOR_GET_DATA_TIP || "Get color sensor data."
    },
    {
        "type": "color_sensor_is_color",
        "message0": Blockly.Msg.BKY_COLOR_SENSOR_IS_COLOR || "Color Sensor Is %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "COLOR_ID",
                "options": [
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_RED || "Red", "RED"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_GREEN || "Green", "GREEN"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_BLUE || "Blue", "BLUE"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_YELLOW || "Yellow", "YELLOW"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_CYAN || "Cyan", "CYAN"],
                    [Blockly.Msg.BKY_COLOR_SENSOR_COLOR_MAGENTA || "Magenta", "MAGENTA"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_COLOR_SENSOR_IS_COLOR_TIP || "Check if detected color matches."
    },

// DFRobot_MLX90614 블록 정의

// 1. 설정 블록
{
    "type": "mlx90614_setup",
    "message0": Blockly.Msg.BKY_MLX90614_SETUP || "Setup MLX90614 Temperature Sensor I2C address %1",
    "args0": [
        {
            "type": "input_value",
            "name": "ADDRESS",
            "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MLX90614_SETUP_TIP || "Initialize MLX90614 non-contact temperature sensor with I2C address"
},

// 2. 온도 읽기 블록 (통합)
{
    "type": "mlx90614_read_temp",
    "message0": Blockly.Msg.BKY_MLX90614_READ_TEMP || "Read %1 temperature in %2",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "TEMP_TYPE",
            "options": [
                [Blockly.Msg.BKY_MLX90614_OBJECT || "Object", "OBJECT"],
                [Blockly.Msg.BKY_MLX90614_AMBIENT || "Ambient", "AMBIENT"]
            ]
        },
        {
            "type": "field_dropdown",
            "name": "UNIT",
            "options": [
                [Blockly.Msg.BKY_MLX90614_CELSIUS || "Celsius (°C)", "C"],
                [Blockly.Msg.BKY_MLX90614_FAHRENHEIT || "Fahrenheit (°F)", "F"]
            ]
        }
    ],
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MLX90614_READ_TEMP_TIP || "Read object or ambient temperature in Celsius or Fahrenheit"
},

// APDS9960 제스처센서
    {
        "type": "apds9960_setup",
        "message0": Blockly.Msg.BKY_APDS9960_SETUP || "Setup APDS9960",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_SETUP_TIP || "Setup APDS9960 gesture and light sensor."
    },
    {
        "type": "apds9960_sensor_control",
        "message0": Blockly.Msg.BKY_APDS9960_SENSOR_CONTROL || "APDS9960 %1 %2 Interrupt %3",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SENSOR_TYPE",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_LIGHT || "Light", "LIGHT"],
                    [Blockly.Msg.BKY_APDS9960_PROXIMITY || "Proximity", "PROXIMITY"], 
                    [Blockly.Msg.BKY_APDS9960_GESTURE || "Gesture", "GESTURE"]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "ACTION",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_ENABLE || "Enable", "ENABLE"],
                    [Blockly.Msg.BKY_APDS9960_DISABLE || "Disable", "DISABLE"]
                ]
            },
            {
                "type": "field_dropdown",
                "name": "INTERRUPT",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_INT_ON || "On", "true"],
                    [Blockly.Msg.BKY_APDS9960_INT_OFF || "Off", "false"]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_SENSOR_CONTROL_TIP || "Control APDS9960 sensors."
    },
    {
        "type": "apds9960_read_light",
        "message0": Blockly.Msg.BKY_APDS9960_READ_LIGHT || "APDS9960 Read %1 Light",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "LIGHT_TYPE",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_AMBIENT || "Ambient", "AMBIENT"],
                    [Blockly.Msg.BKY_APDS9960_RED || "Red", "RED"],
                    [Blockly.Msg.BKY_APDS9960_GREEN || "Green", "GREEN"],
                    [Blockly.Msg.BKY_APDS9960_BLUE || "Blue", "BLUE"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_READ_LIGHT_TIP || "Read light values from APDS9960."
    },
    {
        "type": "apds9960_read_proximity",
        "message0": Blockly.Msg.BKY_APDS9960_READ_PROXIMITY || "APDS9960 Read Proximity",
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_READ_PROXIMITY_TIP || "Read proximity value from APDS9960."
    },
    {
        "type": "apds9960_gesture_available",
        "message0": Blockly.Msg.BKY_APDS9960_GESTURE_AVAILABLE || "APDS9960 Gesture Available",
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_GESTURE_AVAILABLE_TIP || "Check if gesture data is available."
    },
    {
        "type": "apds9960_gesture_control",
        "message0": Blockly.Msg.BKY_APDS9960_GESTURE_CONTROL || "APDS9960 Gesture %1 %2",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "ACTION",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_READ_ANY || "Read Any", "READ"],
                    [Blockly.Msg.BKY_APDS9960_CHECK_SPECIFIC || "Check Specific", "CHECK"]
                ]
            },
            {
                "type": "field_dropdown", 
                "name": "GESTURE_TYPE",
                "options": [
                    [Blockly.Msg.BKY_APDS9960_GESTURE_LEFT || "Left", "LEFT"],
                    [Blockly.Msg.BKY_APDS9960_GESTURE_RIGHT || "Right", "RIGHT"],
                    [Blockly.Msg.BKY_APDS9960_GESTURE_UP || "Up", "UP"],
                    [Blockly.Msg.BKY_APDS9960_GESTURE_DOWN || "Down", "DOWN"],
                    [Blockly.Msg.BKY_APDS9960_GESTURE_NEAR || "Near", "NEAR"],
                    [Blockly.Msg.BKY_APDS9960_GESTURE_FAR || "Far", "FAR"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_APDS9960_GESTURE_CONTROL_TIP || "Read or check gestures from APDS9960."
    },

// MAX30105 심박센서 블록 정의 (실용적 버전)

// 1. 기본 센서 설정 블록
{
    "type": "max30105_setup_basic",
    "message0": Blockly.Msg.BKY_MAX30105_SETUP_BASIC || "setup heart rate sensor",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_SETUP_BASIC_TIP || "Setup heart rate sensor for measuring heart rate and oxygen"
},

// 2. 심박수 측정 블록 (BPM 반환)
{
    "type": "max30105_get_heartrate",
    "message0": Blockly.Msg.BKY_MAX30105_GET_HEARTRATE || "get heart rate (BPM)",
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_GET_HEARTRATE_TIP || "Get heart rate in beats per minute"
},

// 3. 혈중산소포화도 측정 블록 (% 반환)
{
    "type": "max30105_get_spo2",
    "message0": Blockly.Msg.BKY_MAX30105_GET_SPO2 || "get blood oxygen (%)",
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_GET_SPO2_TIP || "Get blood oxygen saturation percentage"
},

// 4. 손가락 감지 블록
{
    "type": "max30105_finger_detected",
    "message0": Blockly.Msg.BKY_MAX30105_FINGER_DETECTED || "finger detected",
    "output": "Boolean",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_FINGER_DETECTED_TIP || "Check if finger is placed on sensor"
},

// 5. 심박 비트 감지 블록 (새로운 심박 발생시 true)
{
    "type": "max30105_beat_detected",
    "message0": Blockly.Msg.BKY_MAX30105_BEAT_DETECTED || "heartbeat detected",
    "output": "Boolean",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_BEAT_DETECTED_TIP || "Returns true when a new heartbeat is detected"
},

// 6. 센서 상태 확인 블록
{
    "type": "max30105_sensor_ready",
    "message0": Blockly.Msg.BKY_MAX30105_SENSOR_READY || "sensor ready",
    "output": "Boolean",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_SENSOR_READY_TIP || "Check if sensor has enough data for measurement"
},

// 7. 온도 읽기 블록
{
    "type": "max30105_get_temperature",
    "message0": Blockly.Msg.BKY_MAX30105_GET_TEMP || "get sensor temperature (°C)",
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_GET_TEMP_TIP || "Get the sensor temperature in Celsius"
},

// --- 고급 사용자용 블록들 ---

// 8. 고급 설정 블록
{
    "type": "max30105_setup_advanced",
    "message0": Blockly.Msg.BKY_MAX30105_SETUP_ADVANCED || "setup sensor (advanced) for %1 with %2 power",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "MODE",
            "options": [
                [Blockly.Msg.BKY_MAX30105_MODE_HEARTRATE || "heart rate", "HEARTRATE"],
                [Blockly.Msg.BKY_MAX30105_MODE_OXYGEN || "blood oxygen", "OXYGEN"],
                [Blockly.Msg.BKY_MAX30105_MODE_PROXIMITY || "finger detection", "PROXIMITY"]
            ]
        },
        {
            "type": "field_dropdown",
            "name": "POWER",
            "options": [
                [Blockly.Msg.BKY_MAX30105_POWER_LOW || "low", "LOW"],
                [Blockly.Msg.BKY_MAX30105_POWER_MEDIUM || "medium", "MEDIUM"],
                [Blockly.Msg.BKY_MAX30105_POWER_HIGH || "high", "HIGH"]
            ]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_SETUP_ADVANCED_TIP || "Advanced sensor setup for experienced users"
},

// 9. 원시 적색 LED 값 (고급용)
{
    "type": "max30105_get_red_raw",
    "message0": Blockly.Msg.BKY_MAX30105_GET_RED_RAW || "get raw red LED value",
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_GET_RED_RAW_TIP || "Get raw red LED sensor value (advanced)"
},

// 10. 원시 적외선 LED 값 (고급용)
{
    "type": "max30105_get_ir_raw",
    "message0": Blockly.Msg.BKY_MAX30105_GET_IR_RAW || "get raw infrared LED value",
    "output": "Number",
    "colour": "#4D68EC",
    "tooltip": Blockly.Msg.BKY_MAX30105_GET_IR_RAW_TIP || "Get raw infrared LED sensor value (advanced)"
},

// SI7021 온습도센서
    {
        "type": "si7021_setup",
        "message0": Blockly.Msg.BKY_SI7021_SETUP || "Setup SI7021",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SI7021_SETUP_TOOLTIP || "Setup SI7021 temperature and humidity sensor."
    },
    {
        "type": "si7021_read_value",
        "message0": Blockly.Msg.BKY_SI7021_READ || "SI7021 Read %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "VALUE_TYPE",
                "options": [
                    [Blockly.Msg.BKY_SI7021_TEMP || "Temperature", "TEMP"],
                    [Blockly.Msg.BKY_SI7021_HUMIDITY || "Humidity", "HUMIDITY"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SI7021_READ_TOOLTIP || "Read temperature or humidity from SI7021."
    },
    {
        "type": "si7021_reset",
        "message0": Blockly.Msg.BKY_SI7021_RESET || "SI7021 Reset",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SI7021_RESET_TOOLTIP || "Reset SI7021 sensor."
    },
    {
        "type": "si7021_get_serial",
        "message0": Blockly.Msg.BKY_SI7021_SERIAL || "SI7021 Get Serial %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "SERIAL_PART",
                "options": [
                    [Blockly.Msg.BKY_SERIAL_A || "Serial A", "SERIAL_A"],
                    [Blockly.Msg.BKY_SERIAL_B || "Serial B", "SERIAL_B"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#4D68EC",
        "tooltip": Blockly.Msg.BKY_SI7021_SERIAL_TOOLTIP || "Get SI7021 serial number."
    }
];

// Part 8 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart8);


// Part 9: 모터 카테고리
const blockDefinitionsPart9 = [

// 14. ===============================================================모터 카테고리
// DC모터 L9110
    {
        "type": "dcmotor_setup",
        "message0": Blockly.Msg.BKY_DCMOTOR_SETUP || "Setup DC Motor %1 Pin A %2 Pin B %3",
        "args0": [
            { "type": "field_number", "name": "MOTOR_NUM", "value": 1, "min": 1 },
            { "type": "input_value", "name": "PIN_A", "check": "Number" },
            { "type": "input_value", "name": "PIN_B", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_DCMOTOR_SETUP_TOOLTIP || "Setup DC motor with L9110 driver."
    },
    {
        "type": "dcmotor_run",
        "message0": Blockly.Msg.BKY_DCMOTOR_RUN || "DC Motor %1 Speed %2 Direction %3",
        "args0": [
            { "type": "field_number", "name": "MOTOR_NUM", "value": 1, "min": 1 },
            { "type": "input_value", "name": "SPEED", "check": "Number" },
            { "type": "field_dropdown", "name": "DIRECTION", "options": [
                [Blockly.Msg.BKY_DCMOTOR_CLOCKWISE || "Clockwise", "1"], 
                [Blockly.Msg.BKY_DCMOTOR_COUNTERCLOCKWISE || "Counter-clockwise", "0"]
            ]}
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_DCMOTOR_RUN_TOOLTIP || "Run DC motor at specified speed and direction."
    },
    {
        "type": "dcmotor_stop",
        "message0": Blockly.Msg.BKY_DCMOTOR_STOP || "DC Motor %1 Stop",
        "args0": [ { "type": "field_number", "name": "MOTOR_NUM", "value": 1, "min": 1 } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_DCMOTOR_STOP_TOOLTIP || "Stop DC motor."
    },

// Stepper Motor (AccelStepper)
    {
        "type": "accelstepper_setup",
        "message0": Blockly.Msg.BKY_ACCELSTEPPER_SETUP || "Setup AccelStepper %1 Interface %2 Pin1 %3 Pin2 %4",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "INTERFACE", "options": [
                [Blockly.Msg.BKY_ACCELSTEPPER_DRIVER || "Driver", "DRIVER"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_FULL2WIRE || "Full 2-wire", "FULL2WIRE"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_FULL4WIRE || "Full 4-wire", "FULL4WIRE"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_HALF4WIRE || "Half 4-wire", "HALF4WIRE"]
            ]},
            { "type": "input_value", "name": "PIN1", "check": "Number" },
            { "type": "input_value", "name": "PIN2", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_ACCELSTEPPER_SETUP_TIP || "Setup AccelStepper motor."
    },
    {
        "type": "accelstepper_settings",
        "message0": Blockly.Msg.BKY_ACCELSTEPPER_SETTINGS || "AccelStepper %1 MaxSpeed %2 Accel %3 Speed %4 Steps/Rev %5",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "input_value", "name": "MAX_SPEED", "check": "Number" },
            { "type": "input_value", "name": "ACCELERATION", "check": "Number" },
            { "type": "input_value", "name": "SPEED", "check": "Number" },
            { "type": "input_value", "name": "STEPS", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_ACCELSTEPPER_SETTINGS_TIP || "Configure AccelStepper parameters."
    },
    {
        "type": "accelstepper_move",
        "message0": Blockly.Msg.BKY_ACCELSTEPPER_MOVE || "AccelStepper %1 %2 Position %3",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "MOVE_TYPE", "options": [
                [Blockly.Msg.BKY_ACCELSTEPPER_MOVE_TO || "Move To", "MOVE_TO"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_MOVE_REL || "Move Relative", "MOVE_REL"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_SET_POS || "Set Position", "SET_POS"]
            ]},
            { "type": "input_value", "name": "POSITION", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_ACCELSTEPPER_MOVE_TIP || "Move AccelStepper to position."
    },
    {
        "type": "accelstepper_control",
        "message0": Blockly.Msg.BKY_ACCELSTEPPER_CONTROL || "AccelStepper %1 %2",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "CONTROL_TYPE", "options": [
                [Blockly.Msg.BKY_ACCELSTEPPER_RUN || "Run", "RUN"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_RUN_SPEED || "Run Speed", "RUN_SPEED"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_RUN_TO_POS || "Run to Position", "RUN_TO_POS"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_STOP || "Stop", "STOP"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_ENABLE || "Enable", "ENABLE"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_DISABLE || "Disable", "DISABLE"]
            ]}
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_ACCELSTEPPER_CONTROL_TIP || "Control AccelStepper operation."
    },
    {
        "type": "accelstepper_status",
        "message0": Blockly.Msg.BKY_ACCELSTEPPER_STATUS || "AccelStepper %1 Get %2",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "STATUS_TYPE", "options": [
                [Blockly.Msg.BKY_ACCELSTEPPER_CURRENT_POS || "Current Position", "CURRENT_POS"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_TARGET_POS || "Target Position", "TARGET_POS"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_DISTANCE || "Distance to Go", "DISTANCE"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_IS_RUNNING || "Is Running", "IS_RUNNING"], 
                [Blockly.Msg.BKY_ACCELSTEPPER_SPEED || "Speed", "SPEED"]
            ]}
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_ACCELSTEPPER_STATUS_TIP || "Get AccelStepper status information."
    },

// Stepper Motor (StepperMulti)
    {
        "type": "steppermulti_setup",
        "message0": Blockly.Msg.BKY_STEPPERMULTI_SETUP || "Setup Stepper Motor %2 Type %1 Config %3",
        "args0": [
            { "type": "field_dropdown", "name": "MOTOR_TYPE", "options": [
                [Blockly.Msg.BKY_STEPPERMULTI_28BYJ || "28BYJ-48", "28BYJ"], 
                [Blockly.Msg.BKY_STEPPERMULTI_ULN2003 || "ULN2003", "ULN2003"], 
                [Blockly.Msg.BKY_STEPPERMULTI_CUSTOM || "Custom", "CUSTOM"]
            ]},
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "PIN_CONFIG", "options": [
                [Blockly.Msg.BKY_STEPPERMULTI_4PIN || "4 Pin", "4PIN"], 
                [Blockly.Msg.BKY_STEPPERMULTI_2PIN || "2 Pin", "2PIN"]
            ]}
        ],
        "message1": Blockly.Msg.BKY_STEPPERMULTI_SETUP_PINS || "Pin1 %1 Pin2 %2 Pin3 %3 Pin4 %4",
        "args1": [
            { "type": "input_value", "name": "PIN1", "check": "Number" },
            { "type": "input_value", "name": "PIN2", "check": "Number" },
            { "type": "input_value", "name": "PIN3", "check": "Number" },
            { "type": "input_value", "name": "PIN4", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_STEPPERMULTI_SETUP_TIP || "Setup multi-configuration stepper motor."
    },
    {
        "type": "steppermulti_speed",
        "message0": Blockly.Msg.BKY_STEPPERMULTI_SPEED || "Stepper Motor %1 Set Speed %2 RPM",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "input_value", "name": "SPEED", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_STEPPERMULTI_SPEED_TIP || "Set stepper motor speed in RPM."
    },
    {
        "type": "steppermulti_move",
        "message0": Blockly.Msg.BKY_STEPPERMULTI_MOVE || "Stepper Motor %1 Move %2 %3",
        "args0": [
            { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" },
            { "type": "field_dropdown", "name": "MOVE_TYPE", "options": [
                [Blockly.Msg.BKY_STEPPERMULTI_STEP || "Steps", "STEP"], 
                [Blockly.Msg.BKY_STEPPERMULTI_ANGLE || "Degrees", "ANGLE"]
            ]},
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_STEPPERMULTI_MOVE_TIP || "Move stepper motor by steps or degrees."
    },
    {
        "type": "steppermulti_run",
        "message0": Blockly.Msg.BKY_STEPPERMULTI_RUN || "Stepper Motor %1 Run",
        "args0": [ { "type": "input_value", "name": "MOTOR_NUM", "check": "Number" } ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#50B91A",
        "tooltip": Blockly.Msg.BKY_STEPPERMULTI_RUN_TIP || "Execute stepper motor movement."
    },


// ===================== PWM Servo Driver Block Definitions =====================

// 1) 설정 블록
{
    "type": "pwmservo_setup",
    "message0": Blockly.Msg.BKY_PWMSERVO_SETUP || "Setup PWM Servo Driver %1 I2C Address %2 PWM Frequency %3 Hz",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "ADDR", "options": [
            ["0x40", "0x40"],
            ["0x41", "0x41"],
            ["0x42", "0x42"],
            ["0x43", "0x43"],
            ["0x44", "0x44"],
            ["0x45", "0x45"],
            ["0x46", "0x46"],
            ["0x47", "0x47"]
        ]},
        {"type": "input_value", "name": "FREQ", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_SETUP_TIP || "Setup 16-channel PWM servo driver with I2C connection."
},

// 2) 서보모터 제어 (각도)
{
    "type": "pwmservo_servo_angle",
    "message0": Blockly.Msg.BKY_PWMSERVO_SERVO_ANGLE || "Servo Driver %1 Channel %2 Set Angle %3 degrees",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CHANNEL", "check": "Number"},
        {"type": "input_value", "name": "ANGLE", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_SERVO_ANGLE_TIP || "Control servo motor angle (0-180 degrees)."
},

// 3) 서보모터 제어 (마이크로초)
{
    "type": "pwmservo_servo_microseconds",
    "message0": Blockly.Msg.BKY_PWMSERVO_SERVO_MICROSECONDS || "Servo Driver %1 Channel %2 Set Pulse %3 microseconds",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CHANNEL", "check": "Number"},
        {"type": "input_value", "name": "MICROSECONDS", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_SERVO_MICROSECONDS_TIP || "Control servo motor with precise pulse width (500-2500 microseconds)."
},

// 4) PWM 출력 제어
{
    "type": "pwmservo_pwm_output",
    "message0": Blockly.Msg.BKY_PWMSERVO_PWM_OUTPUT || "Servo Driver %1 Channel %2 PWM Value %3 (0-4095)",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CHANNEL", "check": "Number"},
        {"type": "input_value", "name": "VALUE", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_PWM_OUTPUT_TIP || "Set PWM output value for LED or motor control (0-4095)."
},

// 5) PWM 고급 제어
{
    "type": "pwmservo_pwm_advanced",
    "message0": Blockly.Msg.BKY_PWMSERVO_PWM_ADVANCED || "Servo Driver %1 Channel %2 PWM On %3 Off %4",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CHANNEL", "check": "Number"},
        {"type": "input_value", "name": "ON", "check": "Number"},
        {"type": "input_value", "name": "OFF", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_PWMSERVO_PWM_ADVANCED_TIP || "Advanced PWM control with on/off timing (0-4095)."
},

// 6) 전원 관리
{
    "type": "pwmservo_power",
    "message0": Blockly.Msg.BKY_PWMSERVO_POWER || "Servo Driver %1 %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "field_dropdown", "name": "ACTION", "options": [
            [Blockly.Msg.BKY_PWMSERVO_POWER_WAKEUP || "Wake Up", "WAKEUP"],
            [Blockly.Msg.BKY_PWMSERVO_POWER_SLEEP || "Sleep", "SLEEP"],
            [Blockly.Msg.BKY_PWMSERVO_POWER_RESET || "Reset", "RESET"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_POWER_TIP || "Control servo driver power management."
},

// 7) 다중 서보 제어
{
    "type": "pwmservo_multi_servo",
    "message0": Blockly.Msg.BKY_PWMSERVO_MULTI_SERVO || "Servo Driver %1 Set Multiple Servos Ch1 %2° Ch2 %3° Ch3 %4° Ch4 %5°",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "ANGLE1", "check": "Number"},
        {"type": "input_value", "name": "ANGLE2", "check": "Number"},
        {"type": "input_value", "name": "ANGLE3", "check": "Number"},
        {"type": "input_value", "name": "ANGLE4", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_MULTI_SERVO_TIP || "Control multiple servo motors simultaneously."
},

// 8) LED 밝기 제어
{
    "type": "pwmservo_led_brightness",
    "message0": Blockly.Msg.BKY_PWMSERVO_LED_BRIGHTNESS || "Servo Driver %1 Channel %2 LED Brightness %3 %",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CHANNEL", "check": "Number"},
        {"type": "input_value", "name": "BRIGHTNESS", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#50B91A",
    "tooltip": Blockly.Msg.BKY_PWMSERVO_LED_BRIGHTNESS_TIP || "Control LED brightness using PWM (0-100%)."
}
];

// Part 9 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart9);

// Part 10: 출력장치 카테고리
const blockDefinitionsPart10 = [

// 15. ===============================================================출력장치 카테고리
// Buzzer
    {
        "type": "buzzer_tone_setup",
        "message0": Blockly.Msg.BKY_BUZZER_TONE_SETUP || "Setup Buzzer Tone Library",
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_BUZZER_TONE_SETUP_TOOLTIP || "Setup buzzer tone library for music playback."
    },
    {
        "type": "buzzer_play_note",
        "message0": Blockly.Msg.BKY_BUZZER_PLAY_NOTE || "Buzzer Pin %1 Play Note %2 Beat %3",
        "args0": [
            { "type": "input_value", "name": "PIN", "check": "Number" },
            {
                "type": "field_dropdown", "name": "NOTE",
                "options": [
                    [Blockly.Msg.BKY_NOTE_C4 || "C4", "262"], 
                    [Blockly.Msg.BKY_NOTE_CS4 || "C#4", "277"], 
                    [Blockly.Msg.BKY_NOTE_D4 || "D4", "294"],
                    [Blockly.Msg.BKY_NOTE_DS4 || "D#4", "311"],
                    [Blockly.Msg.BKY_NOTE_E4 || "E4", "330"], 
                    [Blockly.Msg.BKY_NOTE_F4 || "F4", "349"],
                    [Blockly.Msg.BKY_NOTE_FS4 || "F#4", "370"],
                    [Blockly.Msg.BKY_NOTE_G4 || "G4", "392"], 
                    [Blockly.Msg.BKY_NOTE_GS4 || "G#4", "415"],
                    [Blockly.Msg.BKY_NOTE_A4 || "A4", "440"],
                    [Blockly.Msg.BKY_NOTE_AS4 || "A#4", "466"],
                    [Blockly.Msg.BKY_NOTE_B4 || "B4", "494"], 
                    [Blockly.Msg.BKY_NOTE_C5 || "C5", "523"],
                    [Blockly.Msg.BKY_NOTE_REST || "Rest", "0"]
                ]
            },
            {
                "type": "field_dropdown", "name": "BEAT",
                "options": [
                    [Blockly.Msg.BKY_BEAT_WHOLE || "Whole", "4"],
                    [Blockly.Msg.BKY_BEAT_DOTTED_HALF || "Dotted Half", "3"],
                    [Blockly.Msg.BKY_BEAT_HALF || "Half", "2"],
                    [Blockly.Msg.BKY_BEAT_DOTTED_QUARTER || "Dotted Quarter", "1.5"],
                    [Blockly.Msg.BKY_BEAT_QUARTER || "Quarter", "1"],
                    [Blockly.Msg.BKY_BEAT_EIGHTH || "Eighth", "0.5"],
                    [Blockly.Msg.BKY_BEAT_SIXTEENTH || "Sixteenth", "0.25"]
                ]
            }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_BUZZER_PLAY_NOTE_TOOLTIP || "Play musical note on buzzer."
    },
    {
        "type": "buzzer_set_tempo",
        "message0": Blockly.Msg.BKY_BUZZER_SET_TEMPO || "Buzzer Set Tempo %1 BPM",
        "args0": [
            { "type": "input_value", "name": "BPM", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_BUZZER_SET_TEMPO_TOOLTIP || "Set buzzer tempo in beats per minute."
    },
    {
        "type": "buzzer_stop",
        "message0": Blockly.Msg.BKY_BUZZER_STOP || "Buzzer Pin %1 Stop",
        "args0": [
            { "type": "input_value", "name": "PIN", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_BUZZER_STOP_TOOLTIP || "Stop buzzer sound."
    },

// MP3 (KT403A)
    {
        "type": "mp3_setup_kt403a",
        "message0": Blockly.Msg.BKY_MP3_SETUP || "Setup MP3 Device %1 RX Pin %2 TX Pin %3 Volume %4",
        "args0": [
            { "type": "field_dropdown", "name": "DEVICE", "options": [
                [Blockly.Msg.BKY_MP3_DEV_SD || "SD Card", "0x02"],
                [Blockly.Msg.BKY_MP3_DEV_UDISK || "USB Disk", "0x01"]
            ]},
            { "type": "input_value", "name": "RX", "check": "Number" },
            { "type": "input_value", "name": "TX", "check": "Number" },
            { "type": "input_value", "name": "VOL", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_SETUP_TIP || "Setup MP3 player module."
    },
    {
        "type": "mp3_play_index",
        "message0": Blockly.Msg.BKY_MP3_PLAY_INDEX || "MP3 Play Track %1",
        "args0": [ { "type": "input_value", "name": "INDEX", "check": "Number" } ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_PLAY_INDEX_TIP || "Play MP3 track by index number."
    },
    {
        "type": "mp3_play_folder",
        "message0": Blockly.Msg.BKY_MP3_PLAY_FOLDER || "MP3 Play Folder %1 File %2",
        "args0": [
            { "type": "input_value", "name": "FOLDER", "check": "Number" },
            { "type": "input_value", "name": "FILE", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_PLAY_FOLDER_TIP || "Play MP3 file from specific folder."
    },
    {
        "type": "mp3_set_volume",
        "message0": Blockly.Msg.BKY_MP3_SET_VOLUME || "MP3 Set Volume %1",
        "args0": [ { "type": "input_value", "name": "VOL", "check": "Number" } ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_SET_VOLUME_TIP || "Set MP3 player volume."
    },
    {
        "type": "mp3_control",
        "message0": Blockly.Msg.BKY_MP3_CONTROL || "MP3 %1",
        "args0": [
            { "type": "field_dropdown", "name": "CMD", "options": [
                [Blockly.Msg.BKY_MP3_NEXT || "Next Track", "NEXT"],
                [Blockly.Msg.BKY_MP3_PREV || "Previous Track", "PREV"],
                [Blockly.Msg.BKY_MP3_PAUSE || "Pause", "PAUSE"],
                [Blockly.Msg.BKY_MP3_RESUME || "Resume", "RESUME"],
                [Blockly.Msg.BKY_MP3_LOOP_ALL || "Loop All", "LOOP_ALL"],
                [Blockly.Msg.BKY_MP3_VOL_UP || "Volume Up", "VOL_UP"],
                [Blockly.Msg.BKY_MP3_VOL_DOWN || "Volume Down", "VOL_DOWN"],
                [Blockly.Msg.BKY_MP3_PRINT_RET || "Print Return", "PRINT_RET"]
            ]}
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_CONTROL_TIP || "Control MP3 player playback."
    },
    {
        "type": "mp3_query_status",
        "message0": Blockly.Msg.BKY_MP3_QUERY_STATUS || "MP3 Get Status",
        "inputsInline": true,
        "output": "Number",
        "colour": "#70D650",
        "tooltip": Blockly.Msg.BKY_MP3_QUERY_STATUS_TIP || "Get MP3 player status."
    },

// ===================== SD Card Library Block Definitions =====================

// 1) SD 카드 설정 블록
{
    "type": "sd_setup",
    "message0": Blockly.Msg.BKY_SD_SETUP || "Setup SD Card %1 CS Pin %2 MOSI Pin %3 MISO Pin %4 SCK Pin %5",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "CS", "check": "Number"},
        {"type": "input_value", "name": "MOSI", "check": "Number"},
        {"type": "input_value", "name": "MISO", "check": "Number"},
        {"type": "input_value", "name": "SCK", "check": "Number"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_SETUP_TIP || "Initialize SD card with specified SPI pins."
},

// 2) 파일 열기 블록
{
    "type": "sd_open_file",
    "message0": Blockly.Msg.BKY_SD_OPEN_FILE || "Open File %1 Filename %2 Mode %3",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"},
        {"type": "input_value", "name": "FILENAME", "check": ["String", "Number"]},
        {"type": "field_dropdown", "name": "MODE", "options": [
            [Blockly.Msg.BKY_SD_MODE_READ || "Read", "FILE_READ"],
            [Blockly.Msg.BKY_SD_MODE_WRITE || "Write", "FILE_WRITE"]
        ]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_OPEN_FILE_TIP || "Open file for reading or writing."
},

// 3) 파일에 쓰기 블록
{
    "type": "sd_write_file",
    "message0": Blockly.Msg.BKY_SD_WRITE_FILE || "Write to File %1 Data %2",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"},
        {"type": "input_value", "name": "DATA", "check": ["String", "Number"]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_WRITE_FILE_TIP || "Write data to opened file."
},

// 4) 파일에서 읽기 블록 (값 반환)
{
    "type": "sd_read_file",
    "message0": Blockly.Msg.BKY_SD_READ_FILE || "Read from File %1",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"}
    ],
    "output": "String",
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_READ_FILE_TIP || "Read data from opened file."
},

// 5) 파일 존재 확인 블록 (값 반환)
{
    "type": "sd_file_exists",
    "message0": Blockly.Msg.BKY_SD_FILE_EXISTS || "File Exists %1 Filename %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "FILENAME", "check": ["String", "Number"]}
    ],
    "output": "Boolean",
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_FILE_EXISTS_TIP || "Check if file exists on SD card."
},

// 6) 파일 크기 확인 블록 (값 반환)
{
    "type": "sd_file_size",
    "message0": Blockly.Msg.BKY_SD_FILE_SIZE || "File Size %1",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"}
    ],
    "output": "Number",
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_FILE_SIZE_TIP || "Get size of opened file in bytes."
},

// 7) 파일 닫기 블록
{
    "type": "sd_close_file",
    "message0": Blockly.Msg.BKY_SD_CLOSE_FILE || "Close File %1",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_CLOSE_FILE_TIP || "Close opened file."
},

// 8) 파일 삭제 블록
{
    "type": "sd_remove_file",
    "message0": Blockly.Msg.BKY_SD_REMOVE_FILE || "Delete File %1 Filename %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "FILENAME", "check": ["String", "Number"]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_REMOVE_FILE_TIP || "Delete file from SD card."
},

// 9) 디렉토리 생성 블록
{
    "type": "sd_make_directory",
    "message0": Blockly.Msg.BKY_SD_MAKE_DIRECTORY || "Create Directory %1 Path %2",
    "args0": [
        {"type": "input_value", "name": "NUM", "check": "Number"},
        {"type": "input_value", "name": "PATH", "check": ["String", "Number"]}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_MAKE_DIRECTORY_TIP || "Create directory on SD card."
},

// 10) 파일 사용 가능한 바이트 수 (값 반환)
{
    "type": "sd_file_available",
    "message0": Blockly.Msg.BKY_SD_FILE_AVAILABLE || "Available Bytes %1",
    "args0": [
        {"type": "input_value", "name": "FILE_VAR", "check": "String"}
    ],
    "output": "Number",
    "colour": "#70D650",
    "inputsInline": true,
    "tooltip": Blockly.Msg.BKY_SD_FILE_AVAILABLE_TIP || "Get number of bytes available for reading."
}
];

// Part 10 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart10);

// Part 11: 통신장치 카테고리
const blockDefinitionsPart11 = [

// 15. ===============================================================통신장치 카테고리
// IR 적외선 송신/수신 블록들
    {
        "type": "ir_setup",
        "message0": Blockly.Msg.BKY_IR_SETUP || "Setup IR Receiver Pin %1",
        "args0": [
            { "type": "input_value", "name": "PIN", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_IR_SETUP_TIP || "Setup infrared receiver."
    },
    {
        "type": "ir_available",
        "message0": Blockly.Msg.BKY_IR_AVAILABLE || "IR Data Available",
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_IR_AVAILABLE_TIP || "Check if IR data is available."
    },
    {
        "type": "ir_read_button",
        "message0": Blockly.Msg.BKY_IR_READ_BUTTON || "IR Read Button Code",
        "inputsInline": true,
        "output": "Number",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_IR_READ_BUTTON_TIP || "Read IR button code."
    },
    {
        "type": "ir_read_raw",
        "message0": Blockly.Msg.BKY_IR_READ_RAW || "IR Read Raw Data",
        "inputsInline": true,
        "output": "Number",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_IR_READ_RAW_TIP || "Read raw IR data."
    },
    {
        "type": "ir_button_is",
        "message0": Blockly.Msg.BKY_IR_BUTTON_IS || "IR Button Is %1",
        "args0": [
            {
                "type": "field_dropdown",
                "name": "BUTTON",
                "options": [
                    [Blockly.Msg.BKY_IR_BTN_0 || "0", "0"],
                    [Blockly.Msg.BKY_IR_BTN_1 || "1", "1"],
                    [Blockly.Msg.BKY_IR_BTN_2 || "2", "2"],
                    [Blockly.Msg.BKY_IR_BTN_3 || "3", "3"],
                    [Blockly.Msg.BKY_IR_BTN_4 || "4", "4"],
                    [Blockly.Msg.BKY_IR_BTN_5 || "5", "5"],
                    [Blockly.Msg.BKY_IR_BTN_6 || "6", "6"],
                    [Blockly.Msg.BKY_IR_BTN_7 || "7", "7"],
                    [Blockly.Msg.BKY_IR_BTN_8 || "8", "8"],
                    [Blockly.Msg.BKY_IR_BTN_9 || "9", "9"],
                    [Blockly.Msg.BKY_IR_BTN_CH_DOWN || "CH-", "10"],
                    [Blockly.Msg.BKY_IR_BTN_CH || "CH", "11"],
                    [Blockly.Msg.BKY_IR_BTN_CH_UP || "CH+", "12"],
                    [Blockly.Msg.BKY_IR_BTN_PREV || "Prev", "20"],
                    [Blockly.Msg.BKY_IR_BTN_NEXT || "Next", "21"],
                    [Blockly.Msg.BKY_IR_BTN_PLAY || "Play", "22"],
                    [Blockly.Msg.BKY_IR_BTN_VOL_DOWN || "Vol-", "30"],
                    [Blockly.Msg.BKY_IR_BTN_VOL_UP || "Vol+", "31"]
                ]
            }
        ],
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_IR_BUTTON_IS_TIP || "Check if specific IR button was pressed."
    },

// RF433
    {
        "type": "rf433_setup",
        "message0": Blockly.Msg.BKY_RF433_SETUP || "Setup RF433 Module",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_SETUP_TIP || "Setup RF433 wireless communication."
    },
    {
        "type": "rf433_config",
        "message0": Blockly.Msg.BKY_RF433_CONFIG || "RF433 TX Pin %1 Send Message \"%2\"",
        "args0": [
            { "type": "input_value", "name": "TX_PIN", "check": "Number" },
            { "type": "input_value", "name": "MESSAGE", "check": "String" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_CONFIG_TIP || "Configure RF433 transmitter and send message."
    },
    {
        "type": "rf433_rx_setup",
        "message0": Blockly.Msg.BKY_RF433_RX_SETUP || "RF433 RX Setup Pin %1 Speed %2",
        "args0": [
            { "type": "input_value", "name": "RX_PIN", "check": "Number" },
            { "type": "input_value", "name": "SPEED", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_RX_SETUP_TIP || "Setup RF433 receiver."
    },
    {
        "type": "rf433_rx_start",
        "message0": Blockly.Msg.BKY_RF433_RX_START || "RF433 Start Receiving",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_RX_START_TIP || "Start RF433 receiver."
    },
    {
        "type": "rf433_have_message",
        "message0": Blockly.Msg.BKY_RF433_HAVE_MESSAGE || "RF433 Has Message",
        "inputsInline": true,
        "output": "Boolean",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_HAVE_MESSAGE_TIP || "Check if RF433 message is available."
    },
    {
        "type": "rf433_get_message",
        "message0": Blockly.Msg.BKY_RF433_GET_MESSAGE || "RF433 Get Message",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_GET_MESSAGE_TIP || "Process received RF433 message."
    },
    {
        "type": "rf433_read_data",
        "message0": Blockly.Msg.BKY_RF433_READ_DATA || "RF433 Read Data",
        "inputsInline": true,
        "output": "String",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_RF433_READ_DATA_TIP || "Read RF433 message data."
    },

// GPS (TinyGPS++)
    {
        "type": "gps_setup_tinygps",
        "message0": Blockly.Msg.BKY_GPS_SETUP_TGPS || "Setup GPS %1 Baud %2",
        "args0": [
            { "type": "field_dropdown", "name": "SER", "options": [
                ["Serial","Serial"], ["Serial1","Serial1"], ["Serial2","Serial2"], ["SoftwareSerial","Soft"]
            ]},
            { "type": "input_value", "name": "BAUD", "check": "Number" }
        ],
        "message1": Blockly.Msg.BKY_GPS_SETUP_TGPS2 || "RX Pin %1 TX Pin %2",
        "args1": [
            { "type": "input_value", "name": "RX", "check": "Number" },
            { "type": "input_value", "name": "TX", "check": "Number" }
        ],
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_SETUP_TGPS_TIP || "Setup GPS module with TinyGPS++ library."
    },
    {
        "type": "gps_update_from_serial",
        "message0": Blockly.Msg.BKY_GPS_UPDATE || "GPS Update From Serial",
        "inputsInline": true,
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_UPDATE_TIP || "Update GPS data from serial."
    },
    {
        "type": "gps_read_value",
        "message0": Blockly.Msg.BKY_GPS_READ || "GPS Read %1",
        "args0": [
            { "type": "field_dropdown", "name": "WHAT", "options": [
                [Blockly.Msg.BKY_GPS_LAT || "Latitude", "LAT"],
                [Blockly.Msg.BKY_GPS_LNG || "Longitude", "LNG"],
                [Blockly.Msg.BKY_GPS_SPEED || "Speed km/h", "SPEED_KMPH"],
                [Blockly.Msg.BKY_GPS_ALT || "Altitude m", "ALT_M"],
                [Blockly.Msg.BKY_GPS_COURSE || "Course °", "COURSE_DEG"],
                [Blockly.Msg.BKY_GPS_SATS || "Satellites", "SATS"],
                [Blockly.Msg.BKY_GPS_HDOP || "HDOP", "HDOP"],
                [Blockly.Msg.BKY_GPS_YEAR || "Year", "YEAR"],
                [Blockly.Msg.BKY_GPS_MONTH || "Month", "MONTH"],
                [Blockly.Msg.BKY_GPS_DAY || "Day", "DAY"],
                [Blockly.Msg.BKY_GPS_HOUR || "Hour", "HOUR"],
                [Blockly.Msg.BKY_GPS_MIN || "Minute", "MIN"],
                [Blockly.Msg.BKY_GPS_SEC || "Second", "SEC"]
            ]}
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_READ_TIP || "Read GPS values."
    },
    {
        "type": "gps_has_fix",
        "message0": Blockly.Msg.BKY_GPS_HAS_FIX || "GPS Has Fix",
        "inputsInline": true,
        "output": "Number",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_HAS_FIX_TIP || "Check if GPS has location fix."
    },
    {
        "type": "gps_between_calc",
        "message0": Blockly.Msg.BKY_GPS_BETWEEN || "GPS Calculate %1 From Lat1 %2 Lng1 %3 To Lat2 %4 Lng2 %5",
        "args0": [
            { "type": "field_dropdown", "name": "WHAT", "options": [
                [Blockly.Msg.BKY_GPS_DIST_M || "Distance m", "DIST_M"],
                [Blockly.Msg.BKY_GPS_COURSE_DEG || "Course °", "COURSE_DEG"]
            ]},
            { "type": "input_value", "name": "LAT1", "check": "Number" },
            { "type": "input_value", "name": "LNG1", "check": "Number" },
            { "type": "input_value", "name": "LAT2", "check": "Number" },
            { "type": "input_value", "name": "LNG2", "check": "Number" }
        ],
        "inputsInline": true,
        "output": "Number",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_BETWEEN_TIP || "Calculate distance or course between two GPS coordinates."
    },
    {
        "type": "gps_cardinal",
        "message0": Blockly.Msg.BKY_GPS_CARDINAL || "GPS Course %1 to Cardinal Direction",
        "args0": [
            { "type": "input_value", "name": "COURSE", "check": "Number" }
        ],
        "inputsInline": true,
        "output": "String",
        "colour": "#F75ACF",
        "tooltip": Blockly.Msg.BKY_GPS_CARDINAL_TIP || "Convert GPS course to cardinal direction."
    }
];

// Part 11 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart11);

// Part 12: 시리얼 통신과 유틸리티 카테고리
const blockDefinitionsPart12 = [

// 16. ===============================================================시리얼 통신 카테고리
    {
        "type": "util_serial_begin",
        "message0": Blockly.Msg.BKY_UTIL_SERIAL_BEGIN || "Serial Begin %1",
        "args0": [
            { "type": "field_dropdown", "name": "BAUD", "options": [["9600", "9600"], ["115200", "115200"]] }
        ],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_SERIAL_BEGIN_TOOLTIP || "Initialize serial communication."
    },
    {
        "type": "util_serial_available_check",
        "message0": Blockly.Msg.BKY_UTIL_SERIAL_AVAILABLE_CHECK || "Serial Data Available",
        "output": "Boolean", 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_SERIAL_AVAILABLE_CHECK_TOOLTIP || "Check if serial data is available."
    },
    {
        "type": "util_serial_read",
        "message0": Blockly.Msg.BKY_UTIL_SERIAL_READ || "Serial Read %1",
        "args0": [
            { 
                "type": "field_dropdown", 
                "name": "TYPE", 
                "options": [
                    [Blockly.Msg.BKY_SERIAL_READ_BYTE || "Byte", "BYTE"], 
                    [Blockly.Msg.BKY_SERIAL_READ_STRING || "String", "STRING"], 
                    [Blockly.Msg.BKY_SERIAL_READ_STRING_UNTIL || "String Until", "STRING_UNTIL"]
                ]
            }
        ],
        "output": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_SERIAL_READ_TOOLTIP || "Read data from serial port."
    },
    {
        "type": "util_serial_print",
        "message0": Blockly.Msg.BKY_UTIL_SERIAL_PRINT || "Serial %1 %2",
        "args0": [
            { "type": "field_dropdown", "name": "METHOD", "options": [
                [Blockly.Msg.BKY_SERIAL_PRINTLN || "Print Line", "PRINTLN"], 
                [Blockly.Msg.BKY_SERIAL_PRINT || "Print", "PRINT"]
            ]},
            { "type": "input_value", "name": "CONTENT" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_SERIAL_PRINT_TOOLTIP || "Print data to serial port."
    },
    {
        "type": "util_bt_setup",
        "message0": Blockly.Msg.BKY_UTIL_BT_SETUP || "Setup Bluetooth TX Pin %1 RX Pin %2 Baud %3",
        "args0": [
            { "type": "input_value", "name": "TX", "check": "Number" },
            { "type": "input_value", "name": "RX", "check": "Number" },
            { "type": "field_dropdown", "name": "BAUD", "options": [["9600", "9600"], ["115200", "115200"]] }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_BT_SETUP_TOOLTIP || "Setup Bluetooth module."
    },
    {
        "type": "util_bt_available",
        "message0": Blockly.Msg.BKY_UTIL_BT_AVAILABLE || "Bluetooth Data Available",
        "output": "Boolean", 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_BT_AVAILABLE_TOOLTIP || "Check if Bluetooth data is available."
    },
    {
        "type": "util_bt_read",
        "message0": Blockly.Msg.BKY_UTIL_BT_READ || "Bluetooth Read %1",
        "args0": [
            { 
                "type": "field_dropdown", 
                "name": "TYPE", 
                "options": [
                    [Blockly.Msg.BKY_SERIAL_READ_BYTE || "Byte", "BYTE"], 
                    [Blockly.Msg.BKY_SERIAL_READ_STRING || "String", "STRING"], 
                    [Blockly.Msg.BKY_SERIAL_READ_STRING_UNTIL || "String Until", "STRING_UNTIL"]
                ]
            }
        ],
        "output": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_BT_READ_TOOLTIP || "Read data from Bluetooth."
    },
    {
        "type": "util_bt_read_buffer",
        "message0": Blockly.Msg.BKY_UTIL_BT_READ_BUFFER || "Bluetooth Read Buffer Length %1",
        "args0": [ { "type": "input_value", "name": "LENGTH", "check": "Number" } ],
        "output": "String", 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_BT_READ_BUFFER_TOOLTIP || "Read buffer from Bluetooth."
    },
    {
        "type": "util_bt_print",
        "message0": Blockly.Msg.BKY_UTIL_BT_PRINT || "Bluetooth %1 %2",
        "args0": [
            { "type": "field_dropdown", "name": "METHOD", "options": [
                [Blockly.Msg.BKY_SERIAL_PRINTLN || "Print Line", "PRINTLN"], 
                [Blockly.Msg.BKY_SERIAL_PRINT || "Print", "PRINT"]
            ]},
            { "type": "input_value", "name": "CONTENT" }
        ],
        "inputsInline": true, 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#367E7F",
        "tooltip": Blockly.Msg.BKY_UTIL_BT_PRINT_TOOLTIP || "Send data via Bluetooth."
    },

// 17. ===============================================================유틸 카테고리
    {
        "type": "util_millis",
        "message0": Blockly.Msg.BKY_UTIL_MILLIS || "Milliseconds Since Start",
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_MILLIS_TOOLTIP || "Get milliseconds since program started."
    },
    {
        "type": "util_map",
        "message0": Blockly.Msg.BKY_UTIL_MAP || "Map Value %1 From %2-%3 To %4-%5",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" },
            { "type": "input_value", "name": "FROMLOW", "check": "Number" },
            { "type": "input_value", "name": "FROMHIGH", "check": "Number" },
            { "type": "input_value", "name": "TOLOW", "check": "Number" },
            { "type": "input_value", "name": "TOHIGH", "check": "Number" }
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_MAP_TOOLTIP || "Map value from one range to another."
    },
    {
        "type": "util_constrain",
        "message0": Blockly.Msg.BKY_UTIL_CONSTRAIN || "Constrain %1 Between %2 and %3",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" },
            { "type": "input_value", "name": "LOW", "check": "Number" },
            { "type": "input_value", "name": "HIGH", "check": "Number" }
        ],
        "inputsInline": true, 
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_CONSTRAIN_TOOLTIP || "Constrain value within range."
    },
    {
        "type": "util_convert",
        "message0": Blockly.Msg.BKY_UTIL_CONVERT || "Convert %1 to %2",
        "args0": [
            { "type": "input_value", "name": "VALUE" },
            { "type": "field_dropdown", "name": "TYPE", "options": [
                [Blockly.Msg.BKY_INT || "Integer", "INT"], 
                [Blockly.Msg.BKY_FLOAT || "Float", "FLOAT"], 
                [Blockly.Msg.BKY_STRING || "String", "STRING"]
            ]}
        ],
        "output": null, 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_CONVERT_TOOLTIP || "Convert value to different type."
    },
    {
        "type": "util_to_char",
        "message0": Blockly.Msg.BKY_UTIL_TO_CHAR || "Number %1 to Character",
        "args0": [ { "type": "input_value", "name": "VALUE", "check": "Number" } ],
        "output": "String", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_TO_CHAR_TOOLTIP || "Convert number to character."
    },
    {
        "type": "util_to_ascii",
        "message0": Blockly.Msg.BKY_UTIL_TO_ASCII || "Character %1 to ASCII",
        "args0": [ { "type": "input_value", "name": "VALUE", "check": "String" } ],
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_TO_ASCII_TOOLTIP || "Convert character to ASCII value."
    },
    {
        "type": "util_i2c_scanner",
        "message0": Blockly.Msg.BKY_UTIL_I2C_SCANNER || "I2C Scanner",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_I2C_SCANNER_TOOLTIP || "Scan for I2C devices."
    },
    {
        "type": "util_i2c_read_address",
        "message0": Blockly.Msg.BKY_UTIL_I2C_READ_ADDRESS || "I2C Read Found Addresses",
        "output": "String", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_UTIL_I2C_READ_ADDRESS_TOOLTIP || "Get found I2C addresses."
    },
    {
        "type": "serial_parse_data",
        "message0": Blockly.Msg.BKY_SERIAL_PARSE_DATA || "Parse Serial Data Delimiter %1",
        "args0": [{ "type": "input_value", "name": "DELIMITER" }],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_PARSE_DATA_TOOLTIP || "Parse serial data with delimiter."
    },
    {
        "type": "serial_get_parsed_value",
        "message0": Blockly.Msg.BKY_SERIAL_GET_PARSED_VALUE || "Get Parsed Value Index %1",
        "args0": [{ "type": "input_value", "name": "INDEX", "check": "Number" }],
        "output": "String", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_GET_PARSED_VALUE_TOOLTIP || "Get parsed value by index."
    },
    {
        "type": "serial_get_parsed_count",
        "message0": Blockly.Msg.BKY_SERIAL_GET_PARSED_COUNT || "Get Parsed Value Count",
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_GET_PARSED_COUNT_TOOLTIP || "Get number of parsed values."
    },
    {
        "type": "serial_convert_to_number",
        "message0": Blockly.Msg.BKY_SERIAL_CONVERT_TO_NUMBER || "Convert Serial Data %1 to Number",
        "args0": [{ "type": "input_value", "name": "DATA", "check": "String" }],
        "output": "Number", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_CONVERT_TO_NUMBER_TOOLTIP || "Convert serial data to number."
    },
    {
        "type": "serial_get_raw_data",
        "message0": Blockly.Msg.BKY_SERIAL_GET_RAW_DATA || "Get Raw Serial Data",
        "output": "String", 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_GET_RAW_DATA_TOOLTIP || "Get raw serial data."
    },
    {
        "type": "serial_clear_buffer",
        "message0": Blockly.Msg.BKY_SERIAL_CLEAR_BUFFER || "Clear Serial Buffer",
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#08B89F",
        "tooltip": Blockly.Msg.BKY_SERIAL_CLEAR_BUFFER_TOOLTIP || "Clear serial buffer."
    }
];

// Part 12 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart12);


// Part 13: 안내 카테고리와 플래그 블록들 (최종)
const blockDefinitionsPart13 = [

// 18. ===============================================================안내 카테고리
    {
        "type": "developer_info_block",
        "message0": Blockly.Msg.BKY_DEVELOPER_INFO_BLOCK || "Developer Info",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_DEVELOPER_INFO_BLOCK_TOOLTIP || "Information about the developer.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "custom_ad_block",
        "message0": Blockly.Msg.BKY_CUSTOM_AD_BLOCK || "Custom Advertisement",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_CUSTOM_AD_BLOCK_TOOLTIP || "Custom advertisement block.",
        "helpUrl": "https://www.gorillacell.kr/webide/guide/brixel_guide.html"
    },
    {
        "type": "go_to_ai_robot_scratch",
        "message0": Blockly.Msg.BKY_GO_TO_AI_ROBOT_SCRATCH || "Go to AI Robot Scratch",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_GO_TO_AI_ROBOT_SCRATCH_TOOLTIP || "Link to AI Robot Scratch project.",
        "helpUrl": "https://ai4coding.github.io/"
    },
    {
        "type": "go_to_k12_projectHub",
        "message0": Blockly.Msg.BKY_GO_TO_K12_PROJECTHUB || "Go to K12 Project Hub",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_GO_TO_K12_PROJECTHUB_TOOLTIP || "Link to K12 Project Hub.",
        "helpUrl": "https://k12-projecthub.github.io/"
    },

// 19. ===============================================================플래그 블록들
    {
        "type": "main_flag",
        "message0": Blockly.Msg.BKY_MAIN_FLAG || "Main Category Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_MAIN_FLAG_TOOLTIP || "Main category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "pin_flag",
        "message0": Blockly.Msg.BKY_PIN_FLAG || "Pin Control Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_PIN_FLAG_TOOLTIP || "Pin control category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "control_flag",
        "message0": Blockly.Msg.BKY_CONTROL_FLAG || "Control Flow Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_CONTROL_FLAG_TOOLTIP || "Control flow category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "logic_flag",
        "message0": Blockly.Msg.BKY_LOGIC_FLAG || "Logic Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_LOGIC_FLAG_TOOLTIP || "Logic category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "math_flag",
        "message0": Blockly.Msg.BKY_MATH_FLAG || "Math Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_MATH_FLAG_TOOLTIP || "Math category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "text_flag",
        "message0": Blockly.Msg.BKY_TEXT_FLAG || "Text Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_TEXT_FLAG_TOOLTIP || "Text category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "colour_flag",
        "message0": Blockly.Msg.BKY_COLOUR_FLAG || "Color Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_COLOUR_FLAG_TOOLTIP || "Color category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "var_flag",
        "message0": Blockly.Msg.BKY_VAR_FLAG || "Variable Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_VAR_FLAG_TOOLTIP || "Variable category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "func_flag",
        "message0": Blockly.Msg.BKY_FUNC_FLAG || "Function Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_FUNC_FLAG_TOOLTIP || "Function category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "dis01_flag",
        "message0": Blockly.Msg.BKY_DIS01_FLAG || "Basic Display Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_DIS01_FLAG_TOOLTIP || "Basic display category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "dis02_flag",
        "message0": Blockly.Msg.BKY_DIS02_FLAG || "Advanced Display Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_DIS02_FLAG_TOOLTIP || "Advanced display category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "sensor01_flag",
        "message0": Blockly.Msg.BKY_SENSOR01_FLAG || "Basic Sensor Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_SENSOR01_FLAG_TOOLTIP || "Basic sensor category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "sensor02_flag",
        "message0": Blockly.Msg.BKY_SENSOR02_FLAG || "Advanced Sensor Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_SENSOR02_FLAG_TOOLTIP || "Advanced sensor category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "motor_flag",
        "message0": Blockly.Msg.BKY_MOTOR_FLAG || "Motor Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_MOTOR_FLAG_TOOLTIP || "Motor category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "output_flag",
        "message0": Blockly.Msg.BKY_OUTPUT_FLAG || "Output Device Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_OUTPUT_FLAG_TOOLTIP || "Output device category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "comm_flag",
        "message0": Blockly.Msg.BKY_COMM_FLAG || "Communication Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_COMM_FLAG_TOOLTIP || "Communication category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    },
    {
        "type": "util_flag",
        "message0": Blockly.Msg.BKY_UTIL_FLAG || "Utility Flag",
        "nextStatement": null,
        "style": "event_blocks",
        "tooltip": Blockly.Msg.BKY_UTIL_FLAG_TOOLTIP || "Utility category identifier.",
        "helpUrl": "https://github.com/ai4coding"
    }
];

// Part 13 블록들을 등록
Blockly.common.defineBlocksWithJsonArray(blockDefinitionsPart13);

// 동적 블록 호환성 지원
Arduino.forBlock['variables_get_dynamic'] = Arduino.forBlock['variables_get'];
Arduino.forBlock['variables_set_dynamic'] = Arduino.forBlock['variables_set'];
Arduino.forBlock['procedures_defnoreturn_dynamic'] = Arduino.forBlock['procedures_defnoreturn'];
Arduino.forBlock['procedures_defreturn_dynamic'] = Arduino.forBlock['procedures_defreturn'];
Arduino.forBlock['procedures_callnoreturn_dynamic'] = Arduino.forBlock['procedures_callnoreturn'];
Arduino.forBlock['procedures_callreturn_dynamic'] = Arduino.forBlock['procedures_callreturn'];

 // defineArduinoBlocks 함수 끝
}
// 다른 파일에서 이 함수를 호출할 수 있도록 window 객체에 할당합니다.
window.defineArduinoBlocks = defineArduinoBlocks;

// 블록 정의가 번역 시스템과 연동되도록 초기화 함수
function initializeBlockTranslations() {
            if (window.i18n && window.i18n.messages) {
                console.log('블록 번역 시스템 초기화 완료');
            }
        }