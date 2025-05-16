#!/bin/bash
if [ -d "venv" ]; then
  echo "venv 폴더 존재."
  if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
  fi
  source venv/Scripts/activate
  python pyglet_gui_test.py
else
  echo "설치 되지 않았습니다."
  echo "설치를 진행한 후 실행 해주세요."
fi

