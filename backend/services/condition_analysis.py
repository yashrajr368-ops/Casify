import os
from PIL import Image

def analyze_device_image(image_path):
    """
    AI-assisted image preprocessing and prototype condition analysis.
    Uses OpenCV and Pillow to assess image quality, sharpness, edge density,
    and detect visible surface irregularity indicators.
    """
    if not os.path.exists(image_path):
        return {
            'success': False,
            'message': 'Image file not found'
        }

    results = {
        'success': True,
        'image_path': image_path,
        'width': 0,
        'height': 0,
        'blur_score': 0.0,
        'is_blurry': False,
        'edge_density': 0.0,
        'abrasion_indicator': 'Low',
        'quality_score': 8.0,
        'status': 'AI-assisted image preprocessing / prototype condition analysis',
        'notes': []
    }

    try:
        # Pillow validation & dimension check
        with Image.open(image_path) as pil_img:
            results['width'], results['height'] = pil_img.size
            if results['width'] < 200 or results['height'] < 200:
                results['notes'].append('Image resolution is very low for accurate inspection.')
                results['quality_score'] -= 2.0
    except Exception as e:
        results['notes'].append(f'Pillow inspection warning: {str(e)}')

    # OpenCV advanced edge & blur analysis
    try:
        import cv2
        import numpy as np

        img = cv2.imread(image_path)
        if img is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

            # 1. Laplacian variance for blur detection
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            results['blur_score'] = round(laplacian_var, 2)
            if laplacian_var < 80.0:
                results['is_blurry'] = True
                results['notes'].append('Image is slightly blurry; recommend re-uploading in better lighting.')
                results['quality_score'] -= 1.5

            # 2. Canny edge density to detect surface fractures or deep scratches
            edges = cv2.Canny(gray, 100, 200)
            edge_density = float(np.count_nonzero(edges)) / float(gray.size)
            results['edge_density'] = round(edge_density, 4)

            if edge_density > 0.12:
                results['abrasion_indicator'] = 'High - Potential visible cracks or deep surface lines detected'
                results['quality_score'] -= 2.0
            elif edge_density > 0.06:
                results['abrasion_indicator'] = 'Moderate - Minor cosmetic wear or edge reflections observed'
            else:
                results['abrasion_indicator'] = 'Clean - Minimal surface disruptions observed'

            # 3. Normalized quality score bounded between 1.0 and 10.0
            results['quality_score'] = max(1.0, min(10.0, round(results['quality_score'], 1)))

    except ImportError:
        results['notes'].append('OpenCV module not yet available in environment; using basic Pillow heuristics.')
    except Exception as e:
        results['notes'].append(f'OpenCV analysis notice: {str(e)}')

    return results
