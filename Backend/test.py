import os
import json
from core.exif_reader import extract_metadata

# Define the path to your test image
TEST_IMAGE_PATH = "sample.jpg" 

def run_test():
    print(f"--- Testing EXIF Extraction on '{TEST_IMAGE_PATH}' ---")
    
    # Check if the file actually exists before trying to open it
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"⚠️ Error: Could not find '{TEST_IMAGE_PATH}'.")
        print("Please drop a test image (preferably one taken with a smartphone so it has GPS data) into your 'backend' folder and name it 'sample.jpg'.")
        return

    # Read the image as raw bytes (simulating how FastAPI will receive it)
    with open(TEST_IMAGE_PATH, "rb") as file:
        image_bytes = file.read()

    print("Processing bytes...")
    
    # Pass the bytes to our pure function
    metadata = extract_metadata(image_bytes)
    
    # Print the output beautifully so it's easy to read
    print("\n✅ Extraction Complete! Results:")
    print(json.dumps(metadata, indent=4))

if __name__ == "__main__":
    run_test()