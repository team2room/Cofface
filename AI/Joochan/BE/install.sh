#!/bin/bash
# Python 버전 확인
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
REQUIRED_PYTHON="3.10"

# NVCC 버전 확인
NVCC_VERSION=$(nvcc --version 2>&1 | grep "release" | awk '{print $5}' | cut -d, -f1)
REQUIRED_NVCC="12.1"

# cl.exe 설치 여부 확인 (Windows 환경에서)
CL_EXISTS=false
if command -v cl.exe &> /dev/null; then
    CL_EXISTS=true
elif command -v cl &> /dev/null; then
    CL_EXISTS=true
fi

echo "확인된 Python 버전: $PYTHON_VERSION (필요: $REQUIRED_PYTHON)"
echo "확인된 NVCC 버전: $NVCC_VERSION (필요: $REQUIRED_NVCC)"
echo "cl.exe 설치 여부: $([ "$CL_EXISTS" = true ] && echo "설치됨" || echo "설치되지 않음")"

# 모든 요구사항 충족 여부 확인
if [ "$PYTHON_VERSION" = "$REQUIRED_PYTHON" ] && [ "$NVCC_VERSION" = "$REQUIRED_NVCC" ] && [ "$CL_EXISTS" = true ]; then
    echo "모든 요구사항이 충족되었습니다. 작업을 시작합니다..."

    if [ -d "venv" ]; then
        echo "venv 폴더 존재."
    else
        python -m venv venv
    fi

    if [ -n "$VIRTUAL_ENV" ]; then
        deactivate
    fi
    source venv/Scripts/activate
    echo "환경 구축 시작"
    python -m pip install -U pip
    echo ""
    pip install -r requirements_1.txt
    echo ""
    echo "pytorch 설치"
    echo ""
    pip install -r requirements_2.txt
    echo ""
    echo "insightface, onnxruntime gpu 설치"
    echo ""
    pip install -r requirements_3.txt
    echo ""
    echo "depth sdk 설치"
    echo ""
    pip install -r requirements_4.txt
    echo ""
    echo "headless 제거 후 opencv 재설치"
    echo ""
    pip uninstall -y opencv-python opencv-contrib-python opencv-python-headless
    pip install -U opencv-python opencv-contrib-python
    echo ""
    echo "정상 설치 테스트 실행"
    echo ""
    python cudatest.py
    echo "작업이 완료되었습니다."
else
    echo "일부 요구사항이 충족되지 않았습니다."
    
    if [ "$PYTHON_VERSION" != "$REQUIRED_PYTHON" ]; then
        echo "Python $REQUIRED_PYTHON 버전이 필요합니다."
        echo "다음 명령어로 설치된 Python 버전을 확인하세요: python --version"
    fi
    
    if [ "$NVCC_VERSION" != "$REQUIRED_NVCC" ]; then
        echo "CUDA $REQUIRED_NVCC 버전이 필요합니다."
        echo "다음 명령어로 설치된 NVCC 버전을 확인하세요: nvcc --version"
    fi
    
    if [ "$CL_EXISTS" = false ]; then
        echo "cl.exe가 설치되어 있지 않거나 PATH에 등록되어 있지 않습니다."
        echo "다음 사항을 확인하세요:"
        echo "1. Visual Studio 또는 Visual Studio Build Tools가 설치되어 있는지 확인"
        echo "2. Developer Command Prompt for Visual Studio에서 실행 중인지 확인"
        echo "3. cl.exe가 있는 경로가 PATH 환경변수에 등록되어 있는지 확인"
        echo ""
        echo "cl.exe 설치 방법:"
        echo "PowerShell에서 다음 명령어를 실행하여 Visual Studio Build Tools를 설치할 수 있습니다:"
        echo "Invoke-RestMethod -Uri https://download.visualstudio.microsoft.com/download/pr/acfc792d-506b-4868-9924-aeedc61ae654/72ae7ec0c234bbe0e655dc4776110c23178c8fbb7bbcf9b5b96a683b95e8d755/vs_BuildTools.exe -OutFile vs_buildtools.exe"
        echo "Start-Process -FilePath vs_buildtools.exe -ArgumentList \"--add\", \"Microsoft.VisualStudio.Component.VC.Tools.x86.x64\", \"--add\", \"Microsoft.VisualStudio.Component.Windows10SDK.19041\", \"--norestart\", \"--passive\", \"--wait\" -Wait -PassThru"
        echo "Remove-Item vs_buildtools.exe"
        echo ""
        echo "'C++를 사용한 데스크톱 개발'을 선택하여 설치합니다."
        echo "MSVC v142, Windows SDK, Cmake 도구가 필수적으로 설치되어야 합니다."
    fi
    
    exit 1
fi