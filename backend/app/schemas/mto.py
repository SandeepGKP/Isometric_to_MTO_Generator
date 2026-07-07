from pydantic import BaseModel, Field
from typing import List, Optional

class DrawingMeta(BaseModel):
    drawing_no: Optional[str] = Field(default="", description="Drawing number from the title block")
    revision: Optional[str] = Field(default="", description="Revision number from the title block")
    line_number: Optional[str] = Field(default="", description="Line number or code of the pipe")
    nps: Optional[str] = Field(default="", description="Nominal Pipe Size found on the drawing")
    material_class: Optional[str] = Field(default="", description="Material class or spec found in metadata")
    service: Optional[str] = Field(default="", description="Service or process type")

class MTOItem(BaseModel):
    item_no: int = Field(description="Sequential item or piece mark number")
    category: str = Field(description="Must be one of: PIPE, FITTING, FLANGE, VALVE, GASKET, BOLT, SUPPORT, MISC")
    description: str = Field(description="Full engineering description of the item")
    size_nps: str = Field(description="Nominal Pipe Size (inches), e.g., 6\" or 6\"x4\"")
    schedule_rating: Optional[str] = Field(default="", description="Wall thickness schedule or pressure class, e.g., SCH 40, CL150")
    material_spec: Optional[str] = Field(default="", description="ASTM/ASME material grade, e.g., ASTM A106 Gr.B")
    end_type: Optional[str] = Field(default="", description="Connection type: BW, SW, THD, FLGD")
    quantity: Optional[float] = Field(default=None, description="Count for discrete items (Fittings, Valves, Flanges)")
    unit: str = Field(description="Unit of measurement: M (metres) for pipe, EA for count, SET for bolts")
    length_m: Optional[float] = Field(default=None, description="Total cut length for pipes in metres")
    confidence: Optional[float] = Field(default=None, description="Confidence score from 0.0 to 1.0")
    remarks: Optional[str] = Field(default="", description="Any relevant remarks, e.g., field weld")

class MTOSummary(BaseModel):
    total_pipe_length_m: float = Field(default=0.0, description="Sum of all pipe lengths in metres")
    fittings: int = Field(default=0, description="Total number of fittings")
    flanges: int = Field(default=0, description="Total number of flanges")
    valves: int = Field(default=0, description="Total number of valves")
    gaskets: int = Field(default=0, description="Total number of gaskets (usually 1 per flanged joint)")
    bolt_sets: int = Field(default=0, description="Total number of bolt sets (usually 1 per flanged joint)")
    field_welds: int = Field(default=0, description="Total number of field welds found")

class MTOResponse(BaseModel):
    is_isometric_drawing: bool = Field(default=True, description="True if the image is a piping isometric drawing, False otherwise")
    drawing_meta: DrawingMeta
    items: List[MTOItem]
    summary: MTOSummary
