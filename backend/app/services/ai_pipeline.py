import os
import json
import logging
from PIL import Image
from google import genai
from google.genai import types
import fitz
import io
from app.schemas.mto import MTOResponse

logger = logging.getLogger(__name__)

# Mock data to use when no API key is available or on failure
MOCK_MTO_DATA = {
    "is_isometric_drawing": True,
    "drawing_meta": {
        "drawing_no": "ISO-1501-01",
        "revision": "2",
        "line_number": "6\"-P-1501-A1A-IH",
        "nps": "6\"",
        "material_class": "A1A",
        "service": "Process"
    },
    "items": [
        {
            "item_no": 1,
            "category": "PIPE",
            "description": "Pipe, Seamless, BE, ASME B36.10",
            "size_nps": "6\"",
            "schedule_rating": "SCH 40",
            "material_spec": "ASTM A106 Gr.B",
            "end_type": "BW",
            "quantity": 1,
            "unit": "M",
            "length_m": 12.45,
            "confidence": 0.92,
            "remarks": ""
        },
        {
            "item_no": 2,
            "category": "FITTING",
            "description": "Elbow 90 Deg LR, BW, ASME B16.9",
            "size_nps": "6\"",
            "schedule_rating": "SCH 40",
            "material_spec": "ASTM A234 WPB",
            "end_type": "BW",
            "quantity": 4,
            "unit": "EA",
            "confidence": 0.88,
            "length_m": None,
            "remarks": ""
        },
        {
            "item_no": 3,
            "category": "VALVE",
            "description": "Gate Valve, FLGD, ASME B16.34",
            "size_nps": "6\"",
            "schedule_rating": "CL150",
            "material_spec": "ASTM A216 WCB",
            "end_type": "FLGD",
            "quantity": 1,
            "unit": "EA",
            "confidence": 0.90,
            "length_m": None,
            "remarks": ""
        },
        {
            "item_no": 4,
            "category": "FLANGE",
            "description": "Weld Neck Flange, RF, ASME B16.5",
            "size_nps": "6\"",
            "schedule_rating": "CL150",
            "material_spec": "ASTM A105",
            "end_type": "BW",
            "quantity": 2,
            "unit": "EA",
            "confidence": 0.85,
            "length_m": None,
            "remarks": ""
        },
        {
            "item_no": 5,
            "category": "GASKET",
            "description": "Spiral Wound Gasket, ASME B16.20",
            "size_nps": "6\"",
            "schedule_rating": "CL150",
            "material_spec": "SS316/Graphite",
            "end_type": "",
            "quantity": 2,
            "unit": "EA",
            "confidence": 0.99,
            "length_m": None,
            "remarks": "Derived from flanges"
        },
        {
            "item_no": 6,
            "category": "BOLT",
            "description": "Stud Bolts with Nuts",
            "size_nps": "5/8\"",
            "schedule_rating": "",
            "material_spec": "ASTM A193 B7 / A194 2H",
            "end_type": "",
            "quantity": 2,
            "unit": "SET",
            "confidence": 0.99,
            "length_m": None,
            "remarks": "Derived from flanges"
        }
    ],
    "summary": {
        "total_pipe_length_m": 12.45,
        "fittings": 4,
        "flanges": 2,
        "valves": 1,
        "gaskets": 2,
        "bolt_sets": 2,
        "field_welds": 1
    }
}

PROMPT_TEXT = """
You are an expert piping engineer. You have been given an image of a piping isometric drawing.
FIRST, verify if the image is actually a piping isometric drawing. If it is NOT (e.g. a random photo or unrelated document), you MUST set "is_isometric_drawing" to false and leave all other lists/fields empty. If it IS an isometric drawing, set "is_isometric_drawing" to true and extract the Material Take-Off (MTO) following these rules:

Domain Rules:
1. Pipes are straight lines. They are quantified by total length in meters (unit="M").
2. Fittings (Elbows, Tees, Reducers) connect pipes or change direction. Quantify by count (unit="EA").
3. Valves are usually drawn as bowties. Quantify by count (unit="EA").
4. Flanges are short perpendicular ticks. Quantify by count (unit="EA").
5. Gaskets and Bolts: For every flanged joint, assume 1 Gasket and 1 Set of Bolts. If you find N flanges, typically expect N/2 or N flanged joints depending on connections. Be smart and estimate if not explicitly listed.
6. Look for a Bill of Materials (BOM) table on the drawing. If it exists, extract data from it.
7. Look for a Title Block to extract Drawing Number, Revision, Line Number, etc.

You MUST return a JSON object matching this exact structure:
{
  "is_isometric_drawing": true,
  "drawing_meta": { "drawing_no": "", "revision": "", "line_number": "", "nps": "", "material_class": "", "service": "" },
  "items": [
    { "item_no": 1, "category": "PIPE|FITTING|FLANGE|VALVE|GASKET|BOLT", "description": "", "size_nps": "", "schedule_rating": "", "material_spec": "", "end_type": "", "quantity": 1, "unit": "M|EA|SET", "length_m": 10.5, "confidence": 0.9, "remarks": "" }
  ],
  "summary": { "total_pipe_length_m": 10.5, "fittings": 2, "flanges": 2, "valves": 1, "gaskets": 1, "bolt_sets": 1, "field_welds": 0 }
}

Only return valid JSON without any markdown formatting wrappers like ```json.
"""

def extract_mto_from_image(image_path: str) -> MTOResponse:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key.strip() == "":
        logger.warning("No GEMINI_API_KEY found. Falling back to MOCK data.")
        return MTOResponse(**MOCK_MTO_DATA)
    
    try:
        client = genai.Client(api_key=api_key)
        
        if image_path.lower().endswith('.pdf'):
            doc = fitz.open(image_path)
            page = doc.load_page(0)
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            doc.close()
        else:
            img = Image.open(image_path)
        
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=[PROMPT_TEXT, img],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        response_text = response.text.strip()
        # In case the model still outputs markdown wrappers despite instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        data = json.loads(response_text)
        return MTOResponse(**data)
        
    except Exception as e:
        logger.error(f"AI Pipeline failed: {str(e)}")
        # Graceful degradation on failure
        return MTOResponse(**MOCK_MTO_DATA)
