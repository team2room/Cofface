#!/bin/bash
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
