import io
from PIL import Image
import piexif

def _convert_to_dms(decimal_degree):
    """
    Helper function to convert decimal degrees back into the 
    (degrees, minutes, seconds) rational tuples required by EXIF.
    """
    degrees = int(abs(decimal_degree))
    minutes = int((abs(decimal_degree) - degrees) * 60)
    seconds = round(((abs(decimal_degree) - degrees) * 60 - minutes) * 60 * 10000)
    
    # EXIF requires these as (numerator, denominator) tuples
    return ((degrees, 1), (minutes, 1), (seconds, 10000))

def modify_metadata(image_bytes: bytes, new_lat: float = None, new_lon: float = None, new_timestamp: str = None, new_description: str = None) -> bytes:
    """
    Takes raw image bytes and new metadata. Injects the new data into the 
    EXIF dictionary and returns the modified image as raw bytes.
    """
    try:
        # Open the original image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Load existing EXIF or create a blank template if the image has none
        if "exif" in image.info:
            exif_dict = piexif.load(image.info["exif"])
        else:
            exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}, "thumbnail": None}

        # 1. Update GPS Data
        if new_lat is not None and new_lon is not None:
            # Determine North/South and East/West references
            lat_ref = "N" if new_lat >= 0 else "S"
            lon_ref = "E" if new_lon >= 0 else "W"
            
            exif_dict["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat_ref.encode('utf-8')
            exif_dict["GPS"][piexif.GPSIFD.GPSLatitude] = _convert_to_dms(new_lat)
            
            exif_dict["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lon_ref.encode('utf-8')
            exif_dict["GPS"][piexif.GPSIFD.GPSLongitude] = _convert_to_dms(new_lon)

        # 2. Update Timestamp (FIXED: Applies to all 3 EXIF time tags)
        if new_timestamp:
            timestamp_bytes = new_timestamp.encode('utf-8')
            
            exif_dict["0th"][piexif.ImageIFD.DateTime] = timestamp_bytes
            exif_dict["Exif"][piexif.ExifIFD.DateTimeOriginal] = timestamp_bytes
            exif_dict["Exif"][piexif.ExifIFD.DateTimeDigitized] = timestamp_bytes

        # 3. Update Description (FIXED: Forces custom location/text into Description)
        if new_description is not None:
            exif_dict["0th"][piexif.ImageIFD.ImageDescription] = new_description.encode('utf-8')

        # Convert the modified dictionary back into raw EXIF bytes
        exif_bytes = piexif.dump(exif_dict)

        # Create a new buffer to hold our final image
        output_buffer = io.BytesIO()
        
        # Preserve original format, default to JPEG
        fmt = image.format if image.format else 'JPEG'
        
        # Save the new image with the injected EXIF bytes
        image.save(output_buffer, format=fmt, exif=exif_bytes)
        
        return output_buffer.getvalue()

    except Exception as e:
        print(f"Error modifying metadata: {e}")
        return None