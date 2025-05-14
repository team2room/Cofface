# analyze_original_model.py
import onnx
import numpy as np

def analyze_model(model_path):
    """ONNX 모델 구조 분석"""
    model = onnx.load(model_path)
    
    print(f"모델 분석: {model_path}")
    print(f"IR 버전: {model.ir_version}")
    print(f"Producer: {model.producer_name} {model.producer_version}")
    
    # 입력 분석
    print("\n입력 정보:")
    for i, input in enumerate(model.graph.input):
        print(f"입력 {i+1}: {input.name}")
        print("  형태:", [dim.dim_value if dim.dim_value else dim.dim_param for dim in input.type.tensor_type.shape.dim])
    
    # 출력 분석
    print("\n출력 정보:")
    for i, output in enumerate(model.graph.output):
        print(f"출력 {i+1}: {output.name}")
        print("  이름:", output.name)
        print("  형태:", [dim.dim_value if dim.dim_value else dim.dim_param for dim in output.type.tensor_type.shape.dim])
        print("  데이터 타입:", output.type.tensor_type.elem_type)
    
    # 내부 노드 분석 - 마지막 레이어 위주로
    output_nodes = {}
    for node in model.graph.node:
        for output in node.output:
            for model_output in model.graph.output:
                if output == model_output.name:
                    output_nodes[output] = node
    
    print("\n출력 생성 노드:")
    for output_name, node in output_nodes.items():
        print(f"출력 '{output_name}'를 생성하는 노드:")
        print(f"  노드 이름: {node.name}")
        print(f"  연산 타입: {node.op_type}")
        print(f"  입력: {node.input}")
        
    return model

# 실행
model_path = "./models/buffalo_l/genderage.onnx"
analyze_model(model_path)