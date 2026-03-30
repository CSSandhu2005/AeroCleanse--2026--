import sys
import json
from ultralytics import YOLO
import cv2

# Load model
model = YOLO("yolov8n.pt")

GARBAGE_CLASSES = [
    "bottle", "cup", "wine glass",
    "banana", "apple", "sandwich",
    "book", "cell phone"
]

# get image path from Node API
image_path = sys.argv[1]

frame = cv2.imread(image_path)

results = model(frame)

detections = []

for r in results:
    for box in r.boxes:
        cls = int(box.cls[0])
        label = model.names[cls]

        if label in GARBAGE_CLASSES:
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append({
                "label": label,
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            })

# ⚠️ ONLY output JSON
print(json.dumps(detections))