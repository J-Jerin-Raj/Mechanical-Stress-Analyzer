import math
from datetime import datetime

# Material database (same as JS)
MAT = {
    "steel": {"E": 200e3, "sy": 250, "rho": 7850, "name": "Structural Steel"},
    "alum": {"E": 69e3, "sy": 276, "rho": 2700, "name": "Aluminium 6061-T6"},
    "ss": {"E": 193e3, "sy": 215, "rho": 8000, "name": "Stainless Steel 304"},
    "ci": {"E": 100e3, "sy": 180, "rho": 7200, "name": "Cast Iron"},
}