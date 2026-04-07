import math
from datetime import datetime
from supabase import create_client

SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-key"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def save_to_db(input_data, results):
    payload = {
        "user_email": input_data["user_email"],
        "arm_length_mm": input_data["arm_length_mm"],
        "arm_height_mm": input_data["arm_height_mm"],
        "width_mm": input_data["width_mm"],
        "thickness_mm": input_data["thickness_mm"],
        "material": input_data["material"],
        "load_n": input_data["load_n"],
        "load_type": input_data["load_type"],

        **results  # merge computed values
    }

    response = supabase.table("your_table_name").insert(payload).execute()
    return response

# Material database (same as JS)
MAT = {
    "steel": {"E": 200e3, "sy": 250, "rho": 7850, "name": "Structural Steel"},
    "alum": {"E": 69e3, "sy": 276, "rho": 2700, "name": "Aluminium 6061-T6"},
    "ss": {"E": 193e3, "sy": 215, "rho": 8000, "name": "Stainless Steel 304"},
    "ci": {"E": 100e3, "sy": 180, "rho": 7200, "name": "Cast Iron"},
}

def compute(data):
    # Convert units
    L1 = data["arm_length_mm"] / 1000
    L2 = data["arm_height_mm"] / 1000
    b = data["width_mm"] / 1000
    t = data["thickness_mm"] / 1000
    F = data["load_n"]

    mat = MAT[data["material"]]
    E = mat["E"] * 1e6  # MPa → Pa

    # Section properties
    I = (b * t**3) / 12
    A = b * t
    Z = I / (t / 2)
    r = math.sqrt(I / A)

    # Stress calculations
    M = F * L1
    bending_stress = M / Z / 1e6
    shear_stress = (1.5 * F / A) / 1e6
    von_mises = math.sqrt(bending_stress**2 + 3 * shear_stress**2)

    # Buckling
    buckling_load = (math.pi**2 * E * I) / (4 * L1**2)

    # Slenderness
    slenderness_ratio = L1 / r

    # Deflection
    displacement_mm = (F * L1**3) / (3 * E * I) * 1000

    # Natural frequency
    mass = mat["rho"] * A * L1
    k = (E * I) / (L1**3)
    omega = math.sqrt(k / mass)
    natural_freq = omega / (2 * math.pi)

    # Factor of safety
    factor_of_safety = mat["sy"] / von_mises

    # Verdict
    if factor_of_safety >= 2:
        verdict = "SAFE"
    elif factor_of_safety >= 1:
        verdict = "WARNING"
    else:
        verdict = "FAIL"

    return {
        "moment_of_inertia": I,
        "section_modulus": Z,
        "bending_stress": bending_stress,
        "shear_stress": shear_stress,
        "von_mises": von_mises,
        "factor_of_safety": factor_of_safety,
        "buckling_load": buckling_load,
        "slenderness_ratio": slenderness_ratio,
        "displacement_mm": displacement_mm,
        "natural_freq": natural_freq,
        "verdict": verdict,
    }

g