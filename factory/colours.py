"""Customer colour choices. Only filament on hand: black, white, red, blue.
Each product exposes roles; a role recolours one or more named materials in the 3D model (material name = part key).
QR panels and codes are never exposed: dark code on a light panel is what makes them scan."""
PALETTE = {"black": "#1C1C1C", "white": "#F2F0EB", "red": "#B3262E", "blue": "#24489A"}
ALL = ["black", "white", "red", "blue"]

def role(key, label, materials, default, avoid=None, options=None):
    return dict(role=key, label=label, materials=materials, default=default, options=options or ALL, avoid=avoid)

def business(details_parts, body="body"):
    return [role("body", "Body", [body], "black"), role("details", "Details", details_parts, "white", avoid="body")]

SPECS = {
    "connect-display": business(["brand"]),
    "wifi-stand": business(["accent"]),
    "signature-nameplate": business(["letters"]),
    "brand-signature": business(["logo"]),
    "everyday-stand": business(["accent"]),
    "order-desk": business(["rim"]),
    "card-holder": business(["rim"]),
    "desk-set": business(["accent", "rim", "letters"]),
    "sports-car": [role("body", "Body", ["red_body"], "red"),
                   role("canopy", "Canopy & tyres", ["black_canopy"], "black"),
                   role("rims", "Rims", ["white_rims"], "white", avoid="canopy")],
    "mixtape": [role("shell", "Shell & stand", ["black_shell", "black_stand"], "black"),
                role("label", "Label", ["red_label"], "red", avoid="shell"),
                role("writing", "Writing & reels", ["white_ink", "white_reels"], "white", avoid="label")],
    "arena-court": [role("floor", "Floor", ["black_floor"], "black"),
                    role("lines", "Lines", ["white_lines"], "white", avoid="floor"),
                    role("key", "Key", ["red_key"], "red", avoid="floor"),
                    role("board", "Backboard & net", ["white_board", "white_net"], "white"),
                    role("rim", "Rim, pad & ball", ["red_rim", "red_square", "red_base", "red_ball"], "red", avoid="board"),
                    role("pole", "Pole", ["black_support"], "black")],
    "full-court": [role("floor", "Floor", ["black_floor"], "black"),
                   role("lines", "Lines", ["white_lines"], "white", avoid="floor"),
                   role("key", "Keys", ["blue_key"], "blue", avoid="floor"),
                   role("centre", "Centre circle", ["red_centre"], "red", avoid="floor"),
                   role("board", "Backboards & nets", ["white_board", "white_net"], "white"),
                   role("rim", "Rims & ball", ["red_rim", "red_square", "red_ball"], "red", avoid="board"),
                   role("pole", "Poles", ["black_support"], "black")],
}

def spec(slug):
    return SPECS.get(slug, [])

def material_colours(slug, chosen=None):
    """Material name -> colour name, for the defaults or a customer's choices."""
    out = {}
    for r in spec(slug):
        c = (chosen or {}).get(r["role"], r["default"])
        if c not in r["options"]: c = r["default"]
        for m in r["materials"]: out[m] = c
    return out
