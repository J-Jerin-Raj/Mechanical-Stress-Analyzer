import math
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv
import os

# SUPABASE CONFIG
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("URL:", SUPABASE_URL)
print("KEY:", SUPABASE_KEY[:10], "...")

#MATERIAL DATABASE 
MAT = {
    "steel": {"E": 200e3, "sy": 250, "rho": 7850},
    "alum": {"E": 69e3, "sy": 276, "rho": 2700},
    "ss": {"E": 193e3, "sy": 215, "rho": 8000},
    "ci": {"E": 100e3, "sy": 180, "rho": 7200},
}

# Login
def auth(email,passwd):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": passwd
        })
        if res.user:
            print(f"\n✅ Logged in as {res.user.email}")
            return True

    except Exception as e:
        print("\n❌ Login failed:", str(e))
        return False
    return None
    
#INPUT FROM USER
def get_input():
    print("\n🔧 BRACKET STRESS ANALYSIS (CLI)\n")

    data = {}
    data["user_email"] = input("Email: ")
    passwd = input("Enter your password: ")
    if(auth(data["user_email"], passwd)):
        pass
    else: return 0
    data["arm_length_mm"] = float(input("Arm Length L1 (mm): "))
    data["arm_height_mm"] = float(input("Arm Height L2 (mm): "))
    data["width_mm"] = float(input("Width b (mm): "))
    data["thickness_mm"] = float(input("Thickness t (mm): "))

    print("\nMaterial options: steel / alum / ss / ci")
    data["material"] = input("Material: ").lower()

    data["load_n"] = float(input("Load (N): "))
    data["load_type"] = int(input('''Load Type:
    0 → Axial Compression
    1 → Transverse Load (most common)
    2 → Combined (Bending + Torsion)
    3 → Dynamic
    Select Load Type - '''))
    return data

# CORE CALCULATION
def compute(d):
    L = d["arm_length_mm"] / 1000
    b = d["width_mm"] / 1000
    t = d["thickness_mm"] / 1000
    F = d["load_n"]

    mat = MAT[d["material"]]
    E = mat["E"] * 1e6

    I = (b * t**3) / 12
    A = b * t
    Z = I / (t / 2)
    r = math.sqrt(I / A)

    # stresses
    M = F * L
    bending = M / Z / 1e6
    shear = (1.5 * F / A) / 1e6
    vm = math.sqrt(bending**2 + 3 * shear**2)

    # buckling
    Pcr = (math.pi**2 * E * I) / (4 * L**2)

    # slenderness
    slenderness = L / r

    # deflection
    delta = (F * L**3) / (3 * E * I) * 1000

    # natural freq
    mass = mat["rho"] * A * L
    k = (E * I) / (L**3)
    omega = math.sqrt(k / mass)
    fn = omega / (2 * math.pi)

    fos = mat["sy"] / vm

    verdict = "SAFE" if fos >= 2 else "WARNING" if fos >= 1 else "FAIL"
    I = I * 1e12
    Z = Z * 1e9

    return {
        "moment_of_inertia": I,
        "section_modulus": Z,
        "bending_stress": bending,
        "shear_stress": shear,
        "von_mises": vm,
        "factor_of_safety": fos,
        "buckling_load": Pcr,
        "slenderness_ratio": slenderness,
        "displacement_mm": delta,
        "natural_freq": fn,
        "verdict": verdict,
    }

# DISPLAY RESULTS 
def display(results):
    print("\n📊 RESULTS\n" + "-"*40)

    for k, v in results.items():
        if isinstance(v, float):
            print(f"{k:25s}: {v:.4f}")
        else:
            print(f"{k:25s}: {v}")

# SAVE TO SUPABASE
def save_to_db(input_data, results):
    payload = {**input_data, **results}

    res = supabase.table("analysis_runs").insert(payload).execute()
    print("\n💾 Saved to Supabase!")

# MAIN
def main():
    data = get_input()
    results = compute(data)

    display(results)

    save_to_db(data, results)

if __name__ == "__main__":
    main()