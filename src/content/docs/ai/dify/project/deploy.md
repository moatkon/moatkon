---
title: 基于Dify发布moatkon.com网站
description: 基于Dify发布moatkon.com网站
template: doc
draft: false
lastUpdated: 2025-03-31 11:18:33
---

### 流程
![](/ai/dify/project/发布moatkon.png)

### DSL
```yaml
app:
  description: ''
  icon: 🤖
  icon_background: '#FFEAD5'
  mode: workflow
  name: 发布moatkon.com
  use_icon_as_answer_icon: false
dependencies: []
kind: app
version: 0.3.0
workflow:
  conversation_variables: []
  environment_variables:
  - description: ''
    id: e82b5d5e-c079-401a-b3b9-347fde1f6596
    name: deployFailed
    selector:
    - env
    - deployFailed
    value: 发布失败
    value_type: string
  - description: ''
    id: 10b896df-294a-4347-b0f3-ce16d9e08535
    name: deploySuccess
    selector:
    - env
    - deploySuccess
    value: 发布成功
    value_type: string
  - description: ''
    id: 41c2f040-fee5-46e8-96f6-659750077343
    name: deployHook
    selector:
    - env
    - deployHook
    value: ''
    value_type: secret
  - description: ''
    id: eedfe363-0d08-45d9-881e-e72b4a20180d
    name: deployPassword
    selector:
    - env
    - deployPassword
    value: ''
    value_type: secret
  - description: ''
    id: 5eec6b4d-8473-4c2d-8d11-06718b49f50b
    name: passwordError
    selector:
    - env
    - passwordError
    value: 密码错误
    value_type: string
  features:
    file_upload:
      allowed_file_extensions:
      - .JPG
      - .JPEG
      - .PNG
      - .GIF
      - .WEBP
      - .SVG
      allowed_file_types:
      - image
      allowed_file_upload_methods:
      - remote_url
      - local_file
      enabled: false
      fileUploadConfig:
        audio_file_size_limit: 50
        batch_count_limit: 5
        file_size_limit: 15
        image_file_size_limit: 10
        video_file_size_limit: 100
        workflow_file_upload_limit: 10
      image:
        enabled: false
        number_limits: 3
        transfer_methods:
        - local_file
        - remote_url
      number_limits: 3
    opening_statement: ''
    retriever_resource:
      enabled: true
    sensitive_word_avoidance:
      enabled: false
    speech_to_text:
      enabled: false
    suggested_questions: []
    suggested_questions_after_answer:
      enabled: false
    text_to_speech:
      enabled: false
      language: ''
      voice: ''
  graph:
    edges:
    - data:
        isInLoop: false
        sourceType: if-else
        targetType: end
      id: 1751003295256-true-1743404657440-target
      source: '1751003295256'
      sourceHandle: 'true'
      target: '1743404657440'
      targetHandle: target
      type: custom
      zIndex: 0
    - data:
        isInLoop: false
        sourceType: http-request
        targetType: if-else
      id: 1743404625439-source-1751003295256-target
      selected: false
      source: '1743404625439'
      sourceHandle: source
      target: '1751003295256'
      targetHandle: target
      type: custom
      zIndex: 0
    - data:
        isInLoop: false
        sourceType: if-else
        targetType: end
      id: 1751003295256-false-1751003356839-target
      source: '1751003295256'
      sourceHandle: 'false'
      target: '1751003356839'
      targetHandle: target
      type: custom
      zIndex: 0
    - data:
        isInIteration: false
        isInLoop: false
        sourceType: start
        targetType: if-else
      id: 1743404619705-source-1751039682217-target
      source: '1743404619705'
      sourceHandle: source
      target: '1751039682217'
      targetHandle: target
      type: custom
      zIndex: 0
    - data:
        isInLoop: false
        sourceType: if-else
        targetType: http-request
      id: 1751039682217-true-1743404625439-target
      source: '1751039682217'
      sourceHandle: 'true'
      target: '1743404625439'
      targetHandle: target
      type: custom
      zIndex: 0
    - data:
        isInLoop: false
        sourceType: if-else
        targetType: end
      id: 1751039682217-false-1751039723426-target
      source: '1751039682217'
      sourceHandle: 'false'
      target: '1751039723426'
      targetHandle: target
      type: custom
      zIndex: 0
    nodes:
    - data:
        desc: ''
        selected: false
        title: 开始
        type: start
        variables:
        - label: 请输入密码
          max_length: 48
          options: []
          required: true
          type: text-input
          variable: password
      height: 90
      id: '1743404619705'
      position:
        x: -184.64120440256903
        y: -32.51503980368382
      positionAbsolute:
        x: -184.64120440256903
        y: -32.51503980368382
      selected: true
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        authorization:
          config: null
          type: no-auth
        body:
          data: []
          type: none
        desc: 发布moatkon.com
        headers: ''
        method: post
        params: ''
        retry_config:
          max_retries: 1
          retry_enabled: false
          retry_interval: 100
        selected: false
        ssl_verify: true
        timeout:
          max_connect_timeout: 0
          max_read_timeout: 0
          max_write_timeout: 0
        title: HTTP 请求
        type: http-request
        url: '{{#env.deployHook#}}'
        variables: []
      height: 125
      id: '1743404625439'
      position:
        x: 541.0700152208757
        y: -67.1390524066422
      positionAbsolute:
        x: 541.0700152208757
        y: -67.1390524066422
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        desc: ''
        outputs:
        - value_selector:
          - env
          - deploySuccess
          variable: output
        selected: false
        title: 发布成功
        type: end
      height: 90
      id: '1743404657440'
      position:
        x: 1218.6373896508317
        y: -104.15854969239423
      positionAbsolute:
        x: 1218.6373896508317
        y: -104.15854969239423
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        cases:
        - case_id: 'true'
          conditions:
          - comparison_operator: contains
            id: 929c6eaf-8125-4e46-8795-f263ac45a506
            value: 'true'
            varType: string
            variable_selector:
            - '1743404625439'
            - body
          id: 'true'
          logical_operator: and
        desc: ''
        selected: false
        title: 判断是否发布成功
        type: if-else
      height: 126
      id: '1751003295256'
      position:
        x: 862.2488166669909
        y: -67.1390524066422
      positionAbsolute:
        x: 862.2488166669909
        y: -67.1390524066422
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        desc: ''
        outputs:
        - value_selector:
          - env
          - deployFailed
          variable: text
        selected: false
        title: 发布失败
        type: end
      height: 90
      id: '1751003356839'
      position:
        x: 1218.6373896508317
        y: 71.28712560788233
      positionAbsolute:
        x: 1218.6373896508317
        y: 71.28712560788233
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        cases:
        - case_id: 'true'
          conditions:
          - comparison_operator: is
            id: 7c6a7daf-10e6-49fe-9bb8-28cebcac4ceb
            value: '{{#env.deployPassword#}}'
            varType: string
            variable_selector:
            - '1743404619705'
            - password
          id: 'true'
          logical_operator: and
        desc: ''
        selected: false
        title: 校验密码
        type: if-else
      height: 126
      id: '1751039682217'
      position:
        x: 171.80321838008172
        y: -32.51503980368382
      positionAbsolute:
        x: 171.80321838008172
        y: -32.51503980368382
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    - data:
        desc: ''
        outputs:
        - value_selector:
          - env
          - passwordError
          variable: tips
        selected: false
        title: 密码错误
        type: end
      height: 90
      id: '1751039723426'
      position:
        x: 541.0700152208757
        y: 81.34222255556108
      positionAbsolute:
        x: 541.0700152208757
        y: 81.34222255556108
      selected: false
      sourcePosition: right
      targetPosition: left
      type: custom
      width: 244
    viewport:
      x: 291.50607473143396
      y: 323.17395842644356
      zoom: 0.974904873874189

```