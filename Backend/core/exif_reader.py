import io
from PIL import Image
import piexif

def _convert_to_degrees(value):
    """
    Helper function to convert the GPS coordinates stored in the EXIF 
    to float degrees in decimal format.
    """
    d = float(value[0][0]) / float(value[0][1])
    m = float(value[1][0]) / float(value[1][1])
    s = float(value[2][0]) / float(value[2][1])
    return d + (m / 60.0) + (s / 3600.0)

def extract_metadata(image_bytes: bytes) -> dict:
    """
    Takes raw image bytes, extracts EXIF data, and formats the GPS and timestamps.
    Returns a clean dictionary of the metadata.
    """
    metadata = {
        "latitude": None,
        "longitude": None,
        "timestamp": None,
        "description": None,
        "raw_exif_exists": False
    }

    try:
        # Open the image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Check if the image actually has EXIF data
        if "exif" not in image.info:
            return metadata
            
        exif_dict = piexif.load(image.info["exif"])
        metadata["raw_exif_exists"] = True

        # Extract Timestamp (usually in the "0th" or "Exif" IFD)
        if piexif.ImageIFD.DateTime in exif_dict.get("0th", {}):
            metadata["timestamp"] = exif_dict["0th"][piexif.ImageIFD.DateTime].decode('utf-8')

        # Extract Description (ImageDescription)
        if piexif.ImageIFD.ImageDescription in exif_dict.get("0th", {}):
            metadata["description"] = exif_dict["0th"][piexif.ImageIFD.ImageDescription].decode('utf-8')

        # Extract GPS Data
        gps_ifd = exif_dict.get("GPS", {})
        if gps_ifd:
            lat_data = gps_ifd.get(piexif.GPSIFD.GPSLatitude)
            lat_ref = gps_ifd.get(piexif.GPSIFD.GPSLatitudeRef)
            lon_data = gps_ifd.get(piexif.GPSIFD.GPSLongitude)
            lon_ref = gps_ifd.get(piexif.GPSIFD.GPSLongitudeRef)

            if lat_data and lat_ref and lon_data and lon_ref:
                lat = _convert_to_degrees(lat_data)
                if lat_ref.decode('utf-8') != "N":
                    lat = -lat
                    
                lon = _convert_to_degrees(lon_data)
                if lon_ref.decode('utf-8') != "E":
                    lon = -lon
                    
                metadata["latitude"] = round(lat, 6)
                metadata["longitude"] = round(lon, 6)

        return metadata

    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return metadata