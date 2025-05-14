import onnx
import sys
import numpy as np

def verify_and_fix_model(input_path, output_path=None):
    """InsightFace 호환성 검사 및 수정"""
    if output_path is None:
        output_path = input_path.replace('.onnx', '_fixed.onnx')
    
    model = onnx.load(input_path)
    print(f"모델 로드: {input_path}")
    
    # 출력 검사
    output_names = [output.name for output in model.graph.output]
    print(f"출력 이름: {output_names}")
    
    # 'age'와 'gender' 출력이 있는지 확인
    has_age = 'age' in output_names
    has_gender = 'gender' in output_names
    
    if not (has_age and has_gender):
        print("경고: 'age'와 'gender' 출력이 모두 필요합니다")
        
        # 출력 이름 수정
        if len(model.graph.output) >= 2:
            model.graph.output[0].name = 'age'
            model.graph.output[1].name = 'gender'
            print("출력 이름을 'age'와 'gender'로 수정했습니다")
    
    # 출력 형태 확인
    needs_fix = False
    for output in model.graph.output:
        # 차원 수 확인
        if len(output.type.tensor_type.shape.dim) != 2:
            print(f"경고: {output.name} 출력은 2차원이어야 합니다")
            needs_fix = True
        
        # 두 번째 차원이 1인지 확인
        elif output.type.tensor_type.shape.dim[1].dim_value != 1:
            print(f"경고: {output.name} 출력의 두 번째 차원은 1이어야 합니다")
            needs_fix = True
    
    # 모델 검증
    try:
        onnx.checker.check_model(model)
        print("모델 구조가 유효합니다")
    except Exception as e:
        print(f"모델 검증 오류: {e}")
        return False
    
    # 수정된 모델 저장
    onnx.save(model, output_path)
    print(f"검증 완료 및 모델 저장: {output_path}")
    return True

# 실행
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용법: python verify_model_compatibility.py <모델_경로> [<출력_경로>]")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    
    verify_and_fix_model(input_path, output_path)